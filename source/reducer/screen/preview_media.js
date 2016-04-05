// :copyright: Copyright (c) 2016 ftrack

import types from 'action/preview_media';

/** Reduce state for preview media. */
export default function previewMediaReducer(state = {}, action) {
    let nextState = state;

    if (action.type === types.OPEN_PRVIEW_MEDIA) {

    } else if (action.type === types.DOWNLOAD_PRVIEW_MEDIA) {

    } else if (action.type === types.HIDE_PREVIEW_MEDIA) {

        nextState = Object.assign({}, state, {visible: false});

    } else if (action.type === types.CHANGE_ACTIVE_PREVIEW_MEDIA) {

        nextState = Object.assign({}, state, {index: action.payload.index});

    }

    return nextState;
}
