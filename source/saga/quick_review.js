// :copyright: Copyright (c) 2016 ftrack

import uuid from 'uuid';

import { takeEvery } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import { hashHistory } from 'react-router';
import { reset } from 'redux-form';

import { session } from '../ftrack_api';
import { createOperation } from '../ftrack_api/operation';
import actions from 'action/quick_review';

import { showProgress, showCompletion, showFailure } from './lib/overlay';
import {
    getUploadMetadata, uploadMedia, updateComponentVersions, finalizeUpload, getAsset,
} from './lib/share';
import { ServerPermissionDeniedError } from '../error';

import { mediator } from '../application';

import loglevel from 'loglevel';
const logger = loglevel.getLogger('saga:quick_review');


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
        end_date: values.expiryDate,
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
        let message = 'Could not create the review session, please verify the form and try again';

        if (error instanceof ServerPermissionDeniedError) {
            message = (
                'You\'re not permitted to create a review session on the ' +
                'selected project'
            );
        }

        yield call(
            showFailure,
            {
                header: 'Failed to create review session',
                message,
                details: error.message,
            });
    }
}

/** Run submitQuickReview on QUICK_REVIEW_SUBMIT */
export function* quickReviewSubmitSaga() {
    yield takeEvery(actions.QUICK_REVIEW_SUBMIT, submitQuickReview);
}
