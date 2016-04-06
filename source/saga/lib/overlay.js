// :copyright: Copyright (c) 2016 ftrack

import { put, take } from 'redux-saga/effects';
import actions, { overlayShow, overlayHide } from 'action/overlay';


/** Dispatch a show overlay action with *header* and a progress-style layout. */
export function* showProgress(header, options = {}) {
    yield put(overlayShow(Object.assign({
        header,
        message: 'This may take a few minutes, please keep this window open until finished.',
        loader: true,
        dissmissable: true,
        dismissLabel: 'Cancel',
    }, options)));
}


/** Show completed overlay. */
export function* showCompletion({ header, message }, callback = () => {}) {
    yield put(overlayShow({
        header,
        message,
        dissmissable: true,
    }));
    yield take(actions.OVERLAY_HIDE);
    callback();
}

/** Show failure overlay. */
export function* showFailure({ header, error }, callback = () => {}) {
    yield put(overlayShow({
        header,
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
