import { takeEvery } from 'redux-saga';
import actions from 'action/application';

import { session } from '../../../ftrack_api';
import Event from '../../../ftrack_api/event';

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
