import { takeEvery } from 'redux-saga';
import { call } from 'redux-saga/effects';
import { type } from 'action/application';

function* showDebugMessage(action) {
    yield call(window.alert, action.payload.message);
}

function* mockSaga() {
    yield* takeEvery(
        type.APPLICATION_SHOW_DEBUG_MESSAGE, showDebugMessage
    );
}

export default mockSaga;
