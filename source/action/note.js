// :copyright: Copyright (c) 2016 ftrack

const NOTES_LOAD = 'NOTES_LOAD';
const NOTES_LOAD_NEXT_PAGE = 'NOTES_LOAD_NEXT_PAGE';
const NOTES_LOADED = 'NOTES_LOADED';

const OPEN_NOTE_FORM = 'OPEN_NOTE_FORM';
const HIDE_NOTE_FORM = 'HIDE_NOTE_FORM';
const SUBMIT_NOTE_FORM = 'SUBMIT_NOTE_FORM';
const REMOVE_NOTE = 'REMOVE_NOTE';

const NOTE_SUBMITTED = 'NOTE_SUBMITTED';
const NOTE_REMOVED = 'NOTE_REMOVED';

/** Load notes action creator. */
export function notesLoad(id) {
    return {
        type: NOTES_LOAD,
        payload: {
            entity: {
                id,
                type: 'TypedContext',
            },
        },
    };
}

/** Load next page of notes action creator. */
export function notesLoadNextPage(id, nextOffset) {
    return {
        type: NOTES_LOAD_NEXT_PAGE,
        payload: {
            entity: {
                id,
                type: 'TypedContext',
            },
            nextOffset,
        },
    };
}

/** Open notes form action creator. */
export function openNoteForm(formKey, data) {
    return {
        type: OPEN_NOTE_FORM,
        payload: {
            formKey,
            data,
        },
    };
}

/** Hide notes form action creator. */
export function hideNoteForm(formKey, content) {
    return {
        type: HIDE_NOTE_FORM,
        payload: {
            formKey,
            content,
        },
    };
}

/** Remove note action creator. */
export function removeNote(id) {
    return {
        type: REMOVE_NOTE,
        payload: {
            id,
        },
    };
}

/** Notes loaded action creator. */
export function notesLoaded(entity, notes, nextOffset) {
    return {
        type: NOTES_LOADED,
        payload: {
            entity,
            items: notes,
            nextOffset,
        },
    };
}

/** Submit note form action creator. */
export function submitNoteForm(
    formKey, data
) {
    return {
        type: SUBMIT_NOTE_FORM,
        payload: {
            formKey,
            data,
        },
    };
}

/** Notes submitted action creator. */
export function noteSubmitted(formKey, note, isUpdate) {
    return {
        type: NOTE_SUBMITTED,
        payload: {
            formKey,
            note,
            isUpdate,
        },
    };
}

/** Note removed action creator. */
export function noteRemoved(id) {
    return {
        type: NOTE_REMOVED,
        payload: {
            id,
        },
    };
}

export default {
    NOTES_LOAD,
    NOTES_LOADED,
    OPEN_NOTE_FORM,
    HIDE_NOTE_FORM,
    REMOVE_NOTE,
    SUBMIT_NOTE_FORM,
    NOTE_SUBMITTED,
    NOTE_REMOVED,
    NOTES_LOAD_NEXT_PAGE,
};
