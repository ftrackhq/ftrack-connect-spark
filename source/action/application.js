// :copyright: Copyright (c) 2016 ftrack

const APPLICATION_AUTHENTICATE = 'APPLICATION_AUTHENTICATE';
const APPLICATION_SHOW_DEBUG_MESSAGE = 'APPLICATION_SHOW_DEBUG_MESSAGE';

export function applicationAuthenticate(nextPathName) {
    return {
        type: APPLICATION_AUTHENTICATE,
        payload: {
            nextPathName,
        },
    };
}

export function applicationDebugMessage(message = 'Hello world!') {
    return {
        type: APPLICATION_SHOW_DEBUG_MESSAGE,
        payload: {
            message,
        },
    };
}

export default {
    APPLICATION_AUTHENTICATE,
    APPLICATION_SHOW_DEBUG_MESSAGE,
};
