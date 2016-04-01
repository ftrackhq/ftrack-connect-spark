import React from 'react';
import classNames from 'classnames';

import style from './style.scss';


/** Return *entity* name. */
function _getName(entity) {
    return entity.full_name || entity.name;
}

/** Return joined names from *entities*. */
function _joinNames(entities) {
    return entities.map(_getName).join(' / ');
}


/**
 * EntityLink Component - display entity and parent names on multiple lines.
 */
function EntityLink(props) {
    const _classNames = classNames(
        style['entity-link'], props.className
    );

    const link = props.link;
    const entity = link[link.length - 1];
    const ancestors = link.slice(0, -1);
    const result = [];

    if (props.size === 'large') {
        result.push(
            <h5 key={entity.id} className={style.entity}>{_getName(entity)}</h5>
        );
    } else {
        result.push(
            <p key={entity.id} className={style.entity}>{_getName(entity)}</p>
        );
    }

    const parent = ancestors[ancestors.length - 1];
    if (props.parent && parent) {
        result.push(
            <p key={parent.id} className={style['entity-parent']}>
                {_getName(parent)}
            </p>
        );

        if (props.ancestors) {
            const parentAncestors = ancestors.slice(0, -1);
            result.push(
                <p key={`${parent.id}-ancestors`} className={style['entity-ancestors']}>
                    {_joinNames(parentAncestors)}
                </p>
            );
        }
    } else if (props.ancestors && ancestors.length) {
        result.push(
            <p key={`${entity.id}-ancestors`} className={style['entity-ancestors']}>
                {_joinNames(ancestors)}
            </p>
        );
    }

    return <div className={_classNames}>{result}</div>;
}

EntityLink.propTypes = {
    link: React.PropTypes.arrayOf(
        React.PropTypes.shape({
            id: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired,
        })
    ).isRequired,
    size: React.PropTypes.oneOf(['medium', 'large']),
    parent: React.PropTypes.bool,
    ancestors: React.PropTypes.bool,
    className: React.PropTypes.string,
};

EntityLink.defaultProps = {
    className: '',
    size: 'medium',
    parent: true,
    ancestors: true,
};


export default EntityLink;
