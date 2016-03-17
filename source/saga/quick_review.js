// :copyright: Copyright (c) 2016 ftrack

import moment from 'moment';
import uuid from 'uuid';

import { takeEvery } from 'redux-saga';
import { call, put, take } from 'redux-saga/effects';
import { browserHistory } from 'react-router';

import {
    session, createOperation, updateOperation, queryOperation,
} from '../ftrack_api';
import actions from 'action/quick_review';
import overlayActions, { overlayShow } from 'action/overlay';

import { mediator } from '../application';

import loglevel from 'loglevel';
const logger = loglevel.getLogger('saga:quick_review');


/**
 * Return guessed invitee name from *email*
 *
 * Retrieves the part before the at sign, replaces separators with space
 * and transform to title case.
 */
function guessInviteeName(email) {
    let name = email.split('@')[0];
    name = name.replace(/[._-]/g, ' ').replace(/\s\s+/g, ' ');
    name = name.replace(
        /\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
    );
    return name;
}

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
    let operations = [];
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

    const emails = values.collaborators.split(',').map((value) => value.trim());
    const reviewSessionInviteeIds = [];
    for (const email of emails) {
        if (email.includes('@')) {
            const inviteeName = guessInviteeName(email);
            const reviewSessionInviteeId = uuid.v4();
            reviewSessionInviteeIds.push(reviewSessionInviteeId);

            operations.push(createOperation('ReviewSessionInvitee', {
                id: reviewSessionInviteeId,
                review_session_id: reviewSessionId,
                email,
                name: inviteeName,
            }));
        }
    }

    logger.debug('Create Quick Review operations', operations);
    let responses = yield call(
        [session, session._call],
        operations
    );
    logger.debug('Create Quick Review responses', responses);

    // TODO: Move this logic to previous batch once the issues in API backend
    // has been resolved.
    // Update file components seperatly as it causes integrity errors
    // due to a bug in the API backend.
    operations = [];
    for (const componentVersion of componentVersions) {
        // TODO: Update this once components are being encoded.
        operations.push(updateOperation(
            'FileComponent', [componentVersion.componentId], {
                version_id: componentVersion.versionId,
            }
        ));
    }
    logger.debug('Update component operations', operations);
    responses = yield call(
        [session, session._call],
        operations
    );
    logger.debug('Update component responses', responses);

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

/** Dispatch a show overlay action with *header* and a progress-style layout. */
function* showProgress(header) {
    yield put(overlayShow({
        header,
        message: 'This may take a few minutes. Please keep this window open until finished.',
        loader: true,
    }));
}

/**
 * Create file components and retrieve upload meta data for array of *media*.
 *
 * Return object mapping component ids to component and upload data.
 */
function* getUploadMetadata(media) {
    const operations = [];

    const result = {};
    for (const file of media) {
        const componentId = uuid.v4();
        result[componentId] = Object.assign({}, file);
        operations.push(
            createOperation('FileComponent', {
                id: componentId,
                name: file.name,
                size: file.size,
                file_type: file.extension,
            })
        );
        operations.push({
            action: 'get_upload_metadata',
            component_id: componentId,
        });
    }
    const responses = yield call(
        [session, session._call], operations
    );

    logger.debug('Get upload metadata responses', responses);
    for (let i = 0; i < responses.length; i += 2) {
        const componentResult = responses[i].data;
        const uploadMetadataResult = responses[i + 1];
        result[uploadMetadataResult.component_id].component = componentResult;
        result[uploadMetadataResult.component_id].upload = uploadMetadataResult;
    }
    logger.debug('Get upload metadata result', result);
    return result;
}

/** Upload component data through mediator for each item in *uploadMeta*. */
function* uploadMedia(uploadMeta) {
    const promises = [];
    Object.keys(uploadMeta).forEach((componentId) => {
        const path = uploadMeta[componentId].path;
        const url = uploadMeta[componentId].upload.url;
        const headers = uploadMeta[componentId].upload.headers;

        logger.debug('Uploading media', path, url, headers);
        promises.push(
            mediator.uploadMedia({ path, url, headers })
        );
    });
    yield Promise.all(promises);
}

/** Show completed overlay and redirect to root once closed. */
function* showCompletion() {
    yield put(overlayShow({
        header: 'Completed',
        message: 'The review session has now been created.',
        dissmissable: true,
    }));
    yield take(overlayActions.OVERLAY_HIDE);
    browserHistory.replace('/');
}

/** Show completed overlay and redirect to root once closed. */
function* showFailure(error) {
    yield put(overlayShow({
        header: 'Failed to create review',
        message: 'Please try again or contact support with the following details',
        error: error && error.message || '',
        dissmissable: true,
    }));
    yield take(overlayActions.OVERLAY_HIDE);
}

/**
 * Finalize uploaded component data.
 *
 * Create ComponentLocation objects.
 * Create review-specific Metadata.
 */
function* finalizeUpload(uploadMeta) {
    const operations = [];
    const serverLocationId = '3a372bde-05bc-11e4-8908-20c9d081909b';

    for (const componentId of Object.keys(uploadMeta)) {
        operations.push(
            createOperation('ComponentLocation', {
                component_id: componentId,
                location_id: serverLocationId,
                resource_identifier: componentId,
            })
        );

        // TODO: Update this if components are being encoded.
        operations.push(updateOperation(
            'FileComponent', [componentId], {
                name: 'ftrackreview-image',
            }
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
        const media = yield call([mediator, mediator.exportReviewableMedia], {});
        logger.debug('Gathered media', media);

        yield showProgress('Preparing upload...');
        const uploadMeta = yield call(getUploadMetadata, media);
        logger.debug('Prepared upload', uploadMeta);

        yield showProgress('Uploading...');
        responses = yield call(uploadMedia, uploadMeta);
        logger.debug('Uploaded', responses);

        yield showProgress('Finalizing upload...');
        responses = yield call(finalizeUpload, uploadMeta);
        logger.debug('Finalized upload', responses);

        yield showProgress('Creating review session...');
        const reviewSessionInviteeIds = yield call(
            createQuickReview, values, uploadMeta
        );
        logger.debug('Created objects', reviewSessionInviteeIds);

        yield showProgress('Sending out invites...');
        responses = yield sendInvites(reviewSessionInviteeIds);
        logger.debug('Sent invites', responses);

        yield call(showCompletion);
    } catch (error) {
        yield call(showFailure, error);
    }
}

/** Run submitQuickReview on QUICK_REVIEW_SUBMIT */
export function* quickReviewSubmitSaga() {
    yield takeEvery(actions.QUICK_REVIEW_SUBMIT, submitQuickReview);
}
