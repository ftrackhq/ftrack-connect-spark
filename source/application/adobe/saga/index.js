import { takeEvery } from 'redux-saga';
import { call } from 'redux-saga/effects';
import actions from 'action/application';

function emptyFn() {}

function evalScript(script, callback = emptyFn) {
    const csInterface = window.top.csInterface;
    csInterface.evalScript(script, callback);
}

function* showDebugMessageAdobe(action) {
    const script = `alert("${action.payload.message}")`;
    yield call(evalScript, script);
}

function* openLink(action) {
    const csInterface = window.top.csInterface;
    csInterface.openURLInDefaultBrowser(action.payload.href);
}

function* adobeSaga() {
    yield* takeEvery(
        actions.APPLICATION_SHOW_DEBUG_MESSAGE, showDebugMessageAdobe
    );
}

function* openLinkSaga() {
    yield takeEvery(actions.APPLICATION_OPEN_LINK, openLink);
}

export default [adobeSaga, openLinkSaga];
