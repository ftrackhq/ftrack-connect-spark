// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { debounce } from 'lodash/function';

import Input from 'react-toolbox/lib/input';
import DatePicker from 'react-toolbox/lib/date_picker';
import { List, ListItem } from 'react-toolbox';
import Button from 'react-toolbox/lib/button';

import Form from 'component/form';
import Selector from 'component/selector';
import { session } from '../../ftrack_api';
import { queryOperation } from '../../ftrack_api/operation';
import {
    isEmptyString,
} from '../../util/validation';
import {
    guessName,
} from '../../util/string';
import Reveal from 'component/reveal';
import { quickReviewSubmit } from 'action/quick_review';
import { createProject } from 'action/create_project';

import style from './style.scss';

/** Validate form values and return error object. */
const validateForm = (values) => {
    const errors = {};
    const requiredFields = ['name', 'project'];
    for (const field of requiredFields) {
        if (isEmptyString(values[field])) {
            errors[field] = 'Required';
        }
    }

    if (!values.collaborators.length) {
        errors.collaborators = 'Required';
    }

    return errors;
};

function ResultList({ items, onClick }) {
    if (items.length) {
        const result = items.map((item) => {
            const handleClick = onClick.bind(null, item);

            return (
                <ListItem
                    avatar={session.thumbnail(item.thumbnail_id, 100)}
                    caption={ item.name }
                    legend={ item.email }
                    onClick={ handleClick }
                />
            );
        });

        return (
            <List selectable ripple>
                { result }
            </List>
        );
    }

    return (
        <div></div>
    );
}

ResultList.propTypes = {
    items: React.PropTypes.array,
    onClick: React.PropTypes.func,
};

/** Quick review view */
/* eslint-disable react/prefer-stateless-function */
class QuickReviewView extends React.Component {
    constructor() {
        super();
        this.state = {
            collaborator: '',
            availableCollaborators: [],
            name: '',
            helpText: '',
        };
        this._onCancelClick = this._onCancelClick.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
        this._isSubmitDisabled = this._isSubmitDisabled.bind(this);
        this._createProject = this._createProject.bind(this);
        this._updateProject = this._updateProject.bind(this);
        this._loadCollaborators = debounce(
            this._loadCollaborators.bind(this), 500
        );
        this._onChange = this._onChange.bind(this);
        this.addCollaborator = this.addCollaborator.bind(this);
        this._changeName = this._changeName.bind(this);
        this._addNewCollaborator = this._addNewCollaborator.bind(this);

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
        this.props.resetForm();
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

    /** Update the selected project with the new one. */
    _updateProject(project) {
        this.props.fields.project.onChange(project.id);
    }

    /** Create a new project. */
    _createProject(e) {
        e.preventDefault();
        this.props.createProject(this._updateProject);
    }

    _onChange(value) {
        if (value.length >= 3) {
            this._loadCollaborators(value);
        } else {
            this.setState({
                availableCollaborators: [],
            });
        }

        let name = '';
        if (value.includes('@')) {
            name = guessName(value);
        }

        this.setState({
            name,
            collaborator: value,
        });
    }

    _loadCollaborators(value) {
        const inviteeQuery = (
            'select name, email from ReviewSessionInvitee where name ' +
            `like "%${value}%" or email like "%${value}%"`
        );
        const userQuery = (
            'select first_name, last_name, email, thumbnail_id from User ' +
            `where first_name like "%${value}%" or email like "%${value}%" ` +
            'and is_active is true'
        );

        const promise = session._call([
            queryOperation(inviteeQuery),
            queryOperation(userQuery),
        ]);

        promise.then((responses) => {
            const results = {};
            const collaborators = [];
            const invitees = responses[0].data;
            const users = responses[1].data;

            if (invitees.length) {
                for (const item of invitees) {
                    if (item.email) {
                        results[item.email] = {
                            email: item.email,
                            name: item.name,
                            thumbnail_id: null,
                        };
                    }
                }
            }

            if (users.length) {
                for (const item of users) {
                    if (item.email) {
                        results[item.email] = {
                            email: item.email,
                            name: `${item.first_name} ${item.last_name}`,
                            thumbnail_id: item.thumbnail_id,
                        };
                    }
                }
            }

            Object.keys(results).forEach((email) => {
                collaborators.push(results[email]);
            });

            this.setState({
                availableCollaborators: collaborators.slice(0, 5),
            });
        });
    }

    _renderList(collaborators) {
        const result = collaborators.map((item) => {
            const addCollaborator = this.addCollaborator.bind(this, item);

            return (
                <ListItem
                    avatar={session.thumbnail(item.thumbnail_id, 100)}
                    caption={ item.name }
                    legend={ item.email }
                    onClick={ addCollaborator }
                />
            );
        });

        return result;
    }

    addCollaborator(item) {
        // User already exists.
        const exists = this.props.fields.collaborators.value.find(
            collaborator => collaborator.email === item.email
        );

        // Clear form.
        this.setState({
            availableCollaborators: [],
        });

        if (exists) {
            return;
        }

        this.props.fields.collaborators.onChange(
            this.props.fields.collaborators.value.concat([item])
        );
    }

    _addNewCollaborator() {
        const email = this.state.collaborator;
        const name = this.state.name;

        this.addCollaborator({
            name,
            email,
            thumbnail_id: null,
        });

        this.setState({
            name: '',
            collaborator: '',
        });
    }

    _changeName(name) {
        this.setState({
            name,
        });
    }

    renderResult(collaborators) {
        const result = [];

        if (collaborators.length) {
            result.push(
                <ResultList
                    items={ this.state.availableCollaborators }
                    onClick={this.addCollaborator}
                />
            );
        } else if (this.state.name !== '') {
            result.push(
                <div>
                    <p className="text-faded">
                        Invite {this.state.name}? {this.state.name} will
                        automatically recieve an invitation email.
                    </p>
                    <div className={ style.user }>
                        <Input
                            value={ this.state.name }
                            onChange={ this._changeName }
                        />
                        <Button
                            className={ style.addButton }
                            label="Add"
                            primary
                            onClick={ this._addNewCollaborator }
                            type="button"
                        />
                    </div>
                </div>
            );
        } else {
            result.push(
                <p className="text-more-faded">
                    Search for a person by name or email address, or enter an
                    email address to invite someone new.
                </p>
            );
        }

        return (
            <div>
                { result }
            </div>
        );
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
                <p>Or, <a href="#" onClick={ this._createProject }>create a new project</a>.</p>
                <Input
                    type="text"
                    label="Review session name"
                    name="name"
                    {...name}
                    error={this._errorMessage(name)}
                />
                {
                    this.props.fields.collaborators.value.length ?
                    <p className={ style.label }>Collaborators</p> :
                    ''
                }
                <List selectable ripple>
                    { this._renderList(this.props.fields.collaborators.value) }
                </List>
                <Input
                    label={ this.props.fields.collaborators.value.length ? '' : 'Collaborators' }
                    type="text"
                    name="collaborators"
                    error={this._errorMessage(collaborators)}
                    value={this.state.collaborator}
                    onChange={this._onChange}
                    autoComplete="off"
                />
                { this.renderResult(this.state.availableCollaborators) }
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
    createProject: React.PropTypes.func,
};

function mapDispatchToProps(dispatch) {
    return {
        handleSubmit(values) {
            dispatch(quickReviewSubmit(values));
        },
        createProject(callback) {
            dispatch(createProject(callback));
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
    initialValues: {
        collaborators: [],
    },
    validateForm,
    destroyOnUnmount: false,
})(QuickReviewView);

export default QuickReviewView;
