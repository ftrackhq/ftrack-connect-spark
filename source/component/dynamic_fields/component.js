// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import Input from 'react-toolbox/lib/input';
import Autocomplete from 'react-toolbox/lib/autocomplete';
import Dropdown from 'react-toolbox/lib/dropdown';
import Switch from 'react-toolbox/lib/switch';
import PropTypes from 'prop-types';

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
    config: PropTypes.shape({
        label: PropTypes.string,
        name: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
    }),
    field: PropTypes.object,
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
    config: PropTypes.shape({
        data: PropTypes.array.isRequired,
        label: PropTypes.string,
        name: PropTypes.string.isRequired,
    }),
    field: PropTypes.object,
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
    config: PropTypes.shape({
        data: PropTypes.array.isRequired,
        label: PropTypes.string,
        name: PropTypes.string.isRequired,
    }),
    field: PropTypes.object,
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
    config: PropTypes.shape({
        description: PropTypes.string,
        label: PropTypes.string,
        name: PropTypes.string.isRequired,
    }),
    field: PropTypes.object,
};

/** Debug field, renders the configuration in a pre-formatted element */
const DebugField = ({ config }) => <pre>{JSON.stringify(config)}</pre>;
DebugField.propTypes = { config: PropTypes.any };


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
    className: PropTypes.string,
    items: PropTypes.array,
    fields: PropTypes.array,
};

export default DynamicFields;
