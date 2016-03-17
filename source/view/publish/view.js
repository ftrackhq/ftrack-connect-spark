// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import Input from 'react-toolbox/lib/input';

import Form from 'component/form';
import Selector from 'component/selector';
import { session } from '../../ftrack_api';
import { isEmptyString } from '../../util/validation';

import Reveal from 'component/reveal';
import { quickReviewSubmit } from 'action/quick_review';

import style from './style.scss';

/** Validate form values and return error object. */
const validateForm = (values) => {
    const errors = {};
    const requiredFields = ['name', 'context', 'type'];
    for (const field of requiredFields) {
        if (isEmptyString(values[field])) {
            errors[field] = 'Required';
        }
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
        const validationErrors = validateForm(this.props.values);
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
                        {...name}
                        error={this._errorMessage(name)}
                    />
                    <Selector
                        label="Type"
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

const formOptions = {
    form: 'publish',
    fields: [
        'name', 'context', 'type', 'description',
    ],
    validateForm,
};

function mapStateToProps(state) {
    const publish = state.screen.publish || {};
    // This is the `Upload` asset type, which is guaranteed to exist.
    const assetTypeId = '8f4144e0-a8e6-11e2-9e96-0800200c9a66';

    return {
        initialValues: {
            name: publish.name || '',
            type: publish.type || assetTypeId,
        },
    };
}

function mapDispatchToProps(dispatch) {
    return {
        handleSubmit(values) {
            dispatch(quickReviewSubmit(values));
        },
    };
}

PublishView = reduxForm(
    formOptions, mapStateToProps, mapDispatchToProps
)(PublishView);

export default PublishView;
