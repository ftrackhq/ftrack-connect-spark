// :copyright: Copyright (c) 2016 ftrack

import moment from 'moment';
import uuid from 'uuid';

import { takeEvery } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import { hashHistory } from 'react-router';
import { reset } from 'redux-form';

import { session } from '../ftrack_api';
import {
    createOperation, queryOperation,
} from '../ftrack_api/operation';
import actions from 'action/quick_review';

import { showProgress, showCompletion, showFailure } from './lib/overlay';
import {
    getUploadMetadata, uploadMedia, finalizeUpload, updateComponentVersions,
} from './lib/share';

import { mediator } from '../application';

import loglevel from 'loglevel';
const logger = loglevel.getLogger('saga:quick_review');


/**
 * Return promise which will be resolved with an array of two elements:
 *
 * componentAssets
 *     Array of objects containing { componentId, assetId } for existing and
 *     new assets.
 * createOperations
 *     Array of API operations to create assets not existing on server.
 */
function gatherAssets(contextId, media) {
    // This is the `Upload` asset type, which is guaranteed to exist.
    const assetTypeId = '8f4144e0-a8e6-11e2-9e96-0800200c9a66';
    const operations = [];
    const componentAssets = Object.keys(media).map(
        (componentId) => ({ componentId, name: media[componentId].name }));

    for (const componentAsset of componentAssets) {
        const name = componentAsset.name;
        operations.push(queryOperation(
            `select id from Asset where
            context_id is "${contextId}" and
            type_id is "${assetTypeId}" and
            name is "${name}"
            limit 1`
        ));
    }

    const request = session._call(operations);
    const createOperations = [];
    const promise = request.then((responses) => {
        for (let i = 0; i < responses.length; i += 1) {
            logger.info(responses);
            const asset = responses[i].data && responses[i].data[0];
            if (asset) {
                logger.info('Asset ', asset.id);
                componentAssets[i].assetId = asset.id;
            } else {
                logger.info('No asset ');

                componentAssets[i].assetId = uuid.v4();
                createOperations.push(createOperation('Asset', {
                    id: componentAssets[i].assetId,
                    name: componentAssets[i].name,
                    context_id: contextId,
                    type_id: assetTypeId,
                }));
            }
        }
        return Promise.resolve([componentAssets, createOperations]);
    });

    return promise;
}

/**
 * Create quick review from form *values* and *media*.
 *
 * Creates the following entities in ftrack
 *
 * - ReviewSession
 * - for each component in *media*
 *     ReviewSessionObject
 *     Asset
 *         AssetVersion
 * - for each collaborator
 *     ReviewSessionInvitee
 *
 * Also update all components in *media* to be children of the created versions.
 */
function* createQuickReview(values, media) {
    const operations = [];
    const oneYear = moment().add(1, 'year');

    // Get existing or create new assets for media.
    const [componentAssets, createAssetOperations] = yield call(
        gatherAssets,
        values.project, media
    );
    operations.push(...createAssetOperations);

    const reviewSessionId = uuid.v4();
    operations.push(createOperation('ReviewSession', {
        id: reviewSessionId,
        project_id: values.project,
        name: values.name,
        description: values.description || '',
        end_date: values.expiryDate || oneYear,
    }));

    const componentVersions = [];
    for (const componentAsset of componentAssets) {
        const componentId = componentAsset.componentId;
        const assetId = componentAsset.assetId;
        const fileName = componentAsset.name;

        const versionId = uuid.v4();
        // TODO: Update this once you can select task in spark.
        const taskId = null;
        // TODO: Update this once a component is being encoded.
        const thumbnailId = componentId;
        operations.push(createOperation('AssetVersion', {
            id: versionId,
            thumbnail_id: thumbnailId,
            asset_id: assetId,
            status_id: null,
            task_id: taskId,
        }));

        operations.push(createOperation('ReviewSessionObject', {
            name: fileName,
            description: null,
            version: null,
            version_id: versionId,
            review_session_id: reviewSessionId,
        }));

        componentVersions.push({ componentId, versionId });
    }

    const reviewSessionInviteeIds = [];
    for (const invitee of values.collaborators) {
        if (invitee.email.includes('@')) {
            const reviewSessionInviteeId = uuid.v4();
            reviewSessionInviteeIds.push(reviewSessionInviteeId);

            operations.push(createOperation('ReviewSessionInvitee', {
                id: reviewSessionInviteeId,
                review_session_id: reviewSessionId,
                email: invitee.email,
                name: invitee.name,
            }));
        }
    }

    logger.debug('Create Quick Review operations', operations);
    const responses = yield call(
        [session, session._call],
        operations
    );
    logger.debug('Create Quick Review responses', responses);

    // TODO: Move this logic to previous batch once the issues in API backend
    // has been resolved.
    // Update file components seperatly as it causes integrity errors
    // due to a bug in the API backend.
    yield updateComponentVersions(componentVersions);

    return reviewSessionInviteeIds;
}

/** Send invites for *reviewSessionInviteeIds*. */
function* sendInvites(reviewSessionInviteeIds) {
    const operations = [];
    for (const reviewSessionInviteeId of reviewSessionInviteeIds) {
        operations.push({
            action: 'send_review_session_invite',
            review_session_invitee_id: reviewSessionInviteeId,
        });
    }

    logger.debug('Send invites operations', operations);
    const responses = yield call(
        [session, session._call],
        operations
    );
    logger.debug('Send invites responses', responses);
}

/**
 * Handle submit quick review action.
 *
 * Upload media, create ftrack entities and send invitees
 *
 *
 */
function* submitQuickReview(action) {
    try {
        let responses;
        const values = action.payload;
        logger.debug('submitQuickReview', values);

        yield showProgress('Gathering media...');
        const media = yield call([mediator, mediator.exportMedia], {
            review: true,
            delivery: false,
        });
        logger.debug('Gathered media', media);

        yield showProgress('Preparing upload...');
        const uploadMeta = yield call(getUploadMetadata, media);
        logger.debug('Prepared upload', uploadMeta);

        yield showProgress('Uploading...');
        responses = yield call(uploadMedia, uploadMeta);
        logger.debug('Uploaded', responses);

        yield showProgress('Finalizing upload...');
        const componentIds = Object.keys(uploadMeta);
        responses = yield call(
            finalizeUpload, componentIds, { name: 'ftrackreview-image' }
        );
        logger.debug('Finalized upload', responses);

        yield showProgress('Creating review session...');
        const reviewSessionInviteeIds = yield call(
            createQuickReview, values, uploadMeta
        );
        logger.debug('Created objects', reviewSessionInviteeIds);

        yield showProgress('Sending out invites...');
        responses = yield sendInvites(reviewSessionInviteeIds);
        logger.debug('Sent invites', responses);

        yield call(showCompletion, {
            header: 'Completed',
            message: 'The review session has now been created.',
        }, () => {
            hashHistory.replace('/home');
        });

        // Reset the form.
        yield put(reset('quickReview'));
    } catch (error) {
        yield call(showFailure, { header: 'Failed to create review session', error });
    }
}

/** Run submitQuickReview on QUICK_REVIEW_SUBMIT */
export function* quickReviewSubmitSaga() {
    yield takeEvery(actions.QUICK_REVIEW_SUBMIT, submitQuickReview);
}
