// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { reduxForm } from 'redux-form';
import moment from 'moment';
import PropTypes from 'prop-types';

import Input from 'react-toolbox/lib/input';
import DatePicker from 'react-toolbox/lib/date_picker';

import Form from 'component/form';
import Selector from 'component/selector';
import Reveal from 'component/reveal';
import { createProjectSubmit } from 'action/create_project';

import { session } from '../../ftrack_api';
import { isEmptyString } from '../../util/validation';


/** Validate form values and return error object. */
const validateForm = ({ name, workflow, startDate, dueDate }) => {
    const errors = {};

    if (isEmptyString(name)) {
        errors.name = 'Required';
    }

    if (isEmptyString(workflow)) {
        errors.workflow = 'Required';
    }

    if (!startDate) {
        errors.startDate = 'Required';
    }

    if (!dueDate) {
        errors.dueDate = 'Required';
    }

    return errors;
};


/** Quick review view */
/* eslint-disable react/prefer-stateless-function */
class _CreateProjectView extends React.Component {
    constructor() {
        super();
        this._onCancelClick = this._onCancelClick.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
        this._isSubmitDisabled = this._isSubmitDisabled.bind(this);
        const _workflows = session.query(
            'select id, name from ProjectSchema'
        );

        this._workflows = _workflows.then((data) => {
            const result = {};
            for (const workflow of data.data) {
                result[workflow.id] = workflow.name;
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
                name, workflow, startDate, dueDate,
            },
        } = this.props;

        return (
            <Form
                header="Create project"
                headerColor="orange"
                submitLabel="Create"
                onSubmit={this._onSubmit}
                onCancel={this._onCancelClick}
                submitDisabled={this._isSubmitDisabled()}
            >
                <Input
                    type="text"
                    label="Project name"
                    name="name"
                    {...name}
                    error={this._errorMessage(name)}
                />
                <Selector
                    label="Workflow"
                    query={this._workflows}
                    {...workflow}
                />
                <Reveal label="Add dates" className="flex-justify-start">
                    <DatePicker
                        label="Start date"
                        {...startDate}
                    />
                    <DatePicker
                        label="Due date"
                        {...dueDate}
                    />
                </Reveal>
            </Form>
        );
    }
}

_CreateProjectView.contextTypes = {
    router: PropTypes.object.isRequired,
};

_CreateProjectView.propTypes = {
    values: PropTypes.object.isRequired,
    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    resetForm: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    workflow: PropTypes.object,
};

function mapDispatchToProps(dispatch) {
    return {
        handleSubmit(values) {
            dispatch(createProjectSubmit(values));
        },
    };
}

const CreateProjectView = reduxForm({
    form: 'createProject',
    fields: [
        'name', 'workflow', 'startDate', 'dueDate',
    ],
    initialValues: {
        startDate: moment().toDate(),
        dueDate: moment().add(1, 'month').toDate(),
    },
    validateForm,
}, null, mapDispatchToProps)(_CreateProjectView);

export default CreateProjectView;
