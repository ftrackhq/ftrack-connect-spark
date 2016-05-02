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
function Overlay(props) {
    const {
        className, active, fixed, loader, progress, header, message, error,
        dismissable, onDismss, dismissLabel,
    } = props;

    const _classNames = classNames(
        style.outer, {
            [style.active]: active,
            [style.fixed]: fixed,
        }, className
    );

    const children = [];

    if (loader) {
        const mode = (progress === null) ? 'indeterminate' : 'determinate';
        children.push(<ProgressBar key="loader" type="circular" mode={mode} value={progress} />);
    }

    if (header) {
        children.push(<h3 key="header">{header}</h3>);
    }

    if (message) {
        children.push(<h6 key="message" className={style.message}>{message}</h6>);
    }

    if (error) {
        children.push(<p key="error" className={style['error-message']}>Error: {error}</p>);
    }

    if (dismissable) {
        children.push(
            <Button key="dismiss-button" label={dismissLabel} onClick={onDismss} raised />
        );
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
    fixed: React.PropTypes.bool,
    loader: React.PropTypes.bool,
    progress: React.PropTypes.number,
    header: React.PropTypes.node,
    message: React.PropTypes.node,
    error: React.PropTypes.node,
    dismissable: React.PropTypes.bool,
    onDismss: React.PropTypes.func,
    dismissLabel: React.PropTypes.node,
};

Overlay.defaultProps = {
    className: '',
    active: false,
    fixed: false,
    loader: false,
    progress: null,
    header: null,
    message: null,
    error: null,
    dismissable: false,
    onDismss: null,
    dismissLabel: 'Close',
};

export default Overlay;
