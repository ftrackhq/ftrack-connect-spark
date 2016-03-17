// :copyright: Copyright (c) 2016 ftrack

import types from 'action/overlay';

/**
 * Reduce state for application-wide overlay.
 *
 * Set overlay on OVERLAY_SHOW, remove it on OVERLAY_HIDE
 */
export default function applicationOverlayReducer(state = {}, action) {
    let nextState = state;
    if (action.type === types.OVERLAY_SHOW) {
        nextState = Object.assign({}, action.payload.overlay, { active: true });
    } else if (action.type === types.OVERLAY_HIDE) {
        nextState = {};
    }
    return nextState;
}

