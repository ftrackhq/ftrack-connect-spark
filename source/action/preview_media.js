// :copyright: Copyright (c) 2016 ftrack

const OPEN_PRVIEW_MEDIA = 'OPEN_PRVIEW_MEDIA';
const DOWNLOAD_PRVIEW_MEDIA = 'DOWNLOAD_PRVIEW_MEDIA';
const HIDE_PREVIEW_MEDIA = 'HIDE_PREVIEW_MEDIA';
const CHANGE_ACTIVE_PREVIEW_MEDIA = 'CHANGE_ACTIVE_PREVIEW_MEDIA';

/** Open media preview of *components*. */
export function openPreviewMedia(components) {
    return {
        type: OPEN_PRVIEW_MEDIA,
        payload: {
            components,
        },
    };
}

export function download(componentId) {
    return {
        type: DOWNLOAD_PRVIEW_MEDIA,
        payload: {
            componentId,
        },
    };
}

export function hidePreviewMedia() {
    return {
        type: HIDE_PREVIEW_MEDIA,
    };
}

export function changeActive(index) {
    return {
        type: CHANGE_ACTIVE_PREVIEW_MEDIA,
        payload: {
            index,
        },
    };
}


export default {
    OPEN_PRVIEW_MEDIA,
    DOWNLOAD_PRVIEW_MEDIA,
    HIDE_PREVIEW_MEDIA,
    CHANGE_ACTIVE_PREVIEW_MEDIA,
};
