import { put } from 'redux-saga/effects';
import { takeEvery } from 'redux-saga';
import actions, { timelogsLoaded } from 'action/timelogger';
import { session } from '../ftrack_api';

import loglevel from 'loglevel';
const logger = loglevel.getLogger('saga:note');

function* loadTimelogs(action) {
    logger.debug('Loading timelogs', action);
    const response = yield session._query(
        `select id, start, duration, context.name, context.link, comment from Timelog where user.username is ${session._apiUser}`
    );
    yield put(timelogsLoaded(response.data, response.metadata.next.offset));
}

/** Handle NOTES_LOAD action. */
function* timelogsLoadSaga() {
    yield takeEvery(actions.TIMELOGS_LOAD, loadTimelogs);
}

export default [timelogsLoadSaga];
