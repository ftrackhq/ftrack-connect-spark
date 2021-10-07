// :copyright: Copyright (c) 2016 ftrack

import { call, put, takeLatest } from 'redux-saga/effects';
import { hashHistory } from 'react-router';
import compare from 'semver-compare';

import { store, mediator } from '../application';
import { session, configureSharedApiSession } from '../ftrack_api';
import {
    ftrackApiUserAuthenticated,
    ftrackApiAuthenticationFailed,
} from 'action/ftrack_api';
import actions, { applicationConfiguration } from 'action/application';
import { trackUsageEvent } from 'action/track_usage';

import {
    showProgress, hideOverlay, showCompletion,
} from './lib/overlay';

import loglevel from 'loglevel';
const logger = loglevel.getLogger('saga:startup');


/** Return API operation to query user details. */
function queryUserExpression(apiUser) {
    const userFields = [
        'email', 'first_name', 'is_active', 'last_name', 'resource_type',
        'username', 'thumbnail_id',
    ];
    return `
        select ${userFields.join()} from User
        where username is "${apiUser}"
    `;
}

/**
 * Startup saga
 *
 * On application startup, perform the following:
 *
 * Retrieve API Credentials
 * Configure and initialize the shared API instance
 * Request the current user object
 * Dispatch either one of the following actions:
 *     FTRACK_API_USER_AUTHENTICATE
 *     FTRACK_API_AUTHENTICATION_FAILED
 */
function* startup(action) {
    const { payload: { nextPathName } } = action;
    yield showProgress(null, { dismissable: false, message: null });
    let credentials = null;

    try {
        credentials = yield call([mediator, mediator.getCredentials]);
    } catch (error) {
        yield hideOverlay();
        hashHistory.replace('/connect-missing');
        return;
    }

    yield put(applicationConfiguration({
        isPublishSupported: mediator.isPublishSupported(),
        isQuickReviewSupported: mediator.isQuickReviewSupported(),
        isImportFileSupported: mediator.isImportFileSupported(),
    }));

    try {
        yield configureSharedApiSession(
            credentials.serverUrl,
            credentials.apiUser,
            credentials.apiKey
        );
        const users = yield call(
            [session, session.query],
            queryUserExpression(credentials.apiUser)
        );
        yield put(ftrackApiUserAuthenticated(users.data[0]));

        store.dispatch(
            trackUsageEvent(
                `STARTED-${mediator.getIdentifier()}`
            )
        );

        yield hideOverlay();
        hashHistory.replace(nextPathName || '/home');

        // follow to context from Connect only after home so going back to My Tasks will
        // be possible
        if (!nextPathName || nextPathName === '/') {
            const FTRACK_CONNECT_EVENT = mediator.getEnv('FTRACK_CONNECT_EVENT');
            if (FTRACK_CONNECT_EVENT) {
                const data = JSON.parse(decodeURIComponent(escape(
                    window.atob(FTRACK_CONNECT_EVENT))));
                if (data && data.selection && data.selection.length) {
                    const entity = data.selection[0];
                    hashHistory.push(`/context/${entity.entityType}/${entity.entityId}`);
                }
            }
        }

        if (session.serverVersion !== 'dev') {
            if (
                compare(session.serverVersion, '3.3.20') < 0
            ) {
                yield call(showCompletion, {
                    header: 'Incompatible server version',
                    message: (
                        'The version of your ftrack server is outdated and must ' +
                        'be updated to make sure that everything works as expected.'
                    ),
                });
            }
        }
    } catch (error) {
        logger.error('Authentication failed', error);
        yield put(ftrackApiAuthenticationFailed(error));
        yield hideOverlay();
        hashHistory.replace('/connect-missing');
    }
}

/** Run startup after each `APPLICATION_AUTHENTICATE`. */
export function* startupSaga() {
    yield takeLatest(actions.APPLICATION_AUTHENTICATE, startup);
}
