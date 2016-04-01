// :copyright: Copyright (c) 2016 ftrack
import React from 'react';
import classNames from 'classnames';

import style from './style.scss';

/**
 * Obtain entity type from *entity*.
 *
 * Prefer task type, fall back to object type, and finally to API entity type.
 *
 */
function getEntityTypeDescription(entity) {
    let entityType = '';
    if (entity.type && entity.type.name) {
        entityType = entity.type.name;
    } else if (entity.object_type && entity.object_type.name) {
        entityType = entity.object_type.name;
    } else if (entity.__entity_type__) {
        entityType = entity.__entity_type__;
    }
    return entityType;
}

/** Display *entity* type. */
function EntityType(props) {
    const _classNames = classNames(
        style['entity-type'], props.className
    );
    return (
        <p className={_classNames}>{getEntityTypeDescription(props.entity)}</p>
    );
}

EntityType.propTypes = {
    className: React.PropTypes.string,
    entity: React.PropTypes.object.isRequired,
};

EntityType.defaultProps = {
    className: '',
};

export default EntityType;
