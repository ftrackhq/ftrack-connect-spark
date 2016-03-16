// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import moment from 'moment';

import Input from 'react-toolbox/lib/input';
import DatePicker from 'react-toolbox/lib/date_picker';
import Button from 'react-toolbox/lib/button';

import Selector from 'component/selector';
import Reveal from 'component/reveal';
import { createProjectSubmit } from 'action/create_project';
import style from './style.scss';

import { session } from '../../ftrack_api';


const validate = ({ name, workflow, startDate, dueDate }) => {
    const errors = {};

    if (!name) {
        errors.name = 'Required';
    }

    if (!workflow) {
        errors.workflow = 'Required';
    }

    if (!startDate) {
        errors.startDate = 'Required';
    }

    if (!startDate) {
        errors.startDate = 'Required';
    }

    return errors;
};


/** Quick review view */
/* eslint-disable react/prefer-stateless-function */
class CreateProjectView extends React.Component {
    constructor() {
        super();
        this._onCancelClick = this._onCancelClick.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
        this._isSubmitDisabled = this._isSubmitDisabled.bind(this);
        const _workflows = session._query(
            'select id, name from ProjectSchema'
        );

        this._workflows = _workflows.then((data) => {
            let result = {};

            for (let workflow of data) {
                console.debug(workflow);
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
                name, workflow, startDate, dueDate,
            },
        } = this.props;

        return (
            <form
                className={style['create-project']}
                onSubmit={this._onSubmit}
            >
                <h2>Create project</h2>
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
                <Reveal label="Add dates" className={style['align-left']}>
                    <DatePicker
                        label="Start date"
                        {...startDate}
                    />
                    <DatePicker
                        label="Due date"
                        {...dueDate}
                    />
                </Reveal>
                <div className={style.actions}>
                    <Button
                        label="Cancel"
                        onClick={this._onCancelClick}
                    />
                    <Button
                        label="Create"
                        raised
                        primary
                        disabled={this._isSubmitDisabled()}
                    />
                </div>
            </form>
        );
    }
}

CreateProjectView.contextTypes = {
    router: React.PropTypes.object.isRequired,
};

CreateProjectView.propTypes = {
    values: React.PropTypes.object.isRequired,
    fields: React.PropTypes.object.isRequired,
    handleSubmit: React.PropTypes.func.isRequired,
    resetForm: React.PropTypes.func.isRequired,
    submitting: React.PropTypes.bool.isRequired,
    workflow: React.PropTypes.object,
};

function mapDispatchToProps(dispatch) {
    return {
        handleSubmit(values) {
            dispatch(createProjectSubmit(values));
        },
    };
}

CreateProjectView = connect(
    null,
    mapDispatchToProps
)(CreateProjectView);

CreateProjectView = reduxForm({
    form: 'createProject',
    fields: [
        'name', 'workflow', 'startDate', 'dueDate',
    ],
    initialValues: {
        startDate: moment().toDate(),
        dueDate: moment().add(1, 'month').toDate(),
    },
    validate,
})(CreateProjectView);

export default CreateProjectView;
