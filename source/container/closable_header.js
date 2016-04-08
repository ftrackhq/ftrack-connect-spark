import React from 'react';

import { IconButton } from 'react-toolbox';
import { hashHistory } from 'react-router';
import Header from 'component/header';

/** Go back. */
const navigateBack = () => {
    hashHistory.goBack();
};

const rightButton = <IconButton icon="close" onClick={navigateBack} />;

function ClosableHeader(props) {
    return <Header rightButton={rightButton} {...props} />;
}

export default ClosableHeader;
