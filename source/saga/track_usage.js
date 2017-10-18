// :copyright: Copyright (c) 2016 ftrack

import { takeEvery } from 'redux-saga';

import actions from 'action/track_usage';
import { session } from '../ftrack_api';
import { mediator } from '../application';

import loglevel from 'loglevel';
const logger = loglevel.getLogger('saga:track_usage');

/** Track usage event. */
function* trackUsageEvent(action) {
    logger.info('Sending usage event.');

    const metadata = Object.assign({
        pluginVersion: mediator.getPluginVersion(),
        hostVersion: mediator.getHostVersion(),
    }, action.payload.metadata);

    session.call([
        {
            action: '_track_usage',
            data: {
                type: 'event',
                name: action.payload.event,
                metadata,
            },
        },
    ]);
}

/** Track usage event saga. */
export function* trackUsageEventSaga() {
    yield takeEvery(actions.TRACK_USAGE_EVENT, trackUsageEvent);
}
