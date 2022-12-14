// :copyright: Copyright (c) 2016 ftrack

const OPEN_PRVIEW_MEDIA = 'OPEN_PRVIEW_MEDIA';
const HIDE_PREVIEW_MEDIA = 'HIDE_PREVIEW_MEDIA';

/** Action to open media preview of *components*. */
export function openPreviewMedia(index, components) {
    return {
        type: OPEN_PRVIEW_MEDIA,
        payload: {
            index,
            components,
        },
    };
}

/** Action to hide preview media */
export function hidePreviewMedia() {
    return {
        type: HIDE_PREVIEW_MEDIA,
    };
}


export default {
    OPEN_PRVIEW_MEDIA,
    HIDE_PREVIEW_MEDIA,
};
