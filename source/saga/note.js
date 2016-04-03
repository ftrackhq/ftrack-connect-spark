

import { call, put } from 'redux-saga/effects';
import { takeEvery } from 'redux-saga';
import actions, { notesLoaded, noteSubmitted } from 'action/note';
import { session } from '../ftrack_api';
import { createOperation, updateOperation } from '../ftrack_api/operation';


import loglevel from 'loglevel';
const logger = loglevel.getLogger('saga:note');


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

function* submitNote(action) {

    let operation;
    const isUpdate = !!action.payload.data.id;

    if (isUpdate) {
        operation = updateOperation(
            'Note',
            [action.payload.data.id],
            {
                content: action.payload.data.content,
            }
        );
    } else {
        operation = createOperation(
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

    const submitResponse = yield call(
        [session, session._call],
        [operation]
    );

    const noteId = submitResponse[0].data.id;

    const query = `${noteSelect()} where id is "${noteId}"`;

    const response = yield call(
        [session, session._query],
        query
    );

    yield put(
        noteSubmitted(action.payload.formKey, response.data[0], isUpdate)
    );
}

function* loadNotes(action) {
    // logger.debug('loadNotes', action);

    const query = (
        `${noteSelect()} where parent_id is ` +
        `"${action.payload.parentId}" and not in_reply_to has () order by date desc`
    );

    logger.debug('Loading notes with "', query, '" from action', action);
    const response = yield call(
        [session, session._query],
        query
    );

    logger.debug(
        'Notes query result: ', response
    );

    const reviewSessionInviteeAuthors = {};

    response.data.forEach(
        note => {
            note.metadata.forEach(
                item => {
                    if (item.key === 'inviteeId') {
                        if (!reviewSessionInviteeAuthors[item.value]) {
                            reviewSessionInviteeAuthors[item.value] = [];
                        }
                        reviewSessionInviteeAuthors[item.value].push(note);
                    }
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

    if (Object.keys(reviewSessionInviteeAuthors).length) {
        const inviteeQuery = (
            'select id, name from ReviewSessionInvitee where id in ' +
            `(${Object.keys(reviewSessionInviteeAuthors).join(', ')})`
        );

        const inviteeResponse = yield call(
            [session, session._query],
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
                id: action.payload.parentId,
                type: action.payload.parentType,
            },
            response.data,
            response.metadata
        )
    );
}

/** Prepare publish on NOTES_LOAD */
export function* notesLoadSaga() {
    yield takeEvery(actions.NOTES_LOAD, loadNotes);
}

/** Prepare publish on NOTES_LOAD */
export function* noteSubmitSaga() {
    yield takeEvery(actions.SUBMIT_NOTE_FORM, submitNote);
}
