// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { reduxForm } from 'redux-form';
import moment from 'moment';

import Input from 'react-toolbox/lib/input';
import DatePicker from 'react-toolbox/lib/date_picker';
import { List, ListItem } from 'react-toolbox';
import EntityAvatar from 'component/entity_avatar';
import CollaboratorSelector from 'ftrack-spark-components/lib/selector/collaborator_selector';

import Form from 'component/form';
import Selector from 'component/selector';
import { session } from '../../ftrack_api';
import {
    isEmptyString,
} from '../../util/validation';
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
class _QuickReviewView extends React.Component {
    constructor() {
        super();
        this.state = {
            name: '',
            createProjectAuthorized: false,
        };
        this._onCancelClick = this._onCancelClick.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
        this._isSubmitDisabled = this._isSubmitDisabled.bind(this);
        this._createProject = this._createProject.bind(this);
        this._updateProject = this._updateProject.bind(this);
        this._onCollaboratorChange = this._onCollaboratorChange.bind(this);

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

    /** Handle collaborator changes. */
    _onCollaboratorChange(collaborators) {
        this.props.fields.collaborators.onChange(collaborators);
    }

    /** Trigger onQuickReviewSubmit with values on submission. */
    _onSubmit(e) {
        e.preventDefault();
        this.props.onQuickReviewSubmit(this.props.values);
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

    render() {
        const {
            fields: {
                name, project, collaborators, description, expiryDate,
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
                <CollaboratorSelector
                    value={collaborators.value}
                    session={session}
                    label="Add collaborators"
                    onChange={this._onCollaboratorChange}
                />
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

_QuickReviewView.contextTypes = {
    router: React.PropTypes.object.isRequired,
};

_QuickReviewView.propTypes = {
    params: React.PropTypes.object.isRequired,
    values: React.PropTypes.object.isRequired,
    fields: React.PropTypes.object.isRequired,
    onQuickReviewSubmit: React.PropTypes.func.isRequired,
    resetForm: React.PropTypes.func.isRequired,
    submitting: React.PropTypes.bool.isRequired,
    projects: React.PropTypes.object,
    createProject: React.PropTypes.func,
};

function mapDispatchToProps(dispatch) {
    return {
        onQuickReviewSubmit(values) {
            dispatch(quickReviewSubmit(values));
        },
        createProject(callback) {
            dispatch(createProject(callback));
        },
    };
}

const QuickReviewView = reduxForm({
    form: 'quickReview',
    fields: [
        'name', 'project', 'collaborators', 'description',
        'expiryDate',
    ],
    initialValues: {
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
                    (responses) => {
                        const result = {};
                        if (responses[0].result === false) {
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
}, null, mapDispatchToProps)(_QuickReviewView);

export default QuickReviewView;
