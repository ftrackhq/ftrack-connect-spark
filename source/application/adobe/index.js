// :copyright: Copyright (c) 2016 ftrack

import createApplication from '../../create_application';
import adobeSaga from './saga';

createApplication({ sagas: [adobeSaga] });

