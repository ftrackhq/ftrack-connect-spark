// :copyright: Copyright (c) 2016 ftrack

const NOTES_LOAD = 'NOTES_LOAD';
const NOTES_LOADED = 'NOTES_LOADED';

const OPEN_NOTE_FORM = 'OPEN_NOTE_FORM';
const HIDE_NOTE_FORM = 'HIDE_NOTE_FORM';
const SUBMIT_NOTE_FORM = 'SUBMIT_NOTE_FORM';
const REMOVE_NOTE = 'REMOVE_NOTE';

const NOTE_SUBMITTED = 'NOTE_SUBMITTED';
const NOTE_REMOVED = 'NOTE_REMOVED';

export function notesLoad() {
    return {
        type: NOTES_LOAD,
        payload: {
            parentId: 'c410b0dc-6c58-11e1-8a63-f23c91df25eb',
            parentType: 'TypedContext',
            // parentId: 'cc15e526-f670-11e5-b938-20c9d081909b',
        },
    };
}

export function openNoteForm(formKey, data) {
    return {
        type: OPEN_NOTE_FORM,
        payload: {
            formKey,
            data,
        },
    };
}

export function hideNoteForm(formKey, content) {
    return {
        type: HIDE_NOTE_FORM,
        payload: {
            formKey,
            content,
        },
    };
}

export function removeNote(id) {
    return {
        type: REMOVE_NOTE,
        payload: {
            id,
        },
    };
}

export function notesLoaded(entity, notes, metadata) {
    return {
        type: NOTES_LOADED,
        payload: {
            entity,
            items: notes,
            metadata,
        },
    };
}

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
};
