import { takeEvery } from 'redux-saga';
import { type } from 'action/application';

import { session } from '../../../ftrack_api';
import Event from '../../../ftrack_api/event';

function* showDebugMessage(action) {
    session.eventHub.publish(
        new Event('ftrack.connect-cinema-4d.show_debug_message', action.payload), {}
    );
}

function* cinema4dSaga() {
    yield* takeEvery(
        type.APPLICATION_SHOW_DEBUG_MESSAGE, showDebugMessage
    );
}

export default [cinema4dSaga];
