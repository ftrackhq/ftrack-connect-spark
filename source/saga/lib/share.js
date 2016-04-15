// :copyright: Copyright (c) 2016 ftrack
import uuid from 'uuid';
import { call } from 'redux-saga/effects';

import { session } from '../../ftrack_api';
import {
    createOperation, updateOperation,
} from '../../ftrack_api/operation';
import { mediator } from '../../application';

import loglevel from 'loglevel';
const logger = loglevel.getLogger('saga:lib:share');


// This is the `Upload` asset type, which is guaranteed to exist.
const _uploadTypeId = '8f4144e0-a8e6-11e2-9e96-0800200c9a66';

/** Return array with assetId and create operations for *contextId* and *name*. */
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
 * Create file components and retrieve upload meta data for array of *media*.
 *
 * Return object mapping component ids to component and upload data.
 */
export function* getUploadMetadata(media) {
    const operations = [];

    const result = {};
    const mediaLookup = {};

    for (const file of media) {
        const componentId = uuid.v4();
        mediaLookup[componentId] = file;
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
        result[uploadMetadataResult.component_id].media = mediaLookup[
            uploadMetadataResult.component_id
        ];
    }
    logger.debug('Get upload metadata result', result);
    return result;
}

/** Upload component data through mediator for each item in *uploadMeta*. */
export function* uploadMedia(uploadMeta) {
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
 * Upload *media* for review.
 *
 * .. note::
 *      Currently assumes that the media is  pre-encoded images.
 */
export function* uploadReviewMedia(media) {
    const uploadMeta = yield call(getUploadMetadata, media);
    logger.debug('Prepared upload', uploadMeta);

    let responses = yield call(uploadMedia, uploadMeta);
    logger.debug('Uploaded', responses);

    const componentIds = Object.keys(uploadMeta);
    responses = yield call(
        finalizeUpload, uploadMeta
    );
    logger.debug('Finalized upload', responses);
    return componentIds;
}


/**
 * Update components to be part of versions.
 *
 * *componentVersions* should be array of objects with componentId and
 * versionId keys.
 */
export function* updateComponentVersions(componentVersions) {
    // TODO: Move this logic to previous batch once the issues in API backend
    // has been resolved.
    // Update file components seperatly as it causes integrity errors
    // due to a bug in the API backend.
    const operations = [];
    for (const componentVersion of componentVersions) {
        // TODO: Update this once components are being encoded.
        operations.push(updateOperation(
            'FileComponent', [componentVersion.componentId], {
                version_id: componentVersion.versionId,
            }
        ));
    }
    logger.debug('Update component operations', operations);
    const responses = yield call(
        [session, session._call],
        operations
    );
    logger.debug('Update component responses', responses);
    return true;
}

