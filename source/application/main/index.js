// :copyright: Copyright (c) 2016 ftrack

import createApplication from '../';
import defaultSagas from '../../saga';
import mockSagas from './saga';
import mediator from './mediator';

createApplication({
    sagas: [...defaultSagas, ...mockSagas],
    applicationMediator: mediator,
});
