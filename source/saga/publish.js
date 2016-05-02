// :copyright: Copyright (c) 2016 ftrack

import { takeEvery } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import uuid from 'uuid';

import { mediator } from '../application';
import actions, { publishOptions } from 'action/publish';
import {
    showProgress, hideOverlay, showCompletion, showFailure,
} from './lib/overlay';
import { getAsset, uploadReviewMedia, updateComponentVersions } from './lib/share';
import { session } from '../ftrack_api';
import Event from '../ftrack_api/event';
import { createOperation } from '../ftrack_api/operation';

import loglevel from 'loglevel';
const logger = loglevel.getLogger('saga:publish');


/**
 * Prepare publish
 */
function* preparePublish() {
    logger.info('Prepare publish');
    yield showProgress('Preparing publish...');

    try {
        const isConnectRunning = yield session.eventHub.publish(
            new Event('ftrack.connect.discover', {}),
            { reply: true, timeout: 15 }
        );
        logger.debug('Connect discover: ', isConnectRunning);
    } catch (error) {
        yield call(showFailure, {
            header: 'Failed communicate with Connect',
            message: 'Please ensure ftrack Connect is running.',
            error,
        });
    }
    // TODO: Get asset name
    const options = yield call([mediator, mediator.getPublishOptions], {});
    logger.debug('Gathered options', options);
    yield put(publishOptions(options));

    // TODO: Get export options
    // Future

    // TODO: Get preview information
    // Future

    logger.info('Finished preparing publish');
    yield hideOverlay();
}

/** Create version */
function* createVersion(values, thumbnailId) {
    const [assetId, createAssetsOperations] = yield call(
        getAsset, values.parent, values.name, values.type
    );

    const versionId = uuid.v4();
    const taskId = values.task;

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
    const responses = yield call(
        [session, session._call],
        operations
    );
    logger.info('Create version responses', responses);

    return versionId;
}

/** Create components */
function* createComponents(versionId, media) {
    const components = [];
    for (const file of media) {
        components.push({
            name: file.name,
            path: file.path,
            version_id: versionId,
        });
    }

    const filename = `${uuid.v4()}.json`;
    const result = yield call(
        [mediator, mediator.writeSecurePublishFile],
        filename,
        components
    );

    logger.info('Creating components from config', result);
    return session.eventHub.publish(
        new Event('ftrack.connect.publish-components', { components_config: result }),
        { reply: true, timeout: 240 }
    );
}

/**
 * Submit publish
 */
function* submitPublish(action) {
    try {
        logger.info('Submit publish');
        const values = action.payload;

        yield showProgress('Exporting media...');
        const media = yield call([mediator, mediator.exportMedia], {
            review: true,
            delivery: true,
        });
        logger.info('Exported media', media);
        const reviewableMedia = media.filter((file) => file.use.includes('review'));
        const deliverableMedia = media.filter((file) => file.use === 'delivery');

        yield showProgress('Uploading review media...');
        const componentIds = yield call(uploadReviewMedia, reviewableMedia);

        yield showProgress('Creating version...');
        const versionId = yield call(createVersion, values, componentIds[0]);

        const componentVersions = componentIds.map((componentId) => ({ componentId, versionId }));
        yield call(updateComponentVersions, componentVersions);

        yield showProgress('Publishing...');
        const reply = yield call(createComponents, versionId, deliverableMedia);
        logger.info('Finished publish', reply);

        yield call(showCompletion, {
            header: 'Completed',
            message: 'The versions has been published.',
        }, () => {
            logger.info('Complete');
        });
    } catch (error) {
        yield call(showFailure, {
            header: 'Publish failed',
            error,
        });
    }
}

/**
 * Resolve context.
 */
function* resolveContext(action) {
    const contextId = action.payload;

    const result = yield session._query(
        'select link, parent.id from Context where id is ' +
        `${contextId}`
    );

    const data = result.data;

    if (data && data.length === 1) {
        let parentId = null;
        let taskId = null;

        if (data[0].__entity_type__ === 'Task') {
            parentId = data[0].parent.id;
            taskId = data[0].id;
        } else {
            parentId = data[0].id;
        }

        const names = [];
        for (const item of data[0].link) {
            names.push(item.name);
        }

        yield put(publishOptions({
            parent: parentId,
            task: taskId,
            link: names,
        }));
    }
}

/** Prepare publish on PUBLISH_LOAD */
export function* publishLoadSaga() {
    yield takeEvery(actions.PUBLISH_LOAD, preparePublish);
}

/** Submit publish form on PUBLISH_SUBMIT */
export function* publishSubmitSaga() {
    yield takeEvery(actions.PUBLISH_SUBMIT, submitPublish);
}

/** Resolve publish context on PUBLISH_RESOLVE_CONTEXT */
export function* publishResolveContextSaga() {
    yield takeEvery(actions.PUBLISH_RESOLVE_CONTEXT, resolveContext);
}
