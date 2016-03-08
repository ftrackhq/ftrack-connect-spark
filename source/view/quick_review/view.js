// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import Input from 'react-toolbox/lib/input';
import DatePicker from 'react-toolbox/lib/date_picker';
import Button from 'react-toolbox/lib/button';

import ProjectSelector from 'container/project_selector';
import Reveal from 'component/reveal';
import { quickReviewSubmit } from 'action/quick_review';
import style from './style.scss';

/** Quick Review Preview (Placeholder element) */
function QuickReviewPreview() {
    return (
        <div className={style.preview}>[Preview]</div>
    );
}

const validate = ({ name, project, collaborators }) => {
    const errors = {};

    if (!name) {
        errors.name = 'Required';
    }

    if (!project) {
        errors.project = 'Required';
    }

    if (!collaborators) {
        errors.collaborators = 'Required';
    } else if (!collaborators.includes('@')) {
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
                name, project, collaborators, description, expiryDate,
            },
        } = this.props;

        return (
            <form
                className={style['quick-review']}
                onSubmit={this._onSubmit}
            >
                <h2>Share a quick review</h2>
                <QuickReviewPreview />
                <ProjectSelector
                    projects={this.props.projects}
                    {...project}
                />
                <Input
                    type="text"
                    label="Review session name"
                    name="name"
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
                <Reveal label="Add description" className={style['align-left']}>
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
                <Reveal label="Add expiry" className={style['align-left']}>
                    <DatePicker
                        label="Expiry date"
                        {...expiryDate}
                    />
                </Reveal>
                <div className={style.actions}>
                    <Button
                        label="Cancel"
                        onClick={this._onCancelClick}
                    />
                    <Button
                        label="Share"
                        raised
                        primary
                        disabled={this._isSubmitDisabled()}
                    />
                </div>
            </form>
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
    validate,
})(QuickReviewView);

export default QuickReviewView;
