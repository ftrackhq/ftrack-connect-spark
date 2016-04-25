// :copyright: Copyright (c) 2016 ftrack

const IMPORT_RESET = 'IMPORT_RESET';
const IMPORT_GET_COMPONENTS = 'IMPORT_GET_COMPONENTS';
const IMPORT_GET_COMPONENTS_SUCCESS = 'IMPORT_GET_COMPONENTS_SUCCESS';
const IMPORT_COMPONENT = 'IMPORT_COMPONENT';


/** Reset import state */
export function importReset() {
    return { type: IMPORT_RESET };
}

/** Get available components for *versionId*. */
export function importGetComponents(versionId) {
    return {
        type: IMPORT_GET_COMPONENTS,
        payload: {
            versionId,
        },
    };
}

/** Available components has been retrieved. */
export function importGetComponentsSuccess(payload) {
    return {
        type: IMPORT_GET_COMPONENTS_SUCCESS,
        payload,
    };
}

/** Import component action creator. Call to import a component */
export function importComponent(payload) {
    return {
        type: IMPORT_COMPONENT,
        payload,
    };
}

export default {
    IMPORT_RESET,
    IMPORT_GET_COMPONENTS,
    IMPORT_GET_COMPONENTS_SUCCESS,
    IMPORT_COMPONENT,
};
