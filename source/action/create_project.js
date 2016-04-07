// :copyright: Copyright (c) 2016 ftrack

const CREATE_PROJECT_SUBMIT = 'CREATE_PROJECT_SUBMIT';
const CREATE_PROJECT = 'CREATE_PROJECT';
const CREATE_PROJECT_COMPLETED = 'CREATE_PROJECT_COMPLETED';

/** Action for create project form submit. */
export function createProjectSubmit(values) {
    return {
        type: CREATE_PROJECT_SUBMIT,
        payload: values,
    };
}

/** Action to create a project. */
export function createProject(callback) {
    return {
        type: CREATE_PROJECT,
        payload: callback,
    };
}

/** Action to inform about a newly created project. */
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
