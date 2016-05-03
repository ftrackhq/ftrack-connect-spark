// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { reduxForm } from 'redux-form';
import { hashHistory } from 'react-router';

import Input from 'react-toolbox/lib/input';

import Form from 'component/form';
import Selector from 'component/selector';
import { session } from '../../ftrack_api';
import { isEmptyString } from '../../util/validation';

import Reveal from 'component/reveal';
import { publishResolveContext, publishSubmit } from 'action/publish';

import style from './style.scss';

/** Validate form values and return error object. */
const validateForm = (values) => {
    const errors = {};
    const requiredFields = ['name', 'parent', 'type'];
    for (const field of requiredFields) {
        if (isEmptyString(values[field])) {
            errors[field] = 'Required';
        }
    }
    return errors;
};


/** Quick review view */
class PublishView extends React.Component {
    constructor() {
        super();
        this.state = { link: '', context: null };
        this._onCancelClick = this._onCancelClick.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
        this._isSubmitDisabled = this._isSubmitDisabled.bind(this);
        this._updateContext = this._updateContext.bind(this);
        this._link = '';

        this._assetTypes = session._query(
            'select id, name from AssetType'
        ).then((data) => data.data.reduce(
            (accumulator, item) => (
                Object.assign({}, accumulator, { [item.id]: item.name })
            ), {}
        ));
    }

    /** Update context when component is mounted. */
    componentWillMount() {
        this._updateContext(this.props.params.context);
    }

    /** Update context if route has changed. */
    componentWillReciveProps(nextProps) {
        this._updateContext(nextProps.params.context);
    }

    /** Update current context to *contextId*.  */
    _updateContext(contextId) {
        if (contextId && contextId !== this.state.context) {
            this.state.context = contextId;
            this.props.onContextChange(contextId);
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
        const path = '/publish-context';
        hashHistory.push(path);
    }

    render() {
        const {
            fields: {
                name, type, description,
            },
        } = this.props;

        return (
            <Form
                header="Publish your work"
                headerColor="green"
                submitLabel="Publish"
                onSubmit={this._onSubmit}
                onCancel={this._onCancelClick}
                submitDisabled={this._isSubmitDisabled()}
            >
                <Input
                    type="text"
                    label="Linked to"
                    onFocus={this._onBrowse}
                    value={this.props.link.join(' / ')}
                />
                <div className={style.asset}>
                    <Input
                        className={style['asset-name']}
                        type="text"
                        label="Name"
                        name="name"
                        {...name}
                        error={this._errorMessage(name)}
                    />
                    <Selector
                        className={style['asset-type']}
                        label="Type"
                        query={this._assetTypes}
                        {...type}
                    />
                </div>
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
    link: React.PropTypes.array,
    onContextChange: React.PropTypes.func,
};

PublishView.defaultProps = {
    params: {
        context: null,
    },
};

const formOptions = {
    form: 'publish',
    fields: [
        'name', 'parent', 'task', 'type', 'description',
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
            parent: publish.parent || null,
            task: publish.task || null,
        },
        link: publish.link || [],
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onContextChange(contextId) {
            dispatch(publishResolveContext(contextId));
        },
        submitForm(values) {
            dispatch(publishSubmit(values));
        },
    };
}

PublishView = reduxForm(
    formOptions, mapStateToProps, mapDispatchToProps
)(PublishView);

export default PublishView;
