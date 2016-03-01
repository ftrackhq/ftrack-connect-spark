// :copyright: Copyright (c) 2016 ftrack
require('normalize.css');
require('style/App.css');

import React from 'react';
import Button from 'react-toolbox/lib/button';

import style from './example.scss';

class Example extends React.Component {
    render() {
      return (
      <div className={style.example}>
        <p>This is the example component</p>
        <Button label="Hello world" raised accent />
      </div>
    );
  }
}

Example.defaultProps = {
};

export default Example;
