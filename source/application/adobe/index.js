// :copyright: Copyright (c) 2016 ftrack

import createApplication from '../';
import defaultSagas from '../../saga';
import adobeSaga from './saga';
import mediator from './mediator';

createApplication({
    sagas: [...defaultSagas, ...adobeSaga],
    applicationMediator: mediator,
});
