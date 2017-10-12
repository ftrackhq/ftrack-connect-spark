// :copyright: Copyright (c) 2016 ftrack
import uuid from 'uuid';

import { operation, Event } from 'ftrack-javascript-api';

import { session } from '../../ftrack_api';
import { CreateComponentsHookError } from '../../error';

import { store, mediator } from '../';
import { overlayShow } from 'action/overlay';

import loglevel from 'loglevel';
const logger = loglevel.getLogger('application:lib:share');

// This is the `Upload` asset type, which is guaranteed to exist.
const _uploadTypeId = '8f4144e0-a8e6-11e2-9e96-0800200c9a66';

/** Dispatch progress actions */
export function showProgress(options) {
    store.dispatch(overlayShow(
        Object.assign({
            header: null,
            message: null,
            loader: true,
            dismissable: true,
            dismissLabel: 'Cancel',
        }, options)
    ));
}

/** Dispatch failure action */
export function showFailure(options) {
    store.dispatch(overlayShow(
        Object.assign({
            header: null,
            message: null,
            loader: false,
            dismissable: true,
            dismissLabel: 'Close',
        }, options)
    ));
}

export function ensureConnectIsRunning() {
    return session.eventHub.publishAndWaitForReply(
        new Event('ftrack.connect.discover', {}),
        { timeout: 15 }
    ).then((isConnectRunning) => {
        logger.debug('Connect discover: ', isConnectRunning);
        return Promise.resolve(true);
    }).catch((error) => {
        showFailure({
            header: 'Failed communicate with Connect',
            message: 'Please ensure ftrack Connect is running.',
            details: error.message,
        });
    });
}


/**
 * Return Promise resolved with array containing
 * assetId and create operations for *contextId* and *name*.
 */
