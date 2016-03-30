// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import AppBar from 'react-toolbox/lib/app_bar';
import classNames from 'classnames';

import style from './style';


/** Header container containing share menu */
/* eslint-disable react/prefer-stateless-function */
function Header(props) {
    const _classNames = classNames(
        style.root, `background-${props.color}`, props.className
    );

    return (
        <AppBar flat className={_classNames}>
            <h4 className={style.title}>{props.title}</h4>
            {props.rightButton}
        </AppBar>
    );
}

Header.contextTypes = {
    router: React.PropTypes.object,
};

Header.propTypes = {
    className: React.PropTypes.string,
    color: React.PropTypes.string,
    title: React.PropTypes.node,
    rightButton: React.PropTypes.node,
};

Header.defaultProps = {
    color: 'primary',
    className: '',
    title: '',
    rightButton: '',
};

export default Header;
