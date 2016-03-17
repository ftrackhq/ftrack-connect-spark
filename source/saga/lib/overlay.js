// :copyright: Copyright (c) 2016 ftrack

import { put, take } from 'redux-saga/effects';
import actions, { overlayShow, overlayHide } from 'action/overlay';


/** Dispatch a show overlay action with *header* and a progress-style layout. */
export function* showProgress(header) {
    yield put(overlayShow({
        header,
        message: 'This may take a few minutes. Please keep this window open until finished.',
        loader: true,
    }));
}


/** Show completed overlay. */
export function* showCompletion(callback) {
    yield put(overlayShow({
        header: 'Completed',
        message: 'The review session has now been created.',
        dissmissable: true,
    }));
    yield take(actions.OVERLAY_HIDE);
    callback();
}

/** Show failure overlay. */
export function* showFailure(error, callback = () => {}) {
    yield put(overlayShow({
        header: 'Failed to create review',
        message: 'Please try again or contact support with the following details',
        error: error && error.message || '',
        dissmissable: true,
    }));
    yield take(actions.OVERLAY_HIDE);
    callback();
}

/** Hide application overlay. */
export function* hideOverlay() {
    yield put(overlayHide());
}
