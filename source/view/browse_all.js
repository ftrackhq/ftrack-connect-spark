// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { browserHistory } from 'react-router';

import ContextBrowser from 'container/context_browser';


/** Handle selecting a context. */
function _onSelectContext(id) {
    browserHistory.push(`/context/${id}`);
}

export default function BrowseAllView() {
    return <ContextBrowser onSelectContext={_onSelectContext} />;
}
