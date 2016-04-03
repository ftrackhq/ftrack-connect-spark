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
        const forms = Object.assign({}, state.forms);
        const exists = forms[action.payload.formKey] !== undefined;
        const initialState  = exists ? {} : action.payload.data;

        forms[action.payload.formKey] = Object.assign(
            {},
            forms[action.payload.formKey],
            {
                state: 'visible'
            },
            initialState
        );

        nextState = Object.assign(
            {},
            state,
            {
                forms,
            }
        );
    } else if (action.type === types.HIDE_NOTE_FORM) {
        const forms = Object.assign({}, state.forms);
        forms[action.payload.formKey] = Object.assign(
            {}, state.forms[action.payload.formKey], {
                state: 'hidden',
                content: action.payload.content,
            }
        );

        nextState = Object.assign(
            {},
            state,
            {
                forms,
            }
        );
    } else if (
        action.type === types.SUBMIT_NOTE_FORM
    ) {
        const forms = Object.assign({}, state.forms);
        forms[action.payload.formKey] = Object.assign(
            {}, state.forms[action.payload.formKey], {
                state: 'pending',
            }
        );

        nextState = Object.assign(
            {},
            state,
            {
                forms,
            }
        );
    } else if (action.type === types.NOTE_SUBMITTED) {
        let items;
        let forms;


        if (action.payload.isUpdate) {
            items = state.items.map(
                (note) => {
                    if (note.id === action.payload.note.id) {
                        return action.payload.note;
                    } else if (note.id === action.payload.note.in_reply_to_id) {
                        const parentNote = Object.assign({}, note);
                        parentNote.replies = note.replies.map(
                            (reply) => {
                                if (reply.id === action.payload.note.id) {
                                    return action.payload.note;
                                }

                                return reply;
                            }
                        );
                        return parentNote;
                    }

                    return note;
                }
            );
        } else {
            if (action.payload.note.in_reply_to_id) {
                items = state.items.map(
                    (note) => {
                        if (note.id === action.payload.note.in_reply_to_id) {
                            const replies = [...note.replies, action.payload.note];
                            return Object.assign({}, note, { replies });
                        }

                        return note;
                    }
                );
            } else {
                items = [action.payload.note, ...state.items];
            }
        }

        forms = Object.assign({}, state.forms);
        delete forms[action.payload.formKey];

        nextState = Object.assign(
            {},
            state,
            {
                items,
                forms,
            }
        );
    }

    return nextState;
}
