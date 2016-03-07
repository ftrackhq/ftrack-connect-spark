// :copyright: Copyright (c) 2016 ftrack

import React, { PropTypes } from 'react';
import ToolboxApp from 'react-toolbox/lib/app';

import HeaderContainer from 'container/header';

import 'normalize.css';
import 'style/app.scss';


/** A root layout. */
function RootLayout({ children }) {
    return (
        <ToolboxApp>
            <HeaderContainer />
            {children}
        </ToolboxApp>
    );
}

RootLayout.propTypes = {
    children: PropTypes.element,
};

export default RootLayout;
