// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import AppBar from 'react-toolbox/lib/app_bar';
import classNames from 'classnames';
import { Button } from 'react-toolbox/lib/button';
import { hashHistory } from 'react-router';
import PropTypes from 'prop-types';

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
            <h4 className={style.center}>
                {props.centerItems}
            </h4>
            <div>
            {props.rightItems}
            </div>
        </AppBar>
    );
}

Header.contextTypes = {
    router: PropTypes.object,
};

Header.propTypes = {
    className: PropTypes.string,
    color: PropTypes.string,
    title: PropTypes.node,
    rightItems: PropTypes.node,
    back: PropTypes.bool,
    centerItems: PropTypes.node,
};

Header.defaultProps = {
    color: 'primary',
    className: '',
    title: null,
    rightItems: null,
    back: false,
    centerItems: [],
};

export default Header;
