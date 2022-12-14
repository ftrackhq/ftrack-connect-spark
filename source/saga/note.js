// :copyright: Copyright (c) 2016 ftrack

import { call, put, takeEvery } from 'redux-saga/effects';

import { operation } from 'ftrack-javascript-api';

import actions, { notesLoaded, noteSubmitted, noteRemoved } from 'action/note';
import { session } from '../ftrack_api';
import { notificationWarning } from 'action/notification';


import loglevel from 'loglevel';
const logger = loglevel.getLogger('saga:note');

/** Return list of note attributes to use in select. */
function noteSelect() {
    const select = [
        'id', 'content', 'author.first_name', 'author.last_name', 'parent_id',
        'parent_type', 'author.thumbnail_id', 'category.name', 'date',
        'note_components.component.file_type', 'note_components.component.name',
        'note_components.component.id', 'metadata.key', 'metadata.value',
    ];

    // Add same attributes but with replies prefix to load the same data on
    // replies.
    select.push(
        ...select.map(
            attribute => `replies.${attribute}`
        )
    );

    return `select ${select.join(', ')} from Note`;
}

/** Handle remove note *action*. */
function* removeNote(action) {
    const deleteOperation = operation.delete(
        'Note',
        [action.payload.id]
    );

    try {
        yield call(
            [session, session.call],
            [deleteOperation]
        );
    } catch (error) {
        yield put(notificationWarning('Could not remove note'));
        return;
    }

    yield put(
        noteRemoved(action.payload.id)
    );
}

/** Handle submit note *action*. */
function* submitNote(action) {
    let submitNoteOperation;
    const isUpdate = !!action.payload.data.id;

    if (isUpdate) {
        submitNoteOperation = operation.update(
            'Note',
            [action.payload.data.id],
            {
                content: action.payload.data.content,
            }
        );
    } else {
        submitNoteOperation = operation.create(
            'Note',
            {
                content: action.payload.data.content,
                parent_id: action.payload.data.parent_id,
                parent_type: action.payload.data.parent_type,
                in_reply_to_id: action.payload.data.in_reply_to_id,
                user_id: action.payload.data.user_id,
            }
        );
    }

    let submitResponse;
    try {
        submitResponse = yield call(
            [session, session.call],
            [submitNoteOperation]
        );
    } catch (error) {
        yield put(notificationWarning('Could not submit note'));
        return;
    }

    const noteId = submitResponse[0].data.id;

    const query = `${noteSelect()} where id is "${noteId}"`;

    const response = yield call(
        [session, session.query],
        query
    );

    yield put(
        noteSubmitted(action.payload.formKey, response.data[0], isUpdate)
    );
}

/** Handle load notes and load next page *action*. */
function* loadNotes(action) {
    let offset = 0;

    if (action.type === actions.NOTES_LOAD_NEXT_PAGE) {
        offset = action.payload.nextOffset;
    }

    const entityId = action.payload.entity.id;
    const relatedEntitiesSelect = 'id, link, status.color, thumbnail_id';

    // Gather all version ids of assets publish on entity.
    const assetVersionsQuery = (
        `select ${relatedEntitiesSelect} from AssetVersion where asset.context_id is "${entityId}"`
    );

    // Gather all version ids of assets publish on entity.
    const taskVersionsQuery = (
        `select ${relatedEntitiesSelect} from AssetVersion where task_id is "${entityId}"`
    );

    // Gather all tasks that are direct children to entity.
    const tasksQuery = (
        `select ${relatedEntitiesSelect} from Task where parent_id is "${entityId}"`
    );

    const relatedEntitiesResponse = yield call(
        [session, session.call],
        [
            operation.query(assetVersionsQuery),
            operation.query(taskVersionsQuery),
            operation.query(tasksQuery),
        ]
    );

    const ids = [entityId];
    const extraInformation = {};

    relatedEntitiesResponse.forEach(
        (item) => {
            item.data.forEach(
                (entity) => {
                    ids.push(entity.id);
                    extraInformation[entity.id] = entity;
                }
            );
        }
    );

    const query = (
        `${noteSelect()} where parent_id in ` +
        `(${ids.join(',')}) and not in_reply_to has () ` +
        `order by thread_activity desc offset ${offset} limit 10`
    );

    logger.debug('Loading notes with "', query, '" from action', action);
    const response = yield call(
        [session, session.query],
        query
    );

    logger.debug(
        'Notes query result: ', response
    );

    const reviewSessionInviteeAuthors = {};

    function processNoteMeta(note) {
        note.metadata.forEach(
            item => {
                if (item.key === 'inviteeId') {
                    if (!reviewSessionInviteeAuthors[item.value]) {
                        reviewSessionInviteeAuthors[item.value] = [];
                    }
                    reviewSessionInviteeAuthors[item.value].push(note);
                }

                if (item.key === 'reviewFrame') {
                    try {
                        note.frame = JSON.parse(item.value).number;
                    } catch (error) {
                        // Frame number has not been set correctly, do
                        // nothing.
                    }
                }
            }
        );
    }

    response.data.forEach(
        note => {
            if (extraInformation[note.parent_id]) {
                note.extraInformation = extraInformation[note.parent_id];
            }

            processNoteMeta(note);

            // Note replies has a category in the model that is not visible to
            // the end-user.
            // TODO: Change this when displaying frame numbers as tags.
            note.replies.forEach(
                reply => {
                    processNoteMeta(reply);
                    delete reply.category;
                }
            );

            // Order replies since there is garantuee that the they are ordered.
            note.replies.sort(
                (a, b) => {
                    if (a.date.toDate() === b.date.toDate()) {
                        return 0;
                    }

                    if (a.date.toDate() < b.date.toDate()) {
                        return -1;
                    }

                    return 1;
                }
            );
        }
    );

    /** Update author on notes if the author is a review session invitee. */
    if (Object.keys(reviewSessionInviteeAuthors).length) {
        const inviteeQuery = (
            'select id, name from ReviewSessionInvitee where id in ' +
            `(${Object.keys(reviewSessionInviteeAuthors).join(', ')})`
        );

        const inviteeResponse = yield call(
            [session, session.query],
            inviteeQuery
        );
        logger.debug('Invitee query result: ', inviteeResponse);

        inviteeResponse.data.forEach(
            invitee => {
                reviewSessionInviteeAuthors[invitee.id].forEach(
                    note => {
                        note.author = Object.assign({}, invitee);
                    }
                );
            }
        );
    }

    yield put(
        notesLoaded(
            {
                id: entityId,
                type: action.payload.entity.type,
            },
            response.data,
            response.metadata.next.offset
        )
    );
}

/** Handle NOTES_LOAD action. */
export function* notesLoadSaga() {
    yield takeEvery(actions.NOTES_LOAD, loadNotes);
}

/** Handle NOTES_LOAD action. */
export function* notesLoadNextPageSaga() {
    yield takeEvery(actions.NOTES_LOAD_NEXT_PAGE, loadNotes);
}

/** Handle SUBMIT_NOTE_FORM action. */
export function* noteSubmitSaga() {
    yield takeEvery(actions.SUBMIT_NOTE_FORM, submitNote);
}

/** Handle REMOVE_NOTE action. */
export function* noteRemoveSaga() {
    yield takeEvery(actions.REMOVE_NOTE, removeNote);
}
