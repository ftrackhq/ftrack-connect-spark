// :copyright: Copyright (c) 2016 ftrack

import { takeEvery } from 'redux-saga';
import { put } from 'redux-saga/effects';

import { mediator } from '../application';
import actions, { importGetComponentsSuccess } from 'action/import';
import { notificationSuccess, notificationWarning } from 'action/notification';

import loglevel from 'loglevel';
const logger = loglevel.getLogger('saga:import');

/**
 * Get importable components
 */
function* getImportComponents(action) {
    logger.info('Get import components', action);
    const versionId = action.payload.versionId;
    try {
        yield put(importGetComponentsSuccess({ versionId, loading: true }));
        const components = yield mediator.getImportComponents(action.payload);
        yield put(importGetComponentsSuccess({ versionId, components }));
    } catch (error) {
        logger.error('Notification failure', error);
        yield put(importGetComponentsSuccess({ versionId, components: [], loading: false }));
        yield put(notificationWarning('Import failed'));
    }
}


/**
 * Import component
 */
function* importComponent(action) {
    logger.info('Import component');
    try {
        const result = yield mediator.importComponent(action.payload);
        logger.info('Import finished', result);
        yield put(notificationSuccess('Import completed'));
    } catch (error) {
        logger.error('Notification failure', error);
        yield put(notificationWarning('Import failed'));
    }
}

/** Prepare publish on IMPORT_COMPONENT */
export function* importGetComponentsSaga() {
    yield takeEvery(actions.IMPORT_GET_COMPONENTS, getImportComponents);
}

/** Prepare publish on IMPORT_COMPONENT */
export function* importComponentSaga() {
    yield takeEvery(actions.IMPORT_COMPONENT, importComponent);
}

