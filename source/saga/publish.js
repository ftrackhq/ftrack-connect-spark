// :copyright: Copyright (c) 2016 ftrack

import { takeEvery } from 'redux-saga';
import { call, put } from 'redux-saga/effects';

import actions, { publishOptions } from 'action/publish';
import { showProgress, hideOverlay, showFailure } from './lib/overlay';
import { mediator } from '../application';

import loglevel from 'loglevel';
const logger = loglevel.getLogger('saga:publish');


/**
 * Prepare publish
 */
function* preparePublish() {
    logger.info('preparePublish');
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
function* submitPublish() {
    logger.info('submitPublish');

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
}


/** Prepare publish on PUBLISH_LOAD */
export function* publishLoadSaga() {
    yield takeEvery(actions.PUBLISH_LOAD, preparePublish);
}

/** Prepare publish on PUBLISH_LOAD */
export function* publishSubmitSaga() {
    yield takeEvery(actions.PUBLISH_SUBMIT, submitPublish);
}
