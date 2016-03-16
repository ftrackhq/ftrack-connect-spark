// :copyright: Copyright (c) 2016 ftrack

import startupSaga from './startup';
import { quickReviewLoadSaga, quickReviewSubmitSaga } from './quick_review';

export default [
    startupSaga,
    quickReviewLoadSaga,
    quickReviewSubmitSaga,
];
