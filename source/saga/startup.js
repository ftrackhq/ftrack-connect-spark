// :copyright: Copyright (c) 2016 ftrack

import { call, put } from 'redux-saga/effects';
import { hashHistory } from 'react-router';

import { mediator } from '../application';
import { session, configureSharedApiSession } from '../ftrack_api';
import {
    ftrackApiUserAuthenticated,
    ftrackApiAuthenticationFailed,
} from 'action/ftrack_api';
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
function* startupSaga() {
    try {
        yield showProgress(null, { dismissable: false, message: null });
        const credentials = yield call([mediator, mediator.getCredentials]);
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
    } catch (error) {
        yield put(ftrackApiAuthenticationFailed(error));
        yield call(showFailure, {
            header: 'Authentication failed',
            error,
        });
    }
    hashHistory.push('/home');
}

export default startupSaga;
