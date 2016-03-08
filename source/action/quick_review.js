// :copyright: Copyright (c) 2016 ftrack

const QUICK_REVIEW_LOAD = 'QUICK_REVIEW_LOAD';
const QUICK_REVIEW_PROJECTS_LOADED = 'QUICK_REVIEW_PROJECTS_LOADED';
const QUICK_REVIEW_SUBMIT = 'QUICK_REVIEW_SUBMIT';

export function quickReviewLoad() {
    return { type: QUICK_REVIEW_LOAD };
}

export function quickReviewProjectsLoaded(projects) {
    return {
        type: QUICK_REVIEW_PROJECTS_LOADED,
        payload: projects,
    };
}

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
