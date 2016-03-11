// :copyright: Copyright (c) 2016 ftrack

const QUICK_REVIEW_LOAD = 'QUICK_REVIEW_LOAD';
const QUICK_REVIEW_PROJECTS_LOADED = 'QUICK_REVIEW_PROJECTS_LOADED';
const QUICK_REVIEW_SUBMIT = 'QUICK_REVIEW_SUBMIT';

/** Quick review load action creator. */
export function quickReviewLoad() {
    return { type: QUICK_REVIEW_LOAD };
}

/** Quick review projects loaded action creator. Call with array of *projects*. */
export function quickReviewProjectsLoaded(projects) {
    return {
        type: QUICK_REVIEW_PROJECTS_LOADED,
        payload: projects,
    };
}

/** Quick review submit action creator. Call with form *values*. */
export function quickReviewSubmit(values) {
    return {
        type: QUICK_REVIEW_SUBMIT,
        payload: values,
    };
}

export default {
    QUICK_REVIEW_LOAD,
    QUICK_REVIEW_PROJECTS_LOADED,
    QUICK_REVIEW_SUBMIT,
};
