// :copyright: Copyright (c) 2016 ftrack

const PUBLISH_LOAD = 'PUBLISH_LOAD';
const PUBLISH_OPTIONS = 'PUBLISH_OPTIONS';
const PUBLISH_SUBMIT = 'PUBLISH_SUBMIT';
const PUBLISH_RESOLVE_CONTEXT = 'PUBLISH_RESOLVE_CONTEXT';

/** Publish load action creator. Call when publish load is called */
export function publishLoad(onComplete) {
    return {
        type: PUBLISH_LOAD,
        payload: { onComplete },
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

/** Resolve publish context into task and parent. */
export function publishResolveContext(id) {
    return {
        type: PUBLISH_RESOLVE_CONTEXT,
        payload: id,
    };
}

export default {
    PUBLISH_LOAD,
    PUBLISH_OPTIONS,
    PUBLISH_SUBMIT,
    PUBLISH_RESOLVE_CONTEXT,
};
