// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import AppBar from 'react-toolbox/lib/app_bar';
import classNames from 'classnames';
import { Button } from 'react-toolbox/lib/button';
import { hashHistory } from 'react-router';

import style from './style';

/** Go back. */
const navigateBack = () => {
    hashHistory.goBack();
};

/** Header component containing back button, title and right button */
function Header(props) {
    const _classNames = classNames(
        style.root, `background-${props.color}`, props.className
    );

    const backButton = (
        <Button
            label="Back"
            icon="chevron_left"
            onClick={navigateBack}
        />
    );

    return (
        <AppBar flat className={_classNames}>
            {props.back ? backButton : null}
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
    back: React.PropTypes.bool,
};

Header.defaultProps = {
    color: 'primary',
    className: '',
    title: null,
    rightButton: null,
    back: false,
};

export default Header;
