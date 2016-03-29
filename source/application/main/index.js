// :copyright: Copyright (c) 2016 ftrack

import createApplication from '../';
import defaultSagas from '../../saga';
import mockSagas from './saga';
import mediator from './mediator';
import loglevel from 'loglevel';
const logger = loglevel.getLogger('main:index');

logger.info('Creating development application');
createApplication({
    sagas: [...defaultSagas, ...mockSagas],
    applicationMediator: mediator,
});
