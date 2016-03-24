// :copyright: Copyright (c) 2016 ftrack

import types from 'action/note';

/**
 * Reduce state for application-wide notes.
 */
export default function notesReducer(state = {}, action) {
    let nextState = state;
    if (action.type === types.NOTES_LOADED) {
        nextState = Object.assign(
            {},
            {
                items: action.payload.items,
            }
        );
    }
    return nextState;
}
