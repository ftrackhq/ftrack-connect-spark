// :copyright: Copyright (c) 2016 ftrack

import { take, call, put } from 'redux-saga/effects';

import { session } from '../ftrack_api';
import actions, { quickReviewProjectsLoaded } from 'action/quick_review';

/** Load projects */
function* loadProjects() {
    const projects = yield call(
        [session, session._query],
        'select id, name, full_name from Project where status is "active"'
    );
    yield put(quickReviewProjectsLoaded(projects));
}

/** Handle submit quick review action */
function submitQuickReview(action) {
    console.info('handling action', action.payload); // eslint-disable-line no-console
}

/**
 * Quick review submit saga
 */
function* quickReviewSubmitSaga() {
    while (true) {
        yield take(actions.QUICK_REVIEW_LOAD);
        yield loadProjects();

        const action = yield take(actions.QUICK_REVIEW_SUBMIT);
        submitQuickReview(action);
    }
}

export default quickReviewSubmitSaga;
