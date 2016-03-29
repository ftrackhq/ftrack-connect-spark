// :copyright: Copyright (c) 2016 ftrack

import createApplication from '../';
import defaultSagas from '../../saga';
import adobeSaga from './saga';
import mediator from './mediator';

import loglevel from 'loglevel';
const logger = loglevel.getLogger('cinema4d:index');


function loadQueryParameters(searchParam) {
    const encodedValue = searchParam.split('=')[1];
    const decodedValue = JSON.parse(window.atob(encodedValue));
    return decodedValue;
}

function initialize() {
    window.__FTRACK_C4D = {};
    try {
        window.__FTRACK_C4D.options = loadQueryParameters(window.location.search);
    } catch (err) {
        logger.error(err);
    }
}

logger.info('Creating Cinema4D application');
initialize();
createApplication({
    sagas: [...defaultSagas, ...adobeSaga],
    applicationMediator: mediator,
});
