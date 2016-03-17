// :copyright: Copyright (c) 2016 ftrack

import { takeEvery } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import uuid from 'uuid';

import actions, { publishOptions } from 'action/publish';
import { showProgress, hideOverlay, showFailure } from './lib/overlay';
import { mediator } from '../application';
import { gatherAssets } from './lib/share';
import {
    session, createOperation, updateOperation, queryOperation,
} from '../ftrack_api';

import loglevel from 'loglevel';
const logger = loglevel.getLogger('saga:publish');


/**
 * Prepare publish
 */
function* preparePublish() {
    logger.info('Prepare publish');
    yield showProgress('Preparing publish...');

    // TODO: Ensure connect is running

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

/**
 * Submit publish
 */
function* submitPublish(action) {
    logger.info('Submit publish');
    const values = action.payload;

    yield showProgress('Exporting media...');
    const exportMediaOptions = { reviewable: true, deliverable: true };
    const media = yield call(
        [mediator, mediator.exportMedia], exportMediaOptions
    );
    logger.info('Exported media', media);

    const reviewableMedia = media.filter((file) => file.use === 'review');
    const deliverableMedia = media.filter((file) => file.use === 'delivery');

    // Get-or-create asset
    const assetData = {
        context_id: values.contextId, name: values.name, type: values.type,
    };
    const [assets, createAssetsOperations] = yield call(
        gatherAssets, [assetData]
    );

    const assetId = assets[0].id;
    const versionId = uuid.v4();
    // TODO: Update this once you can select task in spark.
    const taskId = null;
    // TODO: Update this once a component is being encoded.
    const thumbnailId = null;

    const operations = [
        ...createAssetsOperations,
        createOperation('AssetVersion', {
            id: versionId,
            thumbnail_id: thumbnailId,
            asset_id: assetId,
            status_id: null,
            task_id: taskId,
        }),
    ];

    logger.debug('Create version operations', operations);
    const responses = yield call(
        [session, session._call],
        operations
    );
    logger.debug('Create version responses', responses);

    // Parallel:

        // TODO: Export data using specified options
        //  * Original file
        //  (Future: * Full-size JPEG)
        //  * Web-playable media (review + thumbnail)

        // TODO: Get-or-create asset
        // TODO: Create asset version

    // Parallel:
        // TODO: Upload and create reviewable media

        // TODO: Publish create-component event with data
        // TODO: Await event response
    logger.info('Finished publish');
}


/** Prepare publish on PUBLISH_LOAD */
export function* publishLoadSaga() {
    yield takeEvery(actions.PUBLISH_LOAD, preparePublish);
}

/** Prepare publish on PUBLISH_LOAD */
export function* publishSubmitSaga() {
    yield takeEvery(actions.PUBLISH_SUBMIT, submitPublish);
}
