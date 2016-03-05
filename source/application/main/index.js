// :copyright: Copyright (c) 2016 ftrack

import createApplication from '../../create_application';
import mockSaga from './saga';

createApplication({ sagas: [mockSaga] });
