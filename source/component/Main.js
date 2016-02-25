require('normalize.css');
require('style/App.css');

import React from 'react';
import Button from 'react-toolbox/lib/button';

class Main extends React.Component {
  render() {
    return (
      <div className="index">
        <p>Hello World</p>
        <Button label="Hello world" raised accent />
      </div>
    );
  }
}

Main.defaultProps = {
};

export default Main;
