// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import Input from 'react-toolbox/lib/input';
import DatePicker from 'react-toolbox/lib/date_picker';
import { Link } from 'react-router';

import Form from 'component/form';
import Selector from 'component/selector';
import { session } from '../../ftrack_api';
import {
    isValidCommaSeparatedEmails, isEmptyString,
} from '../../util/validation';
import Reveal from 'component/reveal';
import { quickReviewSubmit } from 'action/quick_review';

/** Validate form values and return error object. */
const validateForm = (values) => {
    const errors = {};
    const requiredFields = ['name', 'project'];
    for (const field of requiredFields) {
        if (isEmptyString(values[field])) {
            errors[field] = 'Required';
        }
    }

    if (isEmptyString(values.collaborators)) {
        errors.collaborators = 'Required';
    } else if (!isValidCommaSeparatedEmails(values.collaborators)) {
        errors.collaborators = 'Invalid email address(es)';
    }

    return errors;
};

/** Quick review view */
/* eslint-disable react/prefer-stateless-function */
class QuickReviewView extends React.Component {
    constructor() {
        super();
        this._onCancelClick = this._onCancelClick.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
        this._isSubmitDisabled = this._isSubmitDisabled.bind(this);

        const _projects = session._query(
            'select id, full_name from Project where status is "active"'
        );

        this._projects = _projects.then((data) => {
            const result = {};
            for (const project of data.data) {
                result[project.id] = project.full_name;
            }
            return result;
        });
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
                name, project, collaborators, description, expiryDate,
            },
        } = this.props;

        return (
            <Form
                header="Share a quick review"
                headerColor="cyan"
                submitLabel="Share"
                onSubmit={this._onSubmit}
                onCancel={this._onCancelClick}
                submitDisabled={this._isSubmitDisabled()}
            >
                <Selector
                    label="Select project"
                    query={this._projects}
                    {...project}
                />
                <p>Or, <Link to="/create-project">create a new project</Link>.</p>
                <Input
                    type="text"
                    label="Review session name"
                    name="name"
                    value="TESTING"
                    {...name}
                    error={this._errorMessage(name)}
                />
                <Input
                    type="text"
                    label="Invite collaborators"
                    name="collaborators"
                    {...collaborators}
                    error={this._errorMessage(collaborators)}
                />
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
                <Reveal label="Add expiry">
                    <DatePicker
                        label="Expiry date"
                        {...expiryDate}
                    />
                </Reveal>
            </Form>
        );
    }
}

QuickReviewView.contextTypes = {
    router: React.PropTypes.object.isRequired,
};

QuickReviewView.propTypes = {
    values: React.PropTypes.object.isRequired,
    fields: React.PropTypes.object.isRequired,
    handleSubmit: React.PropTypes.func.isRequired,
    resetForm: React.PropTypes.func.isRequired,
    submitting: React.PropTypes.bool.isRequired,
    projects: React.PropTypes.object,
};

function mapDispatchToProps(dispatch) {
    return {
        handleSubmit(values) {
            dispatch(quickReviewSubmit(values));
        },
    };
}

QuickReviewView = connect(
    null,
    mapDispatchToProps
)(QuickReviewView);

QuickReviewView = reduxForm({
    form: 'quickReview',
    fields: [
        'name', 'project', 'collaborators', 'description', 'expiryDate',
    ],
    validateForm,
})(QuickReviewView);

export default QuickReviewView;
