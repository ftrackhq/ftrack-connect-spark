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
            state,
            {
                entity: action.payload.entity,
                items: action.payload.items,
            }
        );
    } else if (action.type === types.OPEN_NOTE_FORM) {
        const replyForms = Object.assign({}, state.replyForms);
        replyForms[action.payload.parentNoteId] = Object.assign(
            {},
            replyForms[action.payload.parentNoteId],
            {
                state: 'visible',
                parentNoteId: action.payload.parentNoteId,
                parentId: action.payload.parentId,
                parentType: action.payload.parentType,
            }
        );
        nextState = Object.assign(
            {},
            state,
            {
                replyForms,
            }
        );
    } else if (action.type === types.HIDE_NOTE_FORM) {
        const replyForms = Object.assign({}, state.replyForms);
        replyForms[action.payload.parentNoteId] = Object.assign(
            {}, state.replyForms[action.payload.parentNoteId], {
                state: 'hidden',
                content: action.payload.content,
            }
        );

        nextState = Object.assign(
            {},
            state,
            {
                replyForms,
            }
        );
    } else if (
        action.type === types.SUBMIT_NOTE_FORM && action.payload.parentNoteId
    ) {
        const replyForms = Object.assign({}, state.replyForms);
        replyForms[action.payload.parentNoteId] = Object.assign(
            {}, state.replyForms[action.payload.parentNoteId], {
                state: 'pending',
            }
        );

        nextState = Object.assign(
            {},
            state,
            {
                replyForms,
            }
        );
    } else if (action.type === types.NOTE_SUBMITTED) {
        let items;
        let replyForms;

        if (action.payload.parentNoteId) {
            replyForms = Object.assign({}, state.replyForms);
            items = state.items.map(
                (note) => {
                    if (note.id === action.payload.parentNoteId) {
                        const replies = [...note.replies, action.payload.note];
                        return Object.assign({}, note, { replies });
                    }

                    return note;
                }
            );

            delete replyForms[action.payload.parentNoteId];
        } else {
            replyForms = state.replyForms;
            items = [action.payload.note, ...state.items];
        }

        nextState = Object.assign(
            {},
            state,
            {
                items,
                replyForms,
            }
        );
    }

    return nextState;
}
