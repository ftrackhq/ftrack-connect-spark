// :copyright: Copyright (c) 2016 ftrack
import React from 'react';

import Example from 'component/Example';

import style from './ExampleView.scss';

function ExampleView() {
  return (
    <div className={style['example-view']}>
      <h2>This is the example view.</h2>
      <Example />
    </div>
  );
}

export default ExampleView;