export function getAsset(contextId, name, typeId) {
    let assetId = null;
    const assetTypeId = typeId || _uploadTypeId;

    const query = (
        `select id from Asset where
        context_id is "${contextId}" and
        type_id is "${assetTypeId}" and
        name is "${name}"
        limit 1`
    );

    const request = session.query(query);
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
            createOperations.push(operation.create('Asset', {
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
 * Create file components and retrieve upload meta data for array of *media*.
 *
 * Return Promise resolved with object mapping component ids to component and upload data.
 */
export function getUploadMetadata(media) {
    const operations = [];

    const result = {};

    for (const file of media) {
        const componentId = uuid.v4();
        result[componentId] = Object.assign({}, file);
        operations.push(
            operation.create('FileComponent', {
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

    const promise = session.call(operations).then((responses) => {
        logger.debug('Get upload metadata responses', responses);
        for (let i = 0; i < responses.length; i += 2) {
            const componentResult = responses[i].data;
            const uploadMetadataResult = responses[i + 1];
            result[uploadMetadataResult.component_id].component = componentResult;
            result[uploadMetadataResult.component_id].upload = uploadMetadataResult;
        }
        logger.debug('Get upload metadata result', result);
        return Promise.resolve(result);
    });

    return promise;
}

/**
 * Upload component data through mediator for each item in *uploadMeta*.
 *
 * Return Promise resolved once all uploads complete.
 */
export function uploadMedia(uploadMeta) {
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
    return Promise.all(promises);
}

/**
 * Finalize *uploadMeta* by adding components to location and setting metadata for review.
 *
 * Return API promise, resolved once operations are completed.
 */
export function finalizeUpload(uploadMeta) {
    const operations = [];
    const serverLocationId = '3a372bde-05bc-11e4-8908-20c9d081909b';
    const componentIds = Object.keys(uploadMeta);

    for (const componentId of componentIds) {
        operations.push(
            operation.create('ComponentLocation', {
                component_id: componentId,
                location_id: serverLocationId,
                resource_identifier: componentId,
            })
        );

        const componentData = uploadMeta[componentId];
        if (componentData.use === 'video-review') {
            const metadata = componentData.metadata;
            operations.push(operation.update(
                'FileComponent', [componentId], { name: 'ftrackreview-mp4' }
            ));
            operations.push(
                operation.create('Metadata', {
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
        } else if (componentData.use === 'image-review') {
            operations.push(operation.update(
                'FileComponent', [componentId], { name: 'ftrackreview-image' }
            ));
            operations.push(
                operation.create('Metadata', {
                    parent_id: componentId,
                    parent_type: 'FileComponent',
                    key: 'ftr_meta',
                    value: '{"format": "image"}',
                })
            );
        }
    }

    return session.call(operations);
}

/**
 * Upload *media* for review.
 *
 * .. note::
 *      Currently assumes that the media is pre-encoded images or video.
 *
 * Return Promise resolved once media encoded.
 */
export function uploadReviewMedia(media) {
    let uploadMeta;

    const promise = getUploadMetadata(media).then((_uploadMeta) => {
        uploadMeta = _uploadMeta;
        logger.debug('Prepared upload', uploadMeta);
        return uploadMedia(uploadMeta);
    }).then((responses) => {
        logger.debug('Uploaded', responses);
        return finalizeUpload(uploadMeta);
    }).then((responses) => {
        const componentIds = Object.keys(uploadMeta);
        logger.debug('Finalized upload', responses);
        return Promise.resolve(componentIds);
    });

    return promise;
}


/**
 * Update components to be part of versions.
 *
 * *componentVersions* should be array of objects with componentId and
 * versionId keys.
 *
 * Return Promise resolved once components are updated.
 */
export function updateComponentVersions(componentVersions) {
    // TODO: Move this logic to previous batch once the issues in API backend
    // has been resolved.
    // Update file components seperatly as it causes integrity errors
    // due to a bug in the API backend.
    const operations = [];
    for (const componentVersion of componentVersions) {
        // TODO: Update this once components are being encoded.
        operations.push(operation.update(
            'FileComponent', [componentVersion.componentId], {
                version_id: componentVersion.versionId,
            }
        ));
    }
    logger.debug('Update component operations', operations);
    const promise = session.call(operations).then((responses) => {
        logger.debug('Update component responses', responses);
        return true;
    });

    return promise;
}


/**
 * Create version based on values.
 *
 * Will either create a new asset or version-up if one matching already exists.
 *
 * Return promise resolved with version id once the version has been created.
 */
export function createVersion(values, thumbnailId) {
    const versionId = uuid.v4();
    const taskId = values.task;

    const promise = getAsset(
        values.parent, values.name, values.type
    ).then(([assetId, createAssetsOperations]) => {
        const operations = [
            ...createAssetsOperations,
            operation.create('AssetVersion', {
                id: versionId,
                thumbnail_id: thumbnailId,
                asset_id: assetId,
                status_id: null,
                task_id: taskId,
                comment: values.description,
            }),
        ];

        logger.info('Create version operations', operations);
        return session.call(operations);
    }).then((responses) => {
        logger.info('Create version responses', responses);
        return Promise.resolve(versionId);
    });

    return promise;
}

/**
 * Create components
 *
 * Publish components using an event to trigger an ftrack connect hook.
 *
 * Return promise resolved once component publish is complete.
 */
export function createComponents(versionId, media) {
    const components = [];
    for (const file of media) {
        components.push({
            name: file.name,
            path: file.path,
            version_id: versionId,
        });
    }
    const filename = `${uuid.v4()}.json`;

    const promise = mediator.writeSecurePublishFile(
        filename, components
    ).then((result) => {
        logger.info('Creating components from config', result);
        return session.eventHub.publishAndWaitForReply(
            new Event(
                'ftrack.connect.publish-components',
                { components_config: result }
            ),
            { timeout: 3600 }
        );
    }).then((reply) => {
        if (!reply || !reply.data) {
            logger.info('Invalid response from publish-components', reply);
            const error = new CreateComponentsHookError('Invalid response from publish-components');
            return Promise.reject(error);
        } else if (!reply.data.success) {
            const error = new CreateComponentsHookError(
                `${reply.data.error_result.exception}: ${reply.data.error_result.content}`
            );
            return Promise.reject(error);
        }

        return Promise.resolve(reply);
    });

    return promise;
}
