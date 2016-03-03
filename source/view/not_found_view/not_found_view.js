// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { IndexLink } from 'react-router';

function NotFoundView() {
    return (
        <div>
            <h2>Oops, could not find that page.</h2>
            <p><IndexLink to="/">Back to home</IndexLink></p>
        </div>
    );
}

export default NotFoundView;
