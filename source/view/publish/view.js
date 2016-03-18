// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { reduxForm } from 'redux-form';
import { browserHistory } from 'react-router';

import Input from 'react-toolbox/lib/input';
import Button from 'react-toolbox/lib/button';

import Form from 'component/form';
import Selector from 'component/selector';
import { session } from '../../ftrack_api';
import { isEmptyString } from '../../util/validation';

import Reveal from 'component/reveal';
import { publishSubmit } from 'action/publish';

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
        this._contextId = null;
        this.state = { link: '' };
        this._onCancelClick = this._onCancelClick.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
        this._isSubmitDisabled = this._isSubmitDisabled.bind(this);
        this._link = 'Nothing selected.'

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

    componentWillUpdate() {
        // TODO: Props are not passed in correctly. Investigate why and remove
        // the need to store contextId on this.
        if (
            this.props.params.contextId &&
            this.props.params.contextId !== this._contextId
        ) {
            this._contextId = this.props.params.contextId;

            session._query(
                'select link from Context where id is ' +
                `${this.props.params.contextId}`
            ).then((data) => {
                if (data && data.length === 1) {
                    const names = [];
                    for (const item of data[0].link) {
                        names.push(item.name);
                    }

                    this.props.fields.context.onChange(
                        this.props.params.contextId
                    );
                    this.setState({ link: names.join(' / ') });
                }
            });
        }
    }

    /** Navigate back on cancel clicked */
    _onCancelClick(e) {
        e.preventDefault();
        this.context.router.goBack();
    }

    /** Trigger onSubmit with values on submission. */
    _onSubmit(e) {
        e.preventDefault();
        this.props.submitForm(this.props.values);
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

    _onBrowse() {
        const path = '/context/publish/projects';
        browserHistory.push(path);
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
                <div>
                    <Input
                        type="text"
                        label="Linked to"
                        disabled
                        value={ this.state.link }
                    />
                    <Button
                        label="Browse"
                        flat
                        onClick={ this._onBrowse }
                        type="button"
                    />
                </div>
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
    submitForm: React.PropTypes.func.isRequired,
    resetForm: React.PropTypes.func.isRequired,
    submitting: React.PropTypes.bool.isRequired,
    contexts: React.PropTypes.object,
    params: React.PropTypes.object,
};

PublishView.defaultProps = {
    params: {},
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
        submitForm(values) {
            dispatch(publishSubmit(values));
        },
    };
}

PublishView = reduxForm(
    formOptions, mapStateToProps, mapDispatchToProps
)(PublishView);

export default PublishView;
