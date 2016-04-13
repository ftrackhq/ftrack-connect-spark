// :copyright: Copyright (c) 2016 ftrack

import { takeEvery } from 'redux-saga';
import { call } from 'redux-saga/effects';
import actions from 'action/application';

function* showDebugMessage(action) {
    yield call(window.alert, action.payload.message);
}

function* mockSaga() {
    yield* takeEvery(
        actions.APPLICATION_SHOW_DEBUG_MESSAGE, showDebugMessage
    );
}

export default [mockSaga];
