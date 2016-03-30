// :copyright: Copyright (c) 2016 ftrack

const CREATE_PROJECT_SUBMIT = 'CREATE_PROJECT_SUBMIT';
const CREATE_PROJECT = 'CREATE_PROJECT';
const CREATE_PROJECT_COMPLETED = 'CREATE_PROJECT_COMPLETED';

export function createProjectSubmit(values) {
    return {
        type: CREATE_PROJECT_SUBMIT,
        payload: values,
    };
}

export function createProject(action) {
    return {
        type: CREATE_PROJECT,
        payload: action,
    };
}

export function createProjectCompleted(project) {
    return {
        type: CREATE_PROJECT_COMPLETED,
        payload: project,
    };
}

export default {
    CREATE_PROJECT_SUBMIT,
    CREATE_PROJECT,
    CREATE_PROJECT_COMPLETED,
};
