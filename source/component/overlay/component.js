// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import ProgressBar from 'react-toolbox/lib/progress_bar';
import Button from 'react-toolbox/lib/button';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import Reveal from 'component/reveal';

import style from './style';


/**
 * Overlay component.
 *
 * Displays a full-screen overlay which can be customized with various props.
 */
function Overlay(props) {
    const {
        className, active, fixed, loader, progress, header, message,
        details, dismissable, onDismss, dismissLabel,
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

    if (details) {
        children.push(
            <div key="details" className={style.details}>
                <Reveal label="Details">{details}</Reveal>
            </div>
        );
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
    className: PropTypes.string,
    active: PropTypes.bool,
    fixed: PropTypes.bool,
    loader: PropTypes.bool,
    progress: PropTypes.number,
    header: PropTypes.node,
    message: PropTypes.node,
    details: PropTypes.node,
    dismissable: PropTypes.bool,
    onDismss: PropTypes.func,
    dismissLabel: PropTypes.node,
};

Overlay.defaultProps = {
    className: '',
    active: false,
    fixed: false,
    loader: false,
    progress: null,
    header: null,
    message: null,
    details: null,
    dismissable: false,
    onDismss: null,
    dismissLabel: 'Close',
};

export default Overlay;
