// :copyright: Copyright (c) 2016 ftrack
import React from 'react';
import { connect } from 'react-redux';

import Autocomplete from 'react-toolbox/lib/autocomplete';

/**
 * Project selector
 *
 * TODO: Improve UX of Autocomplete with multiple=false.
 * Show all alternatives when opening dropdown with an active selection.
 */
class ProjectSelector extends React.Component {
    constructor() {
        super();
        this.state = { value: null };
        this._onChange = this._onChange.bind(this);
    }

    /** Update internal state and call prop.onChange on change. */
    _onChange(value) {
        this.setState({ value });
        // Trigger blur to set redux form's touched state.
        this.props.onBlur(this.state.value);

        this.props.onChange(value);
    }

    _errorMessage(field) {
        return field.touched && field.error || null;
    }

    render() {
        return (
            <Autocomplete
                direction="down"
                label="Choose project"
                multiple={false}
                source={this.props.projects}
                {...this.props}
                value={this.props.projects[this.state.value] || ''}
                onChange={this._onChange}
                error={this._errorMessage(this.props)}
            />
        );
    }
}

ProjectSelector.propTypes = {
    onChange: React.PropTypes.func,
    onBlur: React.PropTypes.func,
    projects: React.PropTypes.object,
};

ProjectSelector.defaultProps = {
    projects: {},
};

/** Return object with project project id: project name from store. */
function selectProjects({ quickReview }) {
    const projectData = quickReview && quickReview.projects || [];
    const projects = projectData.reduce(
        (accumulator, project) => Object.assign(
            accumulator, { [project.id]: project.full_name }
        ), {}
    );
    return projects;
}

function mapStateToProps(state) {
    return { projects: selectProjects(state) || {} };
}

ProjectSelector = connect(mapStateToProps)(ProjectSelector);

export default ProjectSelector;
