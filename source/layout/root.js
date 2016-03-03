// :copyright: Copyright (c) 2016 ftrack

import React, { PropTypes } from 'react';

import 'normalize.css';
import 'style/app.scss';


/** A root layout. */
function RootLayout({ children }) {
    return (
        <div className="view-container">
            {children}
        </div>
    );
}

RootLayout.propTypes = {
    children: PropTypes.element,
};

export default RootLayout;
