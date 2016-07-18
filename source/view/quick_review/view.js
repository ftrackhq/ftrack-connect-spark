// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { debounce } from 'lodash/function';
import { without } from 'lodash/array';
import moment from 'moment';

import Input from 'react-toolbox/lib/input';
import DatePicker from 'react-toolbox/lib/date_picker';
import { List, ListItem } from 'react-toolbox';
import Button from 'react-toolbox/lib/button';
import Chip from 'react-toolbox/lib/chip';
import EntityAvatar from 'component/entity_avatar';

import Form from 'component/form';
import Selector from 'component/selector';
import { session } from '../../ftrack_api';
import { operation } from 'ftrack-javascript-api';
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

    if (!values.collaborators || !values.collaborators.length) {
        errors.collaborators = 'Required';
    }

    return errors;
};

function ResultList({ items, onClick, className }) {
    if (items.length) {
        const result = items.map((item) => {
            const handleClick = onClick.bind(null, item);

            return (
                <ListItem
                    avatar={<EntityAvatar entity={item} />}
                    caption={item.name}
                    legend={item.email}
                    onClick={handleClick}
                />
            );
        });

        return (
            <List
                className={className}
                selectable
                ripple
            >
                {result}
            </List>
        );
    }

    return (
        <div></div>
    );
}

ResultList.propTypes = {
    className: React.PropTypes.string,
    items: React.PropTypes.array,
    onClick: React.PropTypes.func,
};

/** Quick review view */
class QuickReviewView extends React.Component {
    constructor() {
        super();
        this.state = {
            availableCollaborators: [],
            name: '',
            createProjectAuthorized: false,
        };
        this._onCancelClick = this._onCancelClick.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
        this._isSubmitDisabled = this._isSubmitDisabled.bind(this);
        this._createProject = this._createProject.bind(this);
        this._updateProject = this._updateProject.bind(this);
        this._loadCollaborators = debounce(
            this._loadCollaborators.bind(this), 500
        );
        this._onCollaboratorsChange = this._onCollaboratorsChange.bind(this);
        this.addCollaborator = this.addCollaborator.bind(this);
        this._onNameChange = this._onNameChange.bind(this);
        this._addNewCollaborator = this._addNewCollaborator.bind(this);
        this._renderCollaborators = this._renderCollaborators.bind(this);
        this._onCollaboratorsKeyDown = this._onCollaboratorsKeyDown.bind(this);

        const _projects = session.query(
            'select id, full_name from Project where status is "active"'
        );

        this._projects = _projects.then((data) => {
            const result = {};
            for (const project of data.data) {
                result[project.id] = project.full_name;
            }
            return result;
        });

        session.call([{
            action: '_authorize_operation',
            data: {
                action: 'create',
                data: {
                    entity_type: 'Project',
                },
            },
        }]).then((data) => {
            this.setState({
                createProjectAuthorized: data.result === true,
            });
        }).catch(() => this.setState({ createProjectAuthorized: true }));
    }

    /** Update project when component is mounted. */
    componentWillMount() {
        this._updateProjectId(this.props.params.projectId);
    }

