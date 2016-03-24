// :copyright: Copyright (c) 2016 ftrack

const NOTES_LOAD = 'NOTES_LOAD';
const NOTES_LOADED = 'NOTES_LOADED';

export function notesLoad() {
    return {
        type: NOTES_LOAD,
        payload: {
            parentId: 'c410b0dc-6c58-11e1-8a63-f23c91df25eb',
        },
    };
}

export function notesLoaded(parentId, notes, metadata) {
    return {
        type: NOTES_LOADED,
        payload: {
            parentId,
            items: notes,
            metadata,
        },
    };
}

export default {
    NOTES_LOAD,
    NOTES_LOADED,
};
