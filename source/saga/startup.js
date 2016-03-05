// :copyright: Copyright (c) 2016 ftrack

import { call, put } from 'redux-saga/effects';

import { configureSession, session } from '../ftrack_api';
import credentials from '../ftrack_api_credentials.json';
import {
    ftrackApiUserAuthenticated,
    ftrackApiAuthenticationFailed,
} from 'action/ftrack_api';


function getInitialOperations(apiUser) {
    const userFields = [
        'email', 'first_name', 'is_active', 'last_name', 'resource_type',
        'username', 'thumbnail_id',
    ];
    const userQuery = `
        select ${userFields.join()} from User
        where username is "${apiUser}"
    `;
    const operations = [
        { action: 'query_server_information' },
        { action: 'query_schemas' },
        { action: 'query', expression: userQuery },
    ];

    return operations;
}

const extractUserObject = (responses) => responses[2].data[0];

function* startupSaga() {
    try {
        configureSession(
            credentials.serverUrl,
            credentials.apiUser,
            credentials.apiKey
        );
        const operations = getInitialOperations(credentials.apiUser);
        const responses = yield call([session, session._call], operations);
        yield put(ftrackApiUserAuthenticated(extractUserObject(responses)));
    } catch (error) {
        yield put(ftrackApiAuthenticationFailed(error));
    }
}

export default startupSaga;