    /** Update project if route has changed. */
    componentWillReciveProps(nextProps) {
        this._updateProjectId(nextProps.params.projectId);
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

    /** Update the selected project with the new one.
    *
    * Simulate blur of field to force validation.
    *
    */
    _updateProject(project) {
        this.props.fields.project.onChange(project.id);

        // Trigger field blur to force remote validation of project id.
        this.props.fields.project.onBlur(project.id);
    }

    /** Create a new project. */
    _createProject(e) {
        e.preventDefault();
        this.props.createProject(this._updateProject);
    }

    /** Update current project to *projectId*.  */
    _updateProjectId(projectId) {
        const currentProjectId = this.props.values.project;
        if (projectId && projectId !== currentProjectId) {
            this._updateProject({ id: projectId });
        }
    }

    /** Handle changes to the collaborators field. */
    _onCollaboratorsChange(value) {
        this._loadCollaborators(value);

        this.props.fields.collaborator.onChange(value);

        let name = '';
        if (value.includes('@')) {
            name = guessName(value);
        }

        this.setState({
            name,
        });
    }

    /** Return a LIKE query string from *keys* and *values*. */
    _getFilterString(keys, values) {
        const results = [];

        for (const value of values) {
            const keyResults = [];
            for (const key of keys) {
                if (value) {
                    keyResults.push(`${key} like "%${value}%"`);
                }
            }
            if (keyResults.length) {
                results.push(
                    `(${keyResults.join(' or ')})`
                );
            }
        }

        return results.join(' and ');
    }

    /** Load collaborators from server based on *value*. */
    _loadCollaborators(value) {
        // Clear state and return early if nothing to query.
        if (!value || !value.length) {
            this.setState({
                availableCollaborators: [],
            });
            return;
        }

        const parts = value.split(' ');

        const inviteeQuery = (
            'select name, email from ReviewSessionInvitee where ' +
            `${this._getFilterString(['name', 'email'], parts)}`
        );
        const userQuery = (
            'select first_name, last_name, email, thumbnail_id from User where ' +
            `${this._getFilterString(['first_name', 'last_name', 'email'], parts)} ` +
            'and is_active is true'
        );

        const promise = session.call([
            operation.query(inviteeQuery),
            operation.query(userQuery),
        ]);

        promise.then((responses) => {
            const results = {};
            let collaborators = [];
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
                if (!this.collaboratorExists(email)) {
                    collaborators.push(results[email]);
                }
            });
            collaborators = collaborators.slice(0, 5);

            collaborators.sort((a, b) => {
                if (a.name < b.name) {
                    return -1;
                } else if (a.name > b.name) {
                    return 1;
                }
                return 0;
            });

            this.setState({
                availableCollaborators: collaborators.slice(0, 5),
            });
        });
    }

    /** Check if a collaborator already exists. */
    collaboratorExists(email) {
        const exists = this.props.fields.collaborators.value.find(
            collaborator => collaborator.email === email
        );

        return exists;
    }

    /** Add collaborator from *item*. */
    addCollaborator(item) {
        // User already exists.
        const exists = this.collaboratorExists(item.email);

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

        this.props.fields.collaborator.onChange(
            ''
        );

        this.setState({
            name: '',
        });
    }

    /** Remove collaborator *item*. */
    removeCollaborator(item) {
        this.props.fields.collaborators.onChange(
            without(this.props.fields.collaborators.value, item)
        );
    }

    /** Add a new collaborator from the form. */
    _addNewCollaborator() {
        const email = this.props.fields.collaborator.value;
        const name = this.state.name;

        this.addCollaborator({
            name,
            email,
            thumbnail_id: null,
        });
    }

    /** Update the name in state. */
    _onNameChange(name) {
        this.setState({
            name,
        });
    }

    /** Render collaborators. */
    _renderCollaborators() {
        const collaborators = this.props.fields.collaborators.value;

        if (collaborators && collaborators.length) {
            const items = collaborators.map((item) => {
                const removeCollaborator = this.removeCollaborator.bind(this, item);

                return (
                    <Chip
                        key={item.email}
                        deletable
                        onDeleteClick={removeCollaborator}
                        className={style['selected-collaborator-item']}
                    >
                        <EntityAvatar entity={item} />
                        {item.name}
                    </Chip>
                );
            });
            return <div className={style['selected-collaborators']}>{items}</div>;
        }
        return false;
    }

    /** Handle key press in collaborators. */
    _onCollaboratorsKeyDown(event) {
        if (event.key === 'Enter') {
            if (this.state.availableCollaborators.length) {
                this.addCollaborator(this.state.availableCollaborators[0]);
            } else if (this.state.name !== '') {
                this._addNewCollaborator();
            }
        }
    }

    /** Render *collaborators*. */
    renderResult(collaborators) {
        const result = [];

        if (collaborators.length) {
            result.push(
                <ResultList
                    className={style['collaborator-matches']}
                    items={this.state.availableCollaborators}
                    onClick={this.addCollaborator}
                />
            );
        } else if (this.state.name !== '') {
            result.push(
                <div className={style['collaborator-add-new']}>
                    <p className="text-faded">
                        Invite {this.state.name}? {this.state.name} will
                        automatically recieve an invitation email.
                    </p>
                    <div>
                        <Input
                            value={this.state.name}
                            onChange={this._onNameChange}
                        />
                        <Button
                            className={style.addButton}
                            label="Add"
                            primary
                            onClick={this._addNewCollaborator}
                            type="button"
                        />
                    </div>
                </div>
            );
        } else {
            if (this.props.fields.collaborator.active) {
                result.push(
                    <p className={style['collaborator-info']}>
                        Search for a person by name or email address, or enter an
                        email address to invite someone new.
                    </p>
                );
            }
        }

        if (result && result.length) {
            return (
                <div className={style['collaborator-footer']}>
                    {result}
                </div>
            );
        }
        return null;
    }

    render() {
        const {
            fields: {
                name, project, collaborator, collaborators, description, expiryDate,
            },
        } = this.props;

        const { createProjectAuthorized } = this.state;

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
                    error={this._errorMessage(project)}
                />
                {
                    createProjectAuthorized ?
                    (
                        <p className={style['create-project-link']}>
                            <a href="#" onClick={this._createProject}>Create a new project</a>
                        </p>
                    ) : null
                }
                <Input
                    type="text"
                    label="Review session name"
                    name="name"
                    {...name}
                    error={this._errorMessage(name)}
                />
                {
                    (collaborators.value && collaborators.value.length) ? (
                        <p className={style.label}>Collaborators</p>
                    ) : null
                }
                {this._renderCollaborators()}
                <Input
                    label="Add collaborators"
                    type="text"
                    name="collaborator"
                    {...collaborator}
                    error={this._errorMessage(collaborator)}
                    onChange={this._onCollaboratorsChange}
                    onKeyDown={this._onCollaboratorsKeyDown}
                />
                {this.renderResult(this.state.availableCollaborators)}
                <Reveal label="Add description" className="flex-justify-start">
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
                <Reveal label="Add expiry" className="flex-justify-start">
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
    params: React.PropTypes.object.isRequired,
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
        'name', 'project', 'collaborator', 'collaborators', 'description',
        'expiryDate',
    ],
    initialValues: {
        collaborator: '',
        collaborators: [],
        expiryDate: moment().add(1, 'year').toDate(),
    },
    validateForm,
    destroyOnUnmount: false,
    asyncBlurFields: ['project'],
    alwaysAsyncValidate: true,
    asyncValidate: (values) => {
        const { project } = values;

        return new Promise(
            (resolve) => {
                session.call([{
                    action: '_authorize_operation',
                    data: {
                        action: 'create',
                        data: {
                            entity_type: 'ReviewSession',
                        },
                        context: {
                            entity_key: project,
                            entity_type: 'Project',
                        },
                    },
                }]).then(
                    (data) => {
                        const result = {};
                        if (data.result === false) {
                            result.project = (
                                'You\'re not allowed to create review sessions ' +
                                'on this project.'
                            );
                        }
                        resolve(result);
                    }
                ).catch(() => resolve({}));
            }
        );
    },
})(QuickReviewView);

export default QuickReviewView;
