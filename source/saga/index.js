// :copyright: Copyright (c) 2016 ftrack

import startupSaga from './startup';
import { quickReviewSubmitSaga } from './quick_review';
import { publishLoadSaga, publishSubmitSaga, publishResolveContextSaga } from './publish';
import { notesLoadSaga, notesLoadNextPageSaga, noteSubmitSaga, noteRemoveSaga } from './note';
import { importGetComponentsSaga, importComponentSaga } from './import';
import { createProjectSaga, createProjectSubmitSaga } from './create_project';


export default [
    startupSaga,
    quickReviewSubmitSaga,
    publishLoadSaga,
    publishSubmitSaga,
    notesLoadSaga,
    notesLoadNextPageSaga,
    noteSubmitSaga,
    noteRemoveSaga,
    createProjectSaga,
    createProjectSubmitSaga,
    publishResolveContextSaga,
    importGetComponentsSaga,
    importComponentSaga,
];
