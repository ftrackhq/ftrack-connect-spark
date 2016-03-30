// :copyright: Copyright (c) 2016 ftrack

import { takeEvery } from 'redux-saga';
import { call } from 'redux-saga/effects';
import { browserHistory } from 'react-router';

import { session } from '../ftrack_api';
import { createOperation } from '../ftrack_api/operation';
import actions from 'action/create_project';

import { showProgress, showCompletion, showFailure } from './lib/overlay';

import loglevel from 'loglevel';
const logger = loglevel.getLogger('saga:create_project');

/** Create project from *action*. */
function* createProject(action) {
    try {
        const values = action.payload;
        logger.debug('createProject', values);

        yield showProgress('Creating project...');
        const responses = yield call(
            [session, session._call],
            [
                createOperation(
                    'Project',
                    {
                        name: values.name,
                        full_name: values.name,
                        project_schema_id: values.workflow,
                        start_date: values.startDate,
                        end_date: values.dueDate,
                    }
                ),
            ]
        );
        const project = responses[0].data;
        logger.debug('Created project', project);

        yield call(showCompletion, {
            header: 'Completed',
            message: 'Project created successfully.',
        }, () => {
            browserHistory.goBack();
        });
    } catch (error) {
        yield call(showFailure, { header: 'Failed to create project.', error });
    }
}

/** Run createProjectSaga on CREATE_PROJECT_SUBMIT */
export function* createProjectSaga() {
    yield takeEvery(actions.CREATE_PROJECT_SUBMIT, createProject);
}
