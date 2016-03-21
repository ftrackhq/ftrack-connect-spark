// :copyright: Copyright (c) 2016 ftrack

const PUBLISH_LOAD = 'PUBLISH_LOAD';
const PUBLISH_OPTIONS = 'PUBLISH_OPTIONS';
const PUBLISH_SUBMIT = 'PUBLISH_SUBMIT';

/** Publish load action creator. Call when publish load is called */
export function publishLoad() {
    return {
        type: PUBLISH_LOAD,
    };
}

/** Publish options action creator. Call when publish options has been gathered. */
export function publishOptions(options) {
    return {
        type: PUBLISH_OPTIONS,
        payload: options,
    };
}

/** Publish submit action creator. Call with form *values*. */
export function publishSubmit(values) {
    return {
        type: PUBLISH_SUBMIT,
        payload: values,
    };
}

export default {
    PUBLISH_LOAD,
    PUBLISH_OPTIONS,
    PUBLISH_SUBMIT,
};
