// :copyright: Copyright (c) 2016 ftrack
import React from 'react';
import { connect } from 'react-redux';

import Autocomplete from 'react-toolbox/lib/autocomplete';

/**
 * Project selector
 */
class ProjectSelector extends React.Component {
    constructor() {
        super();
        this.state = { value: null };
        this._onChange = this._onChange.bind(this);
    }

    _onChange(value) {
        this.setState({ value });
        this.props.onChange(value);
    }

    render() {
        return (
            <Autocomplete
                direction="down"
                label="Choose project"
                multiple={false}
                onChange={this._onChange}
                source={this.props.projects}
                value={this.props.projects[this.state.value] || ''}
            />
        );
    }
}

ProjectSelector.propTypes = {
    onChange: React.PropTypes.func,
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
