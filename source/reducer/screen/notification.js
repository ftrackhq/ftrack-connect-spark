// :copyright: Copyright (c) 2016 ftrack

import types from 'action/notification';

const defaultNotification = {
    label: '',
    active: false,
};

/**
 * Reduce state for application-wide notification.
 *
 * Set notification on NOTIFICATION_SHOW, remove it on NOTIFICATION_HIDE
 */
export default function notificationReducer(state = defaultNotification, action) {
    let nextState = state;
    if (action.type === types.NOTIFICATION_SHOW) {
        nextState = Object.assign({ label: '' }, action.payload, { active: true });
    } else if (action.type === types.NOTIFICATION_HIDE) {
        nextState = defaultNotification;
    }
    return nextState;
}

