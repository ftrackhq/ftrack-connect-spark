// :copyright: Copyright (c) 2016 ftrack

import React, { PropTypes } from 'react';
import ToolboxApp from 'react-toolbox/lib/app';

import ApplicationOverlay from 'container/application_overlay';

// Include global application styles
import 'react-toolbox/components/commons.scss';
import './style.scss';

/** A root layout. */
function RootLayout({ children }) {
    return (
        <ToolboxApp>
            {children}
            <ApplicationOverlay />
        </ToolboxApp>
    );
}

RootLayout.propTypes = {
    children: PropTypes.element,
};

export default RootLayout;
