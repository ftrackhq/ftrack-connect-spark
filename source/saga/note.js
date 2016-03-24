

import { call, put } from 'redux-saga/effects';
import { takeEvery } from 'redux-saga';
import actions, { notesLoaded } from 'action/note';
import { session } from '../ftrack_api';


import loglevel from 'loglevel';
const logger = loglevel.getLogger('saga:note');


function* loadNotes(action) {
    // logger.debug('loadNotes', action);
    const query = (
        'select id, content, author.first_name, author.last_name, ' +
        'category.name from Note where parent_id is ' +
        `"${action.payload.parentId}"`
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
