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
        forms[action.payload.formKey] = Object.assign(
            {},
            forms[action.payload.formKey],
            {
                state: 'visible',
            }
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

        if (action.payload.note.in_reply_to_id) {
            forms = Object.assign({}, state.forms);
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
            forms = state.forms;
            items = [action.payload.note, ...state.items];
        }

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
