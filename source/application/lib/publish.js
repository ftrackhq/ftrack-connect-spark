// :copyright: Copyright (c) 2016 ftrack

import uuid from 'uuid';

import { getAsset, uploadReviewMedia, updateComponentVersions } from '../../saga/lib/share';

import { session } from '../../ftrack_api';
import Event from '../../ftrack_api/event';
import { createOperation } from '../../ftrack_api/operation';
import { store } from '../';
import { overlayShow } from 'action/overlay';

import loglevel from 'loglevel';
const logger = loglevel.getLogger('application:lib:publish');


function showProgress(options) {
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


/** Create version */
function createVersion(values, thumbnailId) {
    const versionId = uuid.v4();
    const taskId = values.task;

    const promise = getAsset(
        values.parent, values.name, values.type
    ).then(([assetId, createAssetsOperations]) => {
        const operations = [
            ...createAssetsOperations,
            createOperation('AssetVersion', {
                id: versionId,
                thumbnail_id: thumbnailId,
                asset_id: assetId,
                status_id: null,
                task_id: taskId,
                comment: values.description,
            }),
        ];

        logger.info('Create version operations', operations);
        return session._call(operations);
    }).then((responses) => {
        logger.info('Create version responses', responses);
        return Promise.resolve(versionId);
    });

    return promise;
}

/** Create components */
function createComponents(versionId, media) {
    const components = [];
    for (const file of media) {
        components.push({
            name: file.name,
            path: file.path,
            version_id: versionId,
        });
    }

    logger.info('Creating components', components);
    return session.eventHub.publish(
        new Event('ftrack.connect.publish-components', { components }),
        { reply: true, timeout: 240 }
    );
}

export default {
    showProgress,
    createVersion,
    createComponents,
    uploadReviewMedia,
    updateComponentVersions,
};
