// :copyright: Copyright (c) 2016 ftrack

/**
 * Return the shallow output for a given component
 * As we are using phantom.js, we also need to include the fn.proto.bind shim!
 *
 * @see http://simonsmith.io/unit-testing-react-components-without-a-dom/
 * @author somonsmith
 */
import React from 'react';
import TestUtils from 'react-addons-test-utils';


/** Return the shallow rendered component. */
export default function createComponent(component, props = {}, ...children) {
    const shallowRenderer = TestUtils.createRenderer();
    shallowRenderer.render(
        React.createElement(
            component,
            props,
            children.length > 1 ? children : children[0]
        )
    );
    return shallowRenderer.getRenderOutput();
}
