/*eslint-env node, mocha */
/*global expect */
/*eslint no-console: 0*/
'use strict';

// Uncomment the following lines to use the react test utilities
// import React from 'react/addons';
// const TestUtils = React.addons.TestUtils;
import createComponent from 'helper/shallowRenderHelper';

import Example from 'component/Example';

describe('ExampleComponent', () => {
  let ExampleComponent;

  beforeEach(() => {
    ExampleComponent = createComponent(Example);
  });

  it('should be an object.', () => {
    expect(typeof ExampleComponent).to.equal('object');
  });
});
