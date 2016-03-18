// :copyright: Copyright (c) 2016 ftrack
import uuid from 'uuid';
import { call } from 'redux-saga/effects';

import {
    session, createOperation, queryOperation, updateOperation,
} from '../../ftrack_api';
import { mediator } from '../../application';

import loglevel from 'loglevel';
const logger = loglevel.getLogger('saga:lib:share');


// This is the `Upload` asset type, which is guaranteed to exist.
const _uploadTypeId = '8f4144e0-a8e6-11e2-9e96-0800200c9a66';

/**
 * Return promise which will be resolved with an array of two elements:
 *
 * Assets
 *     Array of assets either existing or to be created.
 * createOperations
 *     Array of API operations to create assets not existing on server.
 */
export function gatherAssets(assets) {
    const result = [...assets];

    const operations = [];
    for (const asset of result) {
        asset.type_id = asset.type_id || _uploadTypeId;
        operations.push(queryOperation(
            `select id from Asset where
            context_id is "${asset.context_id}" and
            type_id is "${asset.type_id}" and
            name is "${asset.name}"
            limit 1`
        ));
    }

    const request = session._call(operations);
    const createOperations = [];
    const promise = request.then((responses) => {
        for (let i = 0; i < responses.length; i += 1) {
            const asset = responses[i].data && responses[i].data[0];
            if (asset) {
                result[i].id = asset.id;
                logger.info('Existing asset', result[i].id);
            } else {
                result[i].id = uuid.v4();
                logger.info('New asset', result[i].id);

                createOperations.push(createOperation(
                    'Asset', Object.assign({}, result[i])
                ));
            }
        }
        return Promise.resolve([result, createOperations]);
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

/**
 * Finalize uploaded component data.
 *
 * Create ComponentLocation objects.
 * Create review-specific Metadata.
 */
export function* finalizeUpload(componentIds, updateData = null) {
    const operations = [];
    const serverLocationId = '3a372bde-05bc-11e4-8908-20c9d081909b';

    for (const componentId of componentIds) {
        operations.push(
            createOperation('ComponentLocation', {
                component_id: componentId,
                location_id: serverLocationId,
                resource_identifier: componentId,
            })
        );

        // TODO: Update this if components are being encoded.
        if (updateData) {
            operations.push(updateOperation(
                'FileComponent', [componentId], updateData
            ));
        }
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

export function* uploadReviewMedia(media) {
    const uploadMeta = yield call(getUploadMetadata, media);
    logger.debug('Prepared upload', uploadMeta);

    let responses = yield call(uploadMedia, uploadMeta);
    logger.debug('Uploaded', responses);

    const componentIds = Object.keys(uploadMeta);
    responses = yield call(
        finalizeUpload, componentIds, { name: 'ftrackreview-image' }
    );
    logger.debug('Finalized upload', responses);
    return componentIds;
}


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

