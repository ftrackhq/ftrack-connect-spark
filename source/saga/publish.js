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
import { EventServerReplyTimeoutError } from '../ftrack_api/error';
import { CreateComponentsHookError } from '../error';

import loglevel from 'loglevel';
const logger = loglevel.getLogger('saga:publish');


/**
 * Prepare publish
 */
function* preparePublish(action) {
    const onComplete = action.payload.onComplete;
    logger.info('Prepare publish');
    yield showProgress(
        'Preparing publish...',
        { message: 'Gathering options from application...' }
    );

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
            details: error.message,
        });
    }
    const options = yield call([mediator, mediator.getPublishOptions], {});
    logger.debug('Gathered options', options);
    yield put(publishOptions(options));

    logger.info('Finished preparing publish');
    yield hideOverlay();
    onComplete();
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
        let message;

        if (error instanceof EventServerReplyTimeoutError) {
            message = (
                'No response from ftrack Connect. Please ensure that ' +
                'ftrack Connect is running.'
            );
        }

        if (error instanceof CreateComponentsHookError) {
            message = (
                'ftrack Connect failed to publish the versions.'
            );
        }

        yield call(
            showFailure,
            {
                header: 'Publish failed',
                message,
                details: error.message,
            }
        );
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
