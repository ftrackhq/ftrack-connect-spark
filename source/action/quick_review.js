// :copyright: Copyright (c) 2016 ftrack

const QUICK_REVIEW_SUBMIT = 'QUICK_REVIEW_SUBMIT';

/** Quick review submit action creator. Call with form *values*. */
export function quickReviewSubmit(values) {
    return {
        type: QUICK_REVIEW_SUBMIT,
        payload: values,
    };
}

export default {
    QUICK_REVIEW_SUBMIT,
};
