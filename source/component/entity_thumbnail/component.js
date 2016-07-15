import React from 'react';
import classNames from 'classnames';

import style from './style.scss';

import { session } from '../../ftrack_api';

/**
 * EntityThumbnail component - displays *thumbnailId* as a thumbnail.
 */
function EntityThumbnail(props) {
    const { thumbnailId } = props;
    const url = session.thumbnailUrl(thumbnailId);
    const _classNames = classNames(
        style['entity-thumbnail'], props.className
    );

    return (
        <div
            className={_classNames}
            style={{ backgroundImage: `url('${url}')` }}
        />
    );
}

EntityThumbnail.propTypes = {
    className: React.PropTypes.string,
    thumbnailId: React.PropTypes.string,
    size: React.PropTypes.number,
};

EntityThumbnail.defaultProps = {
    className: '',
    thumbnailId: null,
};

export default EntityThumbnail;
