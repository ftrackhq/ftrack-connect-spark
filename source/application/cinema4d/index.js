// :copyright: Copyright (c) 2016 ftrack

import createApplication from '../';
import defaultSagas from '../../saga';
import c4dSagas from './saga';
import mediator from './mediator';

import loglevel from 'loglevel';
const logger = loglevel.getLogger('cinema4d:index');


logger.info('Creating Cinema4D application');
createApplication({
    sagas: [...defaultSagas, ...c4dSagas],
    applicationMediator: mediator,
});
