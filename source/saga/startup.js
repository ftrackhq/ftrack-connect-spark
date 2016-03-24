// :copyright: Copyright (c) 2016 ftrack

import { call, put } from 'redux-saga/effects';
import { browserHistory } from 'react-router';

import { session, configureSharedApiSession } from '../ftrack_api';
import {
    ftrackApiUserAuthenticated,
    ftrackApiAuthenticationFailed,
} from 'action/ftrack_api';


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

/** Return ftrack API credentials. */
function getCredentials() {
    let credentials = null;
    try {
        credentials = require('../ftrack_api_credentials.json');
    } catch (error) {
        console.log(error); // eslint-disable-line no-console
    }
    return credentials;
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
        const credentials = yield call(getCredentials);
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
        browserHistory.push('/home');
    } catch (error) {
        yield put(ftrackApiAuthenticationFailed(error));
    }
}

export default startupSaga;
