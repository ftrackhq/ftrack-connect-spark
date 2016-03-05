import types from 'action/ftrack_api';

export default function userReducer(state = null, action) {
    let nextState = state;
    if (action.type === types.FTRACK_API_USER_AUTHENTICATED) {
        nextState = Object.assign({}, action.payload.user);
    }
    return nextState;
}

