// :copyright: Copyright (c) 2016 ftrack

const TRACK_USAGE_EVENT = 'TRACK_USAGE_EVENT';

/** Track usage *event* with *metadata*. */
export function trackUsageEvent(event, metadata) {
    return {
        type: TRACK_USAGE_EVENT,
        payload: {
            event,
            metadata,
        },
    };
}

export default {
    TRACK_USAGE_EVENT,
};
