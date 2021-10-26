// :copyright: Copyright (c) 2016 ftrack

import { call, put, takeEvery } from 'redux-saga/effects';

import { mediator } from '../application';
import actions, { publishOptions, publishResolveContext } from 'action/publish';
import {
    showProgress, hideOverlay, showCompletion, showFailure,
} from './lib/overlay';
import { getState, saveState } from '../util/local_storage';

import { session } from '../ftrack_api';
import { error as apiError } from 'ftrack-javascript-api';
import { CreateComponentsHookError } from '../error';

import loglevel from 'loglevel';
const logger = loglevel.getLogger('saga:publish');

const uploadAssetTypeId = '8f4144e0-a8e6-11e2-9e96-0800200c9a66';
const getLastAssetTypeId = getState.bind(null, 'last-asset-type-id', uploadAssetTypeId);
const setLastAssetTypeId = saveState.bind(null, 'last-asset-type-id');

/**
 * Prepare publish
 */
function* preparePublish(action) {
    const { onComplete } = action.payload;
    logger.info('Prepare publish', action.payload);
    yield showProgress(
        'Preparing publish...',
        { message: 'Gathering options from application...' }
    );

    const options = yield call(
        [mediator, mediator.getPublishOptions],
        { metadata: ['asset_id'] }
    );
    logger.debug('Gathered options', options);

    // This is the `Upload` asset type, which is guaranteed to exist.
    options.type = options.type || getLastAssetTypeId();
    try {
        if (options.metadata && options.metadata.asset_id) {
            const result = yield session.query(
                // eslint-disable-next-line max-len
                `select name, context_id, type_id, parent.link from Asset where id is "${options.metadata.asset_id}" limit 1`
            );
            if (result.data.length) {
                options.name = result.data[0].name;
                options.type = result.data[0].type_id;
                options.parent = result.data[0].context_id;
                options.link = result.data[0].parent.link.map(item => item.name);
                options.assets = result.data;
            }
        }
    } catch (err) {
        logger.error('Failed to read asset from metadata', options.metadata);
    }

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
        const contextId = values.task || values.parent;
        logger.info('Publishing..', values);
        if (values.type) {
            setLastAssetTypeId(values.type);
        }

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

        // Reload published assets
        yield put(publishResolveContext(contextId));
    } catch (error) {
        logger.error(error);
        let message;

        if (error instanceof apiError.EventServerReplyTimeoutError) {
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

    const result = yield session.query(
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

        const existingAssetsResults = yield session.query(
            'select name, type_id, type.name from Asset where context_id is '
            + `"${parentId}" order by name limit 100`
        );
        yield put(publishOptions({
            assets: existingAssetsResults.data,
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
