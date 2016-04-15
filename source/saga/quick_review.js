// :copyright: Copyright (c) 2016 ftrack

import moment from 'moment';
import uuid from 'uuid';

import { takeEvery } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import { hashHistory } from 'react-router';
import { reset } from 'redux-form';

import { session } from '../ftrack_api';
import {
    createOperation, updateOperation,
} from '../ftrack_api/operation';
import actions from 'action/quick_review';

import { showProgress, showCompletion, showFailure } from './lib/overlay';
import {
    getUploadMetadata, uploadMedia, updateComponentVersions,
} from './lib/share';

import { mediator } from '../application';

import loglevel from 'loglevel';
const logger = loglevel.getLogger('saga:quick_review');


/** Return array with assetId and create operations for *contextId* and *name*. */
function getAsset(contextId, name) {
    // This is the `Upload` asset type, which is guaranteed to exist.
    const assetTypeId = '8f4144e0-a8e6-11e2-9e96-0800200c9a66';
    let assetId = null;

    const query = (
        `select id from Asset where
        context_id is "${contextId}" and
        type_id is "${assetTypeId}" and
        name is "${name}"
        limit 1`
    );

    const request = session._query(query);
    const createOperations = [];
    const promise = request.then((response) => {
        logger.info(response);
        const asset = response.data.length && response.data[0];
        if (asset) {
            logger.info('Asset ', asset.id);
            assetId = asset.id;
        } else {
            logger.info('No asset ');

            assetId = uuid.v4();
            createOperations.push(createOperation('Asset', {
                id: assetId,
                name,
                context_id: contextId,
                type_id: assetTypeId,
            }));
        }
        return Promise.resolve([assetId, createOperations]);
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

    const componentIds = Object.keys(media);
    const versionId = uuid.v4();
    let assetName = null;
    let thumbnailId = null;
    const componentVersions = [];

    // Loop over components and find asset name based on media use.
    for (const componentId of componentIds) {
        const componentData = media[componentId];
        logger.debug(componentData.media.use);
        if (componentData.media.use === 'video-review') {
            assetName = componentData.name;
        } else if (componentData.media.use === 'image-review') {
            assetName = componentData.name;
            thumbnailId = componentId;
        } else if (componentData.media.use === 'thumbnail') {
            thumbnailId = componentId;
        }

        componentVersions.push({ componentId, versionId });
    }

    // Get existing or create new assets for media.
    const [assetId, createAssetOperations] = yield call(
        getAsset,
        values.project, assetName
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

    // TODO: Update this once you can select task in spark.
    const taskId = null;

    operations.push(createOperation('AssetVersion', {
        id: versionId,
        thumbnail_id: thumbnailId,
        asset_id: assetId,
        status_id: null,
        task_id: taskId,
    }));

    operations.push(createOperation('ReviewSessionObject', {
        name: assetName,
        description: null,
        version: null,
        version_id: versionId,
        review_session_id: reviewSessionId,
    }));

    const collaborators = values.collaborators.slice();

    // Add current user as invitee.
    const response = yield call(
        [session, session._query],
        `select first_name, last_name, email from User where username is "${session._apiUser}"`
    );
    if (response && response.data && response.data.length) {
        const user = response.data[0];
        const exists = collaborators.find(
            collaborator => collaborator.email === user.email
        );

        if (!exists) {
            collaborators.push({
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
            });
        }
    }

    const reviewSessionInviteeIds = [];
    for (const invitee of collaborators) {
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

/** Finalize *uploadMeta* by adding components to location and setting metadata for review. */
export function* finalizeUpload(uploadMeta) {
    const operations = [];
    const serverLocationId = '3a372bde-05bc-11e4-8908-20c9d081909b';
    const componentIds = Object.keys(uploadMeta);

    for (const componentId of componentIds) {
        operations.push(
            createOperation('ComponentLocation', {
                component_id: componentId,
                location_id: serverLocationId,
                resource_identifier: componentId,
            })
        );

        const componentData = uploadMeta[componentId];
        logger.debug(componentData.media.use);
        if (componentData.media.use === 'video-review') {
            const metadata = componentData.media.metadata;
            operations.push(updateOperation(
                'FileComponent', [componentId], { name: 'ftrackreview-mp4' }
            ));
            operations.push(
                createOperation('Metadata', {
                    parent_id: componentId,
                    parent_type: 'FileComponent',
                    key: 'ftr_meta',
                    value: JSON.stringify(
                        {
                            frameRate: metadata.fps,
                            frameIn: 0,
                            frameOut: metadata.frames - 1,
                        }
                    ),
                })
            );
        } else if (componentData.media.use === 'image-review') {
            operations.push(updateOperation(
                'FileComponent', [componentId], { name: 'ftrackreview-image' }
            ));
            operations.push(
                createOperation('Metadata', {
                    parent_id: componentId,
                    parent_type: 'FileComponent',
                    key: 'ftr_meta',
                    value: '{"format": "image"}',
                })
            );
        }
    }

    yield call(
        [session, session._call], operations
    );
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
        logger.debug('Gathered media', media[0]);

        yield showProgress('Preparing upload...');
        const uploadMeta = yield call(getUploadMetadata, media);
        logger.debug('Prepared upload', uploadMeta);

        yield showProgress('Uploading...');
        responses = yield call(uploadMedia, uploadMeta);
        logger.debug('Uploaded', responses);

        yield showProgress('Finalizing upload...');
        responses = yield call(
            finalizeUpload, uploadMeta
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
            hashHistory.replace('/');
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
