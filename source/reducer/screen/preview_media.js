// :copyright: Copyright (c) 2016 ftrack

import types from 'action/preview_media';

/** Reduce state for preview media. */
export default function previewMediaReducer(state = {}, action) {
    let nextState = state;

    if (action.type === types.OPEN_PRVIEW_MEDIA) {
        nextState = Object.assign(
            {}, state,
            {
                visible: true,
                index: action.payload.index,
                components: action.payload.components,
            }
        );
    } else if (action.type === types.HIDE_PREVIEW_MEDIA) {
        nextState = Object.assign({}, state, {visible: false});
    }

    return nextState;
}
