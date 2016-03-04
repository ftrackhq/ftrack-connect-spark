// :copyright: Copyright (c) 2016 ftrack

// Uncomment the following lines to use the react test utilities
// import React from 'react/addons';
// const TestUtils = React.addons.TestUtils;
import { assert } from 'chai';

import createComponent from 'helper/shallow_render_helper';

import Example from 'component/example';

suite('ExampleComponent', function () {
    let ExampleComponent;

    setup(function () {
        ExampleComponent = createComponent(Example);
    });

    test('should be an object.', function () {
        assert.equal(typeof ExampleComponent, 'object');
    });
});
