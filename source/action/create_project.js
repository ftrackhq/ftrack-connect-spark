// :copyright: Copyright (c) 2016 ftrack

const CREATE_PROJECT_SUBMIT = 'CREATE_PROJECT_SUBMIT';

export function createProjectSubmit(values) {
    return {
        type: CREATE_PROJECT_SUBMIT,
        payload: values,
    };
}

export default {
    CREATE_PROJECT_SUBMIT,
};
