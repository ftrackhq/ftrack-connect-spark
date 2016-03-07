// :copyright: Copyright (c) 2016 ftrack

import React from 'react';

import DebugMessageExample from 'container/debug_message_example';

import style from './style.scss';


/** An example view. */
function ExampleView() {
    return (
        <div className={style['example-view']}>
            <h2>This is the example view.</h2>
            <DebugMessageExample />
        </div>
    );
}

export default ExampleView;
