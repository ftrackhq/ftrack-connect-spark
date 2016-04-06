// :copyright: Copyright (c) 2016 ftrack

import actions from 'action/note';

/**
 * Reduce state for application-wide notes.
 */
export default function notesReducer(state = {}, action) {
    let nextState = state;

    if (action.type === actions.NOTES_LOAD) {
        nextState = Object.assign(
            {},
            state,
            {
                entity: action.payload.entity,
                items: [],
                nextOffset: 0,
                loading: true,
            }
        );
    } if (action.type === actions.NOTES_LOAD_NEXT_PAGE) {
        nextState = Object.assign(
            {},
            state,
            {
                loading: true,
            }
        );
    } else if (action.type === actions.NOTES_LOADED) {
        const items = [...state.items, ...action.payload.items];

        nextState = Object.assign(
            {},
            state,
            {
                items: items,
                nextOffset: action.payload.nextOffset,
                loading: false,
            }
        );
    } else if (action.type === actions.OPEN_NOTE_FORM) {
        const forms = Object.assign({}, state.forms);
        const exists = forms[action.payload.formKey] !== undefined;
        const initialState = exists ? {} : action.payload.data;

        forms[action.payload.formKey] = Object.assign(
            {},
            forms[action.payload.formKey],
            {
                state: 'visible',
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
    } else if (action.type === actions.HIDE_NOTE_FORM) {
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
        action.type === actions.SUBMIT_NOTE_FORM
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
    } else if (action.type === actions.NOTE_SUBMITTED) {
        let items;
        let nextOffset = state.nextOffset;

        if (action.payload.isUpdate) {
            // Find and update the note if the operation is an update.
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
            // Find and add the new note if the operation is a reply or new
            // note.
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
                // Add one to the offset since next page will start on +1 after
                // the new note was added.
                nextOffset += 1;
            }
        }

        const forms = Object.assign({}, state.forms);
        delete forms[action.payload.formKey];

        nextState = Object.assign(
            {},
            state,
            {
                items,
                forms,
                nextOffset,
            }
        );
    } else if (action.type === actions.NOTE_REMOVED) {
        // Find and remove the note if the action is a note being removed.
        const items = [];
        let nextOffset = state.nextOffset;

        state.items.forEach(
            (note) => {
                if (note.id !== action.payload.id) {
                    items.push(note);

                    const replies = [];
                    note.replies.forEach(
                        (reply) => {
                            if (reply.id !== action.payload.id) {
                                replies.push(reply);
                            }
                        }
                    );

                    // If lenght differ a matching note was removed and the
                    // replies array must be updated.
                    if (note.replies.length !== replies.length) {
                        note.replies = replies;
                    }
                } else {
                    // Subtract one from the offset since next page will start
                    // on -1 after the note was removed.
                    nextOffset -= 1;
                }
            }
        );

        nextState = Object.assign(
            {},
            state,
            {
                items,
                nextOffset,
            }
        );
    }

    return nextState;
}
