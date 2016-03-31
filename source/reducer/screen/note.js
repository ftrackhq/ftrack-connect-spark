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
    } else if (action.type === types.START_NOTE_REPLY) {
        const noteReply = Object.assign({}, state.noteReply);
        noteReply[action.payload.parentNoteId] = Object.assign(
            {},
            noteReply[action.payload.parentNoteId],
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
                noteReply,
            }
        );
    } else if (action.type === types.HIDE_NOTE_REPLY) {
        const noteReply = Object.assign({}, state.noteReply);
        noteReply[action.payload.parentNoteId] = Object.assign(
            {}, state.noteReply[action.payload.parentNoteId], {
                state: 'hidden',
                content: action.payload.content,
            }
        );

        nextState = Object.assign(
            {},
            state,
            {
                noteReply,
            }
        );
    } else if (
        action.type === types.SUBMIT_NOTE && action.payload.parentNoteId
    ) {
        const noteReply = Object.assign({}, state.noteReply);
        noteReply[action.payload.parentNoteId] = Object.assign(
            {}, state.noteReply[action.payload.parentNoteId], {
                state: 'pending',
            }
        );

        nextState = Object.assign(
            {},
            state,
            {
                noteReply,
            }
        );
    } else if (action.type === types.NOTE_SUBMITTED) {
        let items;
        let noteReply;

        if (action.payload.parentNoteId) {
            noteReply = Object.assign({}, state.noteReply);
            items = state.items.map(
                (note) => {
                    if (note.id === action.payload.parentNoteId) {
                        const replies = [...note.replies, action.payload.note];
                        return Object.assign({}, note, { replies });
                    }

                    return note;
                }
            );

            delete noteReply[action.payload.parentNoteId];
        } else {
            noteReply = state.noteReply;
            items = [action.payload.note, ...state.items];
        }

        nextState = Object.assign(
            {},
            state,
            {
                items,
                noteReply,
            }
        );
    }

    return nextState;
}
