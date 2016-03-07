// :copyright: Copyright (c) 2016 ftrack

import { call, put } from 'redux-saga/effects';

import { configureSharedApiSession, session } from '../ftrack_api';
import credentials from '../ftrack_api_credentials.json';
import {
    ftrackApiUserAuthenticated,
    ftrackApiAuthenticationFailed,
} from 'action/ftrack_api';


/** Return API operation to query user details. */
function queryUserOperation(apiUser) {
    const userFields = [
        'email', 'first_name', 'is_active', 'last_name', 'resource_type',
        'username', 'thumbnail_id',
    ];
    const userQuery = `
        select ${userFields.join()} from User
        where username is "${apiUser}"
    `;
    return { action: 'query', expression: userQuery };
}

/** Return user object from batched api responses. */
const extractUserObject = (responses) => responses[0].data[0];

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
        yield configureSharedApiSession(
            credentials.serverUrl,
            credentials.apiUser,
            credentials.apiKey
        );
        const responses = yield call(
            [session, session._call],
            [queryUserOperation(credentials.apiUser)]
        );
        yield put(ftrackApiUserAuthenticated(extractUserObject(responses)));
    } catch (error) {
        yield put(ftrackApiAuthenticationFailed(error));
    }
}

export default startupSaga;
