// :copyright: Copyright (c) 2016 ftrack

import React, { PropTypes } from 'react';
import ToolboxApp from 'react-toolbox/lib/app';

import HeaderContainer from 'container/header';

import 'react-toolbox/components/commons.scss';
import style from './style.scss';


/** A root layout. */
function RootLayout({ children }) {
    return (
        <ToolboxApp>
            <HeaderContainer />
            <div className={style.main}>
                {children}
            </div>
        </ToolboxApp>
    );
}

RootLayout.propTypes = {
    children: PropTypes.element,
};

export default RootLayout;
