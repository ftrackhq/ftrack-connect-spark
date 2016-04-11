// :copyright: Copyright (c) 2016 ftrack

import createApplication from '../';
import defaultSagas from '../../saga';
import adobeSaga from './saga';
import mediator from './mediator';
import loglevel from 'loglevel';
const logger = loglevel.getLogger('adobe:index');

logger.info('Creating adobe application');
createApplication({
    sagas: [...defaultSagas, ...adobeSaga],
    applicationMediator: mediator,
});
