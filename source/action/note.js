// :copyright: Copyright (c) 2016 ftrack

const NOTES_LOAD = 'NOTES_LOAD';
const NOTES_LOADED = 'NOTES_LOADED';
const START_NOTE_REPLY = 'START_NOTE_REPLY';
const HIDE_NOTE_REPLY = 'HIDE_NOTE_REPLY';
const SUBMIT_NOTE = 'SUBMIT_NOTE';
const NOTE_SUBMITTED = 'NOTE_SUBMITTED';

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

export function startNoteReply(parentNoteId, parentId, parentType) {
    return {
        type: START_NOTE_REPLY,
        payload: {
            parentNoteId,
            parentId,
            parentType,
        },
    };
}

export function hideNoteReply(parentNoteId, content) {
    return {
        type: HIDE_NOTE_REPLY,
        payload: {
            parentNoteId,
            content,
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
    parentNoteId, parentId, parentType, userId, content
) {
    return {
        type: SUBMIT_NOTE,
        payload: {
            parentNoteId,
            parentId,
            parentType,
            userId,
            content,
        },
    };
}

export function noteSubmitted(parentNoteId, note) {
    return {
        type: NOTE_SUBMITTED,
        payload: {
            parentNoteId,
            note,
        },
    };
}

export default {
    NOTES_LOAD,
    NOTES_LOADED,
    START_NOTE_REPLY,
    HIDE_NOTE_REPLY,
    SUBMIT_NOTE,
    NOTE_SUBMITTED,
};
