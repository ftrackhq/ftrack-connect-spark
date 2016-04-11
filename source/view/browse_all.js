// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { hashHistory } from 'react-router';

import ContextBrowser from 'container/context_browser';


/** Handle selecting a context. */
function _onSelectContext(id, type) {
    hashHistory.push(`/context/${id}/${type}`);
}

export default function BrowseAllView() {
    return <ContextBrowser onSelectContext={_onSelectContext} />;
}
