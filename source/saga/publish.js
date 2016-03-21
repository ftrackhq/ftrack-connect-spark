// :copyright: Copyright (c) 2016 ftrack

import { takeEvery } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import uuid from 'uuid';

import { mediator } from '../application';
import actions, { publishOptions } from 'action/publish';
import {
    showProgress, hideOverlay, showCompletion, showFailure,
} from './lib/overlay';
import { gatherAssets, uploadReviewMedia, updateComponentVersions } from './lib/share';
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
            true, 10
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
    const assetData = {
        context_id: values.context, name: values.name, type_id: values.type,
    };
    const [assets, createAssetsOperations] = yield call(
        gatherAssets, [assetData]
    );

    const assetId = assets[0].id;
    const versionId = uuid.v4();
    // TODO: Update this once you can select task in spark.
    const taskId = null;

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

    logger.info('Creating components', components);
    return session.eventHub.publish(
        new Event('ftrack.spark.publish-components', { components }),
        true, 10
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
        const reviewableMedia = media.filter((file) => file.use === 'review');
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


/** Prepare publish on PUBLISH_LOAD */
export function* publishLoadSaga() {
    yield takeEvery(actions.PUBLISH_LOAD, preparePublish);
}

/** Prepare publish on PUBLISH_LOAD */
export function* publishSubmitSaga() {
    yield takeEvery(actions.PUBLISH_SUBMIT, submitPublish);
}
