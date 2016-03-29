

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
        'author.thumbnail_id', 'category.name', 'date', 'replies.id',
        'replies.content', 'replies.author.first_name',
        'replies.author.last_name', 'replies.author.thumbnail_id',
        'replies.category.name', 'replies.date'
    ];
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

    yield put(notesLoaded(action.payload.parentId, response.data, response.metadata));
}

/** Prepare publish on NOTES_LOAD */
export function* notesLoadSaga() {
    yield takeEvery(actions.NOTES_LOAD, loadNotes);
}
