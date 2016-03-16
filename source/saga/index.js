// :copyright: Copyright (c) 2016 ftrack

import startupSaga from './startup';
import { quickReviewSubmitSaga } from './quick_review';

export default [
    startupSaga,
    quickReviewSubmitSaga,
];
