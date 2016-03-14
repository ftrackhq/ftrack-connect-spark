// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import ProgressBar from 'react-toolbox/lib/progress_bar';
import Button from 'react-toolbox/lib/button';
import classNames from 'classnames';

import style from './style';


/**
 * Overlay component.
 *
 * Displays a full-screen overlay which can be customized with various props.
 */
function Overlay({ className, active, loader, header, message, error, dissmissable, onDismss }) {
    const _classNames = classNames(
        style.outer, { [style.active]: active }, className
    );

    const children = [];

    if (loader) {
        children.push(<ProgressBar type="circular" mode="indeterminate" />);
    }

    if (header) {
        children.push(<h2>{header}</h2>);
    }

    if (message) {
        children.push(<p className={style.message}>{message}</p>);
    }

    if (error) {
        children.push(<p className={style['error-message']}>Error: {error}</p>);
    }

    if (dissmissable) {
        children.push(<Button label="Close" onClick={onDismss} raised />);
    }

    return (
        <div className={_classNames}>
            <div className={style.inner}>
                {children}
            </div>
        </div>
    );
}

Overlay.propTypes = {
    className: React.PropTypes.string,
    active: React.PropTypes.bool,
    loader: React.PropTypes.bool,
    header: React.PropTypes.node,
    message: React.PropTypes.node,
    error: React.PropTypes.node,
    dissmissable: React.PropTypes.bool,
    onDismss: React.PropTypes.func,
};

Overlay.defaultProps = {
    className: '',
    active: false,
    loader: false,
    header: null,
    message: null,
    error: null,
    dissmissable: false,
    onDismss: null,
};

export default Overlay;
