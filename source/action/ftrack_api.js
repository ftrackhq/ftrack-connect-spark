// :copyright: Copyright (c) 2016 ftrack

const FTRACK_API_AUTHENTICATE = 'FTRACK_API_AUTHENTICATE';
const FTRACK_API_USER_AUTHENTICATED = 'FTRACK_API_USER_AUTHENTICATED';
const FTRACK_API_AUTHENTICATION_FAILED = 'FTRACK_API_AUTHENTICATION_FAILED';


export function ftrackApiAuthenticate() {
    return { type: FTRACK_API_AUTHENTICATE };
}

export function ftrackApiUserAuthenticated(user) {
    return {
        type: FTRACK_API_USER_AUTHENTICATED,
        payload: {
            user,
        },
    };
}

export function ftrackApiAuthenticationFailed(error) {
    return {
        type: FTRACK_API_AUTHENTICATION_FAILED,
        error: true,
        payload: error,
    };
}

export default {
    FTRACK_API_AUTHENTICATE,
    FTRACK_API_USER_AUTHENTICATED,
    FTRACK_API_AUTHENTICATION_FAILED,
};
