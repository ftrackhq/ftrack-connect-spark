import { takeEvery } from 'redux-saga';
import { call } from 'redux-saga/effects';
import { type } from 'action/application';

function emptyFn() {}

function evalScript(script, callback = emptyFn) {
    const csInterface = window.top.csInterface;
    csInterface.evalScript(script, callback);
}

function* showDebugMessageAdobe(action) {
    const script = `alert("${action.payload.message}")`;
    yield call(evalScript, script);
}

function* adobeSaga() {
    yield* takeEvery(
        type.APPLICATION_SHOW_DEBUG_MESSAGE, showDebugMessageAdobe
    );
}

export default [adobeSaga];
