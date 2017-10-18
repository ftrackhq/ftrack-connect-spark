// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import Input from 'react-toolbox/lib/input';
import Autocomplete from 'react-toolbox/lib/autocomplete';
import Dropdown from 'react-toolbox/lib/dropdown';
import Switch from 'react-toolbox/lib/switch';

import classNames from 'classnames';

import style from './style.scss';

/** Input field component for types: text, number, textarea */
function InputField({ config, field = {} }) {
    return (
        <Input
            type={config.type}
            label={config.label}
            name={config.name}
            multiline={(config.type === 'textarea')}
            {...field}
        />
    );
}
InputField.propTypes = {
    config: React.PropTypes.shape({
        label: React.PropTypes.string,
        name: React.PropTypes.string.isRequired,
        type: React.PropTypes.string.isRequired,
    }),
    field: React.PropTypes.object,
};

/** Enumerator field component with options in config.data */
function EnumeratorField({ config, field = {} }) {
    const source = config.data.reduce(
        (accumulator, item) => (Object.assign(
            {}, accumulator, { [item.value]: item.label }
        )), {}
    );

    return (
        <Autocomplete
            direction="down"
            multiple={false}
            showSuggestionsWhenValueIsSet
            source={source}
            label={config.label}
            name={config.name}
            {...field}
            value={field.value || ''}
        />
    );
}
EnumeratorField.propTypes = {
    config: React.PropTypes.shape({
        data: React.PropTypes.array.isRequired,
        label: React.PropTypes.string,
        name: React.PropTypes.string.isRequired,
    }),
    field: React.PropTypes.object,
};

/** Dropdown field component with options in config.data */
function DropdownField({ config, field = {} }) {
    return (
        <Dropdown
            auto={false}
            source={config.data}
            label={config.label}
            name={config.name}
            {...field}
            value={field.value || null}
        />
    );
}
DropdownField.propTypes = {
    config: React.PropTypes.shape({
        data: React.PropTypes.array.isRequired,
        label: React.PropTypes.string,
        name: React.PropTypes.string.isRequired,
    }),
    field: React.PropTypes.object,
};

/**
 * Boolean field component
 *
 * Rendered as a `Swicth` component with an optional description
 */
function BooleanField({ config, field = {} }) {
    return (
        <div className={style.switch}>
            <Switch
                className={style['switch-control']}
                checked={field.value || false}
                name={config.name}
                {...field}
            />
            <h6 className={style['switch-label']}>{config.label}</h6>
            <p className={style['switch-description']}>{config.description}</p>
        </div>

    );
}
BooleanField.propTypes = {
    config: React.PropTypes.shape({
        description: React.PropTypes.string,
        label: React.PropTypes.string,
        name: React.PropTypes.string.isRequired,
    }),
    field: React.PropTypes.object,
};

/** Debug field, renders the configuration in a pre-formatted element */
const DebugField = ({ config }) => <pre>{JSON.stringify(config)}</pre>;
DebugField.propTypes = { config: React.PropTypes.any };


/** Map field types to components */
const fieldTypeComponent = {
    text: InputField,
    textarea: InputField,
    number: InputField,
    enumerator: EnumeratorField,
    dropdown: DropdownField,
    boolean: BooleanField,
};

/**
 * Dynamic Fields Component.
 *
 *  Returns form elements based on item configuration.
 */
function DynamicFields({ className, items, fields = [] }) {
    const _classNames = classNames(style.component, className);
    return (
        <div className={_classNames}>
        {
            items.map((config, index) => {
                const field = fields[index];
                const component = fieldTypeComponent[config.type] || DebugField;
                if (!field) {
                    return null;
                }

                return React.createElement(component, { config, field });
            })
        }
        </div>
    );
}

DynamicFields.propTypes = {
    className: React.PropTypes.string,
    items: React.PropTypes.array,
    fields: React.PropTypes.array,
};

export default DynamicFields;
