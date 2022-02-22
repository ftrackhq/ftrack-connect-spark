// :copyright: Copyright (c) 2016 ftrack
import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import style from './style.scss';

/** Status bar component, display *color* bar. */
function StatusBar(props) {
    const _classNames = classNames(
        style['status-bar'], props.className
    );
    return (
        <div
            className={_classNames}
            style={{ backgroundColor: props.color }}
        />
    );
}

StatusBar.propTypes = {
    className: PropTypes.string,
    color: PropTypes.string,
};

StatusBar.defaultProps = {
    className: '',
    color: 'rgb(127,127,127)',
};

export default StatusBar;
