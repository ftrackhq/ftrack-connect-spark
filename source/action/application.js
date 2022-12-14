// :copyright: Copyright (c) 2016 ftrack

const APPLICATION_AUTHENTICATE = 'APPLICATION_AUTHENTICATE';
const APPLICATION_SHOW_DEBUG_MESSAGE = 'APPLICATION_SHOW_DEBUG_MESSAGE';
const APPLICATION_CONFIGURATION = 'APPLICATION_CONFIGURATION';
const APPLICATION_OPEN_LINK = 'APPLICATION_OPEN_LINK';

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

export function applicationConfiguration(config = {}) {
    return {
        type: APPLICATION_CONFIGURATION,
        payload: {
            config,
        },
    };
}

export function applicationOpenLink(href) {
    return {
        type: APPLICATION_OPEN_LINK,
        payload: {
            href,
        },
    };
}

export default {
    APPLICATION_AUTHENTICATE,
    APPLICATION_SHOW_DEBUG_MESSAGE,
    APPLICATION_CONFIGURATION,
    APPLICATION_OPEN_LINK,
};
