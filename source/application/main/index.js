// :copyright: Copyright (c) 2016 ftrack

import createApplication from '../../create_application';
import defaultSagas from '../../saga';
import mockSagas from './saga';

createApplication({ sagas: [...defaultSagas, ...mockSagas] });
