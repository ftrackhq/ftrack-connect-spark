// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { reduxForm } from 'redux-form';
import { hashHistory } from 'react-router';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';

import Input from 'react-toolbox/lib/input';

import Form from 'component/form';
import Selector from 'component/selector';
import DynamicFields from 'component/dynamic_fields';

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
class _PublishView extends React.Component {
    constructor() {
        super();
        this.state = { link: '', context: null };
        this._onCancelClick = this._onCancelClick.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
        this._isSubmitDisabled = this._isSubmitDisabled.bind(this);
        this._updateContext = this._updateContext.bind(this);
        this._link = '';

        this._assetTypes = session.query(
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
        this._updateOptions(this.props.options || []);

        for (const prop of ['parent', 'task']) {
            if (this.props[prop]) {
                this.props.fields[prop].onChange(this.props[prop]);
            }
        }
    }

    /** Update context if route has changed. */
    componentWillReceiveProps(nextProps) {
        this._updateContext(nextProps.params.context);
        if (
            !isEqual(nextProps.options, this.props.options) ||
            !isEqual(nextProps.fields.options, this.props.fields.options)
        ) {
            this._updateOptions(nextProps.options);
        }

        for (const prop of ['parent', 'task']) {
            if (nextProps[prop] !== this.props[prop]) {
                this.props.fields[prop].onChange(nextProps[prop]);
            }
        }
    }

    /** Update current context to *contextId*.  */
    _updateContext(contextId) {
        if (contextId && contextId !== this._contextId) {
            this._contextId = contextId;
            this.props.onContextChange(contextId);
        }
    }

    _updateOptions(options) {
        options.forEach((config, index) => {
            this.props.fields.options.removeField(index);
            this.props.fields.options.addField(config.value, index);
        });
    }

    /** Navigate back on cancel clicked */
    _onCancelClick(e) {
        e.preventDefault();
        this.context.router.goBack();
    }

    /**
     * Trigger onSubmit with values on submission.
     *
     * Normalize Custom UI options from array to name, value pairs.
     */
    _onSubmit(e) {
        e.preventDefault();
        const optionValues = this.props.values.options;
        const values = omit(this.props.values, 'options');

        const normalizedValues = this.props.options.reduce(
            (accumulator, config, index) => {
                const value = optionValues[index];
                return Object.assign(
                    accumulator, { [config.name]: value }
                );
            }, values
        );

        this.props.submitForm(normalizedValues);
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
                name, type, description, options,
            },
            assets,
        } = this.props;

        const isExistingAsset = assets.some(candidate => (
            candidate.name === name.value &&
            candidate.type_id === type.value
        ));
        let existingAssetLinks = null;
        if (!isExistingAsset && assets.length) {
            const firstFiveAssets = assets.slice(0, 5);
            const moreThanFiveAssets = assets.length > 5;
            const sentenceEnd = moreThanFiveAssets ? (
                <span>...</span>
            ) : (
                <span>.</span>
            );
            const fiveLinks = firstFiveAssets.map((asset, index) => (
                <span>
                    {index !== 0 ? <span>, </span> : null}
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            name.onChange(asset.name);
                            type.onChange(asset.type_id);
                        }}
                    >
                        {asset.name}
                    </a>
                    {index === firstFiveAssets.length - 1 ? sentenceEnd : null}
                </span>
            ));
            existingAssetLinks = (
                <span>
                    You can also version up one of the existing assets: {fiveLinks}
                </span>
            );
        }

        return (
            <Form
                header="Publish your work"
                headerColor="purple"
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
                    {isExistingAsset ? (
                        <p className={style.assetHelpText}>
                            Versioning up existing asset <strong>{name.value}</strong>.
                        </p>
                    ) : (
                        <p className={style.assetHelpText}>
                            <strong>{name.value || 'Untitled asset'}</strong> will
                            be published as a new asset. {existingAssetLinks}
                        </p>
                    )}
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

                <DynamicFields
                    items={this.props.options}
                    fields={options}
                />
            </Form>
        );
    }
}

_PublishView.contextTypes = {
    router: React.PropTypes.object.isRequired,
};

_PublishView.propTypes = {
    values: React.PropTypes.object.isRequired,
    fields: React.PropTypes.object.isRequired,
    submitForm: React.PropTypes.func.isRequired,
    resetForm: React.PropTypes.func.isRequired,
    submitting: React.PropTypes.bool.isRequired,
    contexts: React.PropTypes.object,
    params: React.PropTypes.object,
    parent: React.PropTypes.string,
    task: React.PropTypes.string,
    link: React.PropTypes.array,
    onContextChange: React.PropTypes.func,
    options: React.PropTypes.array,
    assets: React.PropTypes.array,
};

_PublishView.defaultProps = {
    options: [],
    params: {
        context: null,
    },
};

const formOptions = {
    form: 'publish',
    fields: [
        'name', 'parent', 'task', 'type', 'description', 'options[]',
    ],
    validateForm,
};

function mapStateToProps(state) {
    const publish = state.screen.publish || {};

    return {
        initialValues: {
            name: publish.name || '',
            type: publish.type || null,
            parent: publish.parent || null,
            task: publish.task || null,
        },
        assets: publish.assets || [],
        options: publish.items || [],
        parent: publish.parent || null,
        task: publish.task || null,
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

const PublishView = reduxForm(
    formOptions, mapStateToProps, mapDispatchToProps
)(_PublishView);

export default PublishView;
