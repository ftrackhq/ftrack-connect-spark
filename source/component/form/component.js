// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import Button from 'react-toolbox/lib/button';
import classNames from 'classnames';

import ClosableHeader from 'container/closable_header';
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
        <div>
            <ClosableHeader title={props.header} color={props.headerColor} />
            <form
                className={_classNames}
            >
                {props.children}
                <div className={style.actions}>
                    <Button
                        label="Cancel"
                        onClick={props.onCancel}
                        type="button"
                    />
                    <Button
                        label={props.submitLabel}
                        onClick={props.onSubmit}
                        primary
                        disabled={props.submitDisabled}
                        type="button"
                    />
                </div>
            </form>
        </div>
    );
}


Form.propTypes = {
    className: React.PropTypes.string,
    header: React.PropTypes.node,
    headerColor: React.PropTypes.string,
    children: React.PropTypes.node,
    onSubmit: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    submitLabel: React.PropTypes.string,
    submitDisabled: React.PropTypes.bool,
};

Form.defaultProps = {
    className: '',
    header: '',
    headerColor: 'grey',
    children: null,
    submitLabel: 'Submit',
    onSubmit: () => {},
    onCancel: () => {},
    submitDisabled: false,
};

export default Form;
