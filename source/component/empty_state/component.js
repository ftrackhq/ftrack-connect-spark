// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import FontIcon from 'react-toolbox/lib/font_icon';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import style from './style.scss';


/** Connect missing view. */
function EmptyState({ icon, message, children, className }) {
    const _classNames = classNames(style.component, className);

    const iconElement = (typeof icon === 'string') ? <FontIcon value={icon} /> : icon;

    return (
        <div className={_classNames}>
            <div className={style.icon}>{iconElement}</div>
            <h4 className={style.message}>{message}</h4>
            {children}
        </div>
    );
}

EmptyState.propTypes = {
    className: PropTypes.string,
    icon: PropTypes.string,
    message: PropTypes.node,
    children: PropTypes.node,
};

export default EmptyState;
