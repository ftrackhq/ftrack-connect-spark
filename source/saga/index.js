// :copyright: Copyright (c) 2016 ftrack

import startupSaga from './startup';
import { quickReviewSubmitSaga } from './quick_review';

import { publishLoadSaga, publishSubmitSaga, publishResolveContextSaga } from './publish';
import { notesLoadSaga, noteSubmitSaga, noteRemoveSaga } from './note';


export default [
    startupSaga,
    quickReviewSubmitSaga,
    publishLoadSaga,
    publishSubmitSaga,
    notesLoadSaga,
    noteSubmitSaga,
    noteRemoveSaga,
    publishResolveContextSaga,
];
