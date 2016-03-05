// :copyright: Copyright (c) 2016 ftrack

const APPLICATION_SHOW_DEBUG_MESSAGE = 'APPLICATION_SHOW_DEBUG_MESSAGE';

export function applicationDebugMessage(message = 'Hello world!') {
    return {
        type: APPLICATION_SHOW_DEBUG_MESSAGE,
        payload: {
            message,
        },
    };
}

export const type = {
    APPLICATION_SHOW_DEBUG_MESSAGE,
};
