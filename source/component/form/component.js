// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import Button from 'react-toolbox/lib/button';
import classNames from 'classnames';

import style from './style';

/**
 * Form component
 *
 * Standardize look and behavior of full-size forms. Displays header and
 * action button along with any child components passed to it.
 */
function Form(props) {
    const _classNames = classNames(
        style.root, props.className
    );

    return (
        <form
            className={_classNames}
            onSubmit={props.onSubmit}
        >
            <h2>{props.header}</h2>
            {props.children}
            <div className={style.actions}>
                <Button
                    label="Cancel"
                    onClick={props.onCancel}
                />
                <Button
                    label={props.submitLabel}
                    raised
                    primary
                    disabled={props.submitDisabled}
                />
            </div>
        </form>
    );
}


Form.propTypes = {
    className: React.PropTypes.string,
    header: React.PropTypes.node,
    children: React.PropTypes.node,
    onSubmit: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    submitLabel: React.PropTypes.string,
    submitDisabled: React.PropTypes.bool,
};

Form.defaultProps = {
    className: '',
    header: '',
    children: null,
    submitLabel: 'Submit',
    onSubmit: () => {},
    onCancel: () => {},
    submitDisabled: false,
};

export default Form;
