

import { call, put } from 'redux-saga/effects';
import { takeEvery } from 'redux-saga';
import actions, { notesLoaded } from 'action/note';
import { session } from '../ftrack_api';


import loglevel from 'loglevel';
const logger = loglevel.getLogger('saga:note');


function* loadNotes(action) {
    // logger.debug('loadNotes', action);
    const select = [
        'id', 'content', 'author.first_name', 'author.last_name',
        'author.thumbnail_id', 'category.name', 'date',
        'note_components.component.file_type', 'note_components.component.name',
        'note_components.component.id, metadata.key, metadata.value',
    ];

    // Add same attributes but with replies prefix to load the same data on
    // replies.
    select.push(
        ...select.map(
            attribute => `replies.${attribute}`
        )
    );

    const query = (
        `select ${select.join(', ')} from Note where parent_id is ` +
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

    if (reviewSessionInviteeAuthors) {
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

    yield put(notesLoaded(action.payload.parentId, response.data, response.metadata));
}

/** Prepare publish on NOTES_LOAD */
export function* notesLoadSaga() {
    yield takeEvery(actions.NOTES_LOAD, loadNotes);
}
