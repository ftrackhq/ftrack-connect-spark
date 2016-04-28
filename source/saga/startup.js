// :copyright: Copyright (c) 2016 ftrack

import { takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import { hashHistory } from 'react-router';

import { mediator } from '../application';
import { session, configureSharedApiSession } from '../ftrack_api';
import {
    ftrackApiUserAuthenticated,
    ftrackApiAuthenticationFailed,
} from 'action/ftrack_api';
import actions, { applicationConfiguration } from 'action/application';

import {
    showProgress, hideOverlay, showFailure,
} from './lib/overlay';

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
            [session, session._query],
            queryUserExpression(credentials.apiUser)
        );
        yield put(ftrackApiUserAuthenticated(users.data[0]));

        yield hideOverlay();
        hashHistory.replace(nextPathName || '/home');
    } catch (error) {
        yield put(ftrackApiAuthenticationFailed(error));
        yield call(showFailure, {
            header: 'Authentication failed',
            error,
        });
    }
}

/** Run startup after each `APPLICATION_AUTHENTICATE`. */
export function* startupSaga() {
    yield takeLatest(actions.APPLICATION_AUTHENTICATE, startup);
}
