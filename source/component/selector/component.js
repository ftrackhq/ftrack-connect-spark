// :copyright: Copyright (c) 2016 ftrack
import React from 'react';

import Autocomplete from 'react-toolbox/lib/autocomplete';

/**
 * Selector
 */
class Selector extends React.Component {
    constructor(props) {
        super(props);
        this.state = { value: props.value, source: {}, loading: true };
        this._onChange = this._onChange.bind(this);
        this._loadData = this._loadData.bind(this);
    }

    /** Load the data when the component has mounted. */
    componentDidMount() {
        this._loadData(this.props.query);
    }

    /** Update internal state when props change. */
    componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.props.value) {
            this.setState({ value: nextProps.value });
        }

        if (nextProps.query !== this.props.query) {
            this._loadData(nextProps.query);
        }
    }

    /** Update autocomplete source from *query*. */
    _loadData(query) {
        this.setState({ loading: true });
        query.then((data) => {
            this.setState({ source: data, loading: false });
            this._onChange(this.state.value);
        });
    }

    /** Update internal state and call prop.onChange on change. */
    _onChange(value) {
        this.setState({ value });
        // Trigger blur to set redux form's touched state.
        this.props.onBlur(value);

        this.props.onChange(value);
    }

    _errorMessage(field) {
        return field.touched && field.error || null;
    }

    render() {
        return (
            <Autocomplete
                direction="down"
                multiple={false}
                showSuggestionsWhenValueIsSet
                source={this.state.source}
                label={this.props.label}
                value={!this.state.loading && this.state.value || ''}
                onChange={this._onChange}
                error={this._errorMessage(this.props)}
            />
        );
    }
}

Selector.propTypes = {
    label: React.PropTypes.string,
    value: React.PropTypes.string,
    onChange: React.PropTypes.func,
    onBlur: React.PropTypes.func,
    query: React.PropTypes.object.isRequired,
};

Selector.defaultProps = {
    value: null,
    onChange: () => {},
    onBlur: () => {},
};

export default Selector;
