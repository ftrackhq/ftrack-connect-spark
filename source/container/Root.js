// :copyright: Copyright (c) 2016 ftrack
import React, { PropTypes } from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';


class Root extends React.Component {
    render() {
      return (
      <Provider store={this.props.store}>
        <Router history={this.props.history}>
          {this.props.routes}
        </Router>
      </Provider>
    );
  }
}

Root.propTypes = {
    history: PropTypes.object.isRequired,
    routes: PropTypes.element.isRequired,
    store: PropTypes.object.isRequired,
};

export default Root;
