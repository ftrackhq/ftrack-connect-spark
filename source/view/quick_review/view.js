// :copyright: Copyright (c) 2016 ftrack

import React from 'react';

import style from './style.scss';

import Autocomplete from 'react-toolbox/lib/autocomplete';
import Input from 'react-toolbox/lib/input';
import DatePicker from 'react-toolbox/lib/date_picker';


class ProjectSelector extends React.Component {
    constructor() {
        super();
        this.state = { values: [] };
        this._onChange = this._onChange.bind(this);
    }

    _onChange(value) {
        this.setState({ values: [value] });
        this.props.onChange(value);
    }

    render() {
        return (
            <Autocomplete
                direction="down"
                label="Choose project"
                onChange={this._onChange}
                source={{
                    1: 'Project 1',
                    2: 'Project 2',
                    3: 'Project 3',
                    4: 'Project 4',
                }}
                name={this.state.values[0]}
                value={this.state.values}
            />
        );
    }
}
ProjectSelector.propTypes = {
    onChange: React.PropTypes.func,
};

/** Quick review view */
class QuickReviewView extends React.Component {
    _onProjectSelectorChange(value) {
        console.info('_onProjectSelectorChange', value);
    }

    _onNameChange(value) {
        console.info('_onNameChange', value);
    }

    _onCollaboratorsChange(value) {
        console.info('_onCollaboratorsChange', value);
    }

    _onDescriptionChange(value) {
        console.info('_onDescriptionChange', value);
    }

    render() {
        return (
            <div className={style['quick-review']}>
                <h2>Share a quick review</h2>
                <div>[Preview]</div>
                <ProjectSelector onChange={this._onProjectSelectorChange} />
                <Input
                    type="text"
                    label="Review session name"
                    name="name"
                    onChange={this._onNameChange}
                />
                <Input
                    type="text"
                    label="Invite collaborators"
                    name="collaborators"
                    onChange={this._onCollaboratorsChange}
                />
                <Input
                    type="text"
                    label="Description"
                    name="description"
                    onChange={this._onDescriptionChange}
                />
                <DatePicker
                    label="Expiry date"
                />
            </div>
        );
    }
}

export default QuickReviewView;
