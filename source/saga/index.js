// :copyright: Copyright (c) 2016 ftrack

import startupSaga from './startup';
import { quickReviewSubmitSaga } from './quick_review';
import { publishLoadSaga, publishSubmitSaga } from './publish';
import { createProjectSaga, createProjectSubmitSaga } from './create_project';

export default [
    startupSaga,
    quickReviewSubmitSaga,
    publishLoadSaga,
    publishSubmitSaga,
    createProjectSaga,
    createProjectSubmitSaga,
];
