// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import Input from 'react-toolbox/lib/input';
import Autocomplete from 'react-toolbox/lib/autocomplete';
import Dropdown from 'react-toolbox/lib/dropdown';
import Switch from 'react-toolbox/lib/switch';

import classNames from 'classnames';

import style from './style.scss';


function renderInput(config, field = {}) {
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

function renderEnumerator(config, field = {}) {
    const source = config.data.reduce(
        (accumulator, item) => (Object.assign(
            {}, accumulator, { [item.value]: item.label }
        )), {}
    );

    return (
        <Autocomplete
            direction="down"
            multiple={false}
            source={source}
            label={config.label}
            name={config.name}
            {...field}
            value={field.value || ''}
        />
    );
}


function renderDropdown(config, field = {}) {
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

function renderBoolean(config, field = {}) {
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

const renderDebug = (config) => <pre>{JSON.stringify(config)}</pre>;

const mapTypeToRenderFunction = {
    text: renderInput,
    textarea: renderInput,
    number: renderInput,
    enumerator: renderEnumerator,
    dropdown: renderDropdown,
    boolean: renderBoolean,
};

function renderFields(items, fields) {
    const result = items.map((config, index) => {
        const field = fields[index];
        const renderer = mapTypeToRenderFunction[config.type] || renderDebug;
        if (!field) {
            return null;
        }
        return renderer(config, field, index);
    });
    return result;
}

/**
 * Dynamic Fields Component.
 *
 */
function DynamicFields({ className, items, fields }) {
    const _classNames = classNames(style.component, className);
    return (
        <div className={_classNames}>
            {renderFields(items, fields)}
        </div>
    );
}

DynamicFields.propTypes = {
    className: React.PropTypes.string,
    items: React.PropTypes.array,
    fields: React.PropTypes.array,
};

export default DynamicFields;
