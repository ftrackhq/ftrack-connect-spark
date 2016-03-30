// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { IndexLink } from 'react-router';

import ClosableHeader from 'container/closable_header';
import DebugMessageExample from 'container/debug_message_example';
import style from './style.scss';


/** An example view. */
function ExampleView() {
    return (
        <div className={style['example-view']}>
            <ClosableHeader title="Example view" />
            <h2>This is the example view.</h2>
            <DebugMessageExample />
            <p><IndexLink to="/">Back to home</IndexLink></p>
        </div>
    );
}

export default ExampleView;
