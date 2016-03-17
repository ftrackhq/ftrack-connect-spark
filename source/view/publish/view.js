// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import Input from 'react-toolbox/lib/input';

import Form from 'component/form';
import Selector from 'component/selector';
import { session } from '../../ftrack_api';

import Reveal from 'component/reveal';
import { quickReviewSubmit } from 'action/quick_review';

import style from './style.scss';


/** Return if *str* is null/undefined or an empty string. */
function isEmptyString(str) {
    return (!str || !str.length || !str.trim());
}

/** Validate form values and return error object. */
const validate = ({ name, context, type }) => {
    const errors = {};

    if (isEmptyString(name)) {
        errors.name = 'Required';
    }

    if (isEmptyString(context)) {
        errors.context = 'Required';
    }

    if (isEmptyString(type)) {
        errors.type = 'Required';
    }

    return errors;
};


/** Quick review view */
/* eslint-disable react/prefer-stateless-function */
class PublishView extends React.Component {
    constructor() {
        super();
        this._onCancelClick = this._onCancelClick.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
        this._isSubmitDisabled = this._isSubmitDisabled.bind(this);

        this._contexts = session._query(
            'select id, full_name from Project'
        ).then((data) => data.reduce(
            (accumulator, item) => (
                Object.assign({}, accumulator, { [item.id]: item.full_name })
            ), {}
        ));

        this._assetTypes = session._query(
            'select id, name from AssetType'
        ).then((data) => data.reduce(
            (accumulator, item) => (
                Object.assign({}, accumulator, { [item.id]: item.name })
            ), {}
        ));
    }

    /** Navigate back on cancel clicked */
    _onCancelClick(e) {
        e.preventDefault();
        this.context.router.goBack();
    }

    /** Trigger handleSubmit with values on submission. */
    _onSubmit(e) {
        e.preventDefault();
        this.props.handleSubmit(this.props.values);
    }

    /** Return if submit should be disabled */
    _isSubmitDisabled() {
        const validationErrors = validate(this.props.values);
        return (
            this.props.submitting ||
            !!Object.keys(validationErrors).length
        );
    }

    /** Return error message for *field*. */
    _errorMessage(field) {
        return field.touched && field.error || null;
    }


    render() {
        const {
            fields: {
                context, name, type, description,
            },
        } = this.props;

        return (
            <Form
                header="Publish your work"
                submitLabel="Publish"
                onSubmit={this._onSubmit}
                onCancel={this._onCancelClick}
                submitDisabled={this._isSubmitDisabled()}
            >
                <Selector
                    label="Select context"
                    query={this._contexts}
                    {...context}
                />
                <div className={style.asset}>
                    <Input
                        type="text"
                        label="Name"
                        name="name"
                        className={style['asset-name']}
                        {...name}
                        error={this._errorMessage(name)}
                    />
                    <Selector
                        label="Type"
                        className={style['asset-type']}
                        query={this._assetTypes}
                        {...type}
                    />
                </div>
                <Reveal label="Add description">
                    <Input
                        type="text"
                        label="Description"
                        name="description"
                        multiline
                        autoFocus
                        {...description}
                        error={this._errorMessage(description)}
                    />
                </Reveal>
            </Form>
        );
    }
}

PublishView.contextTypes = {
    router: React.PropTypes.object.isRequired,
};

PublishView.propTypes = {
    values: React.PropTypes.object.isRequired,
    fields: React.PropTypes.object.isRequired,
    handleSubmit: React.PropTypes.func.isRequired,
    resetForm: React.PropTypes.func.isRequired,
    submitting: React.PropTypes.bool.isRequired,
    contexts: React.PropTypes.object,
};

function mapDispatchToProps(dispatch) {
    return {
        handleSubmit(values) {
            dispatch(quickReviewSubmit(values));
        },
    };
}

PublishView = connect(
    null,
    mapDispatchToProps
)(PublishView);

PublishView = reduxForm({
    form: 'quickReview',
    fields: [
        'name', 'context', 'type', 'description',
    ],
    validate,
})(PublishView);

export default PublishView;
