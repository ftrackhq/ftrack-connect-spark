import { takeEvery } from 'redux-saga/effects';
import actions from 'action/application';
import { Event } from 'ftrack-javascript-api';

import { session } from '../../../ftrack_api';

function* showDebugMessage(action) {
    session.eventHub.publish(
        new Event('ftrack.connect-cinema-4d.show_debug_message', action.payload), {}
    );
}

function* cinema4dSaga() {
    yield* takeEvery(
        actions.APPLICATION_SHOW_DEBUG_MESSAGE, showDebugMessage
    );
}

export default [cinema4dSaga];
