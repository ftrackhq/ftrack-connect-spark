// :copyright: Copyright (c) 2016 ftrack

import { takeEvery, takeLatest } from 'redux-saga';
import { call, take, put } from 'redux-saga/effects';
import { hashHistory } from 'react-router';

import { session } from '../ftrack_api';
import { createOperation } from '../ftrack_api/operation';
import actions from 'action/create_project';

import { ServerPermissionDeniedError, ServerValidationError } from '../ftrack_api/error';
import { showProgress, showCompletion, showFailure } from './lib/overlay';

import loglevel from 'loglevel';
const logger = loglevel.getLogger('saga:create_project');


/** Create project from *action*. */
function* createProjectSubmit(action) {
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
        });
        yield put({ type: actions.CREATE_PROJECT_COMPLETED, payload: project });
    } catch (error) {
        let message;

        if (error instanceof ServerPermissionDeniedError) {
            message = 'You\'re not permitted to create a project';
        } else if (error instanceof ServerValidationError) {
            message = (
                'Could not create project, please verify the form and that ' +
                'the project name is unique.'
            );
        }
        yield call(
            showFailure,
            {
                header: 'Failed to create project.',
                details: error.message,
                message,
            }
        );
    }
}

function* createProject(action) {
    hashHistory.push('/create-project');

    const completedAction = yield take(actions.CREATE_PROJECT_COMPLETED);

    hashHistory.goBack();
    action.payload(completedAction.payload);
}

/** Run createProjectSaga on CREATE_PROJECT_SUBMIT */
export function* createProjectSubmitSaga() {
    yield takeEvery(actions.CREATE_PROJECT_SUBMIT, createProjectSubmit);
}

/** Run createProjectSaga on CREATE_PROJECT_SUBMIT */
export function* createProjectSaga() {
    yield takeLatest(actions.CREATE_PROJECT, createProject);
}
