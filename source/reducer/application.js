// :copyright: Copyright (c) 2016 ftrack

import types from 'action/application';

export default function applicationReducer(state = {}, action) {
    let nextState = state;
    if (action.type === types.APPLICATION_CONFIGURATION) {
        nextState = Object.assign({}, state, action.payload);
    }
    return nextState;
}

