// :copyright: Copyright (c) 2016 ftrack

const OVERLAY_SHOW = 'OVERLAY_SHOW';
const OVERLAY_HIDE = 'OVERLAY_HIDE';

/** Hide application overlay. */
export function overlayHide() {
    return { type: OVERLAY_HIDE };
}

/** Show application overlay with configuration in *overlay*. */
export function overlayShow(overlay) {
    return {
        type: OVERLAY_SHOW,
        payload: {
            overlay,
        },
    };
}

export default {
    OVERLAY_HIDE,
    OVERLAY_SHOW,
};
