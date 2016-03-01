// :copyright: Copyright (c) 2016 ftrack

// Uncomment the following lines to use the react test utilities
// import React from 'react/addons';
// const TestUtils = React.addons.TestUtils;
import createComponent from 'helper/shallow_render_helper';

import Example from 'component/Example';

describe('ExampleComponent', function () {
  let ExampleComponent;

  beforeEach(function () {
    ExampleComponent = createComponent(Example);
  });

  it('should be an object.', function () {
    expect(typeof ExampleComponent).to.equal('object');
  });
});
