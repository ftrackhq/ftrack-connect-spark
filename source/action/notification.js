// :copyright: Copyright (c) 2016 ftrack

const NOTIFICATION_SHOW = 'NOTIFICATION_SHOW';
const NOTIFICATION_HIDE = 'NOTIFICATION_HIDE';

/** Hide application notification. */
export function notificationHide() {
    return { type: NOTIFICATION_HIDE };
}

/** Show application notification with configuration in *notification*. */
export function notificationShow(notification) {
    return {
        type: NOTIFICATION_SHOW,
        payload: notification,
    };
}

/** Show application notification with configuration in *notification*. */
export function notificationMessage(message, options = {}) {
    return {
        type: NOTIFICATION_SHOW,
        payload: Object.assign({
            label: message,
            timeout: 5 * 1000,
            action: 'Dismiss',
        }, options),
    };
}

export function notificationInfo(message, options = {}) {
    return notificationMessage(
        message, Object.assign({ icon: 'info' }, options)
    );
}

export function notificationWarning(message, options = {}) {
    return notificationMessage(
        message, Object.assign({ icon: 'warning', type: 'warning' }, options)
    );
}

export function notificationSuccess(message, options = {}) {
    return notificationMessage(
        message, Object.assign({ icon: 'done', type: 'accept' }, options)
    );
}


export default {
    NOTIFICATION_HIDE,
    NOTIFICATION_SHOW,
};
