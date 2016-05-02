// :copyright: Copyright (c) 2016 ftrack

import { takeEvery } from 'redux-saga';
import { call, put } from 'redux-saga/effects';

import { mediator } from '../application';
import actions, { publishOptions } from 'action/publish';
import {
    showProgress, hideOverlay, showCompletion, showFailure,
} from './lib/overlay';
import { session } from '../ftrack_api';
import Event from '../ftrack_api/event';

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

/**
 * Submit publish
 */
function* submitPublish(action) {
    try {
        const values = action.payload;
        logger.info('Publishing..', values);

        const result = yield call([mediator, mediator.publish], values, {
            progress: showProgress,
            failure: showFailure,
        });

        logger.info('Finished publish', result);
        yield call(showCompletion, {
            header: 'Completed',
            message: 'The versions has been published.',
        }, () => {
            logger.info('Complete');
        });
    } catch (error) {
        logger.error(error);
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
