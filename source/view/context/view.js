// :copyright: Copyright (c) 2016 ftrack

import React from 'react';

import HomeHeader from 'container/home_header';
import ContextCard from 'component/context_card';
import RouteTabs from 'container/route_tabs';

import { session } from '../../ftrack_api';

import style from './style.scss';

/** Context view */
class ContextView extends React.Component {

    constructor() {
        super();
        this.state = { entity: null, loading: true, error: false };
        this._loadContext = this._loadContext.bind(this);
    }

    componentDidMount() {
        this._loadContext();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.params.active !== this.props.params.context) {
            this._loadContext();
        }
    }

    /** Return query string to get a TypedContext. */
    _getTypedContextQuery() {
        const select = [
            'thumbnail_id', 'link', 'status.sort', 'status.name',
            'status.color',
        ];

        const queryString = (
            `select ${select.join(', ')} from TypedContext where ` +
            `id is "${this.props.params.id}" limit 1`
        );

        return queryString;
    }

    /** Return a query string to get Project. */
    _getProjectQuery() {
        const select = [
            'thumbnail_id', 'link',
        ];

        const queryString = (
            `select ${select.join(', ')} from Project where ` +
            `id is "${this.props.params.id}" limit 1`
        );

        return queryString;
    }

    /** Load context entity. */
    _loadContext() {
        let queryString = null;

        if (this.props.params.type === 'Project') {
            queryString = this._getProjectQuery();
        } else {
            queryString = this._getTypedContextQuery();
        }

        const promise = session._query(queryString).then((result) => {
            const entity = result.data[0];

            if (!entity) {
                return Promise.reject(new Error('Failed to find entity.'));
            }
            this.setState({ entity, loading: false });
            return Promise.resolve(entity);
        });

        promise.catch((error) => {
            this.setState({ loading: false, error });
        });
    }

    render() {
        const contextId = this.props.params.id;
        const contextType = this.props.params.type;
        const entity = this.state.entity;
        const tabs = [
            { route: 'notes', label: 'Notes' },
            { route: 'versions', label: 'Versions' },
        ];
        return (
            <div className={style.view}>
                <HomeHeader back context={contextId} />
                <ContextCard entity={entity} flat className={style.info} />
                <div className={style.tabs}>
                    <RouteTabs
                        items={tabs}
                        baseRoute={`/context/${contextType}/${contextId}/`}
                    />
                </div>
                {this.props.children}
            </div>
        );
    }
}

ContextView.propTypes = {
    params: React.PropTypes.object.isRequired,
    children: React.PropTypes.node.isRequired,
};

ContextView.defaultProps = {};

export default ContextView;
