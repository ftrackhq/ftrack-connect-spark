// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import ProgressBar from 'react-toolbox/lib/progress_bar';

import HomeHeader from 'container/home_header';
import ContextCard from 'component/context_card';
import RouteTabs from 'container/route_tabs';

import { session } from '../../ftrack_api';
import { queryOperation } from '../../ftrack_api/operation';

import style from './style';


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

    _getTypedContextQuery() {
        const select = [
            'thumbnail_id', 'link', 'status.sort', 'status.name',
            'status.color',
        ];

        const queryString = (
            `select ${select.join(', ')} from TypedContext where ` +
            `id is "${this.props.params.context}" limit 1`
        );

        return queryString;
    }

    _getProjectQuery() {
        const select = [
            'thumbnail_id', 'link',
        ];

        const queryString = (
            `select ${select.join(', ')} from Project where ` +
            `id is "${this.props.params.context}" limit 1`
        );

        return queryString;
    }

    /** Load context entity. */
    _loadContext() {
        const typedContextQuery = this._getTypedContextQuery();
        const projectQuery = this._getProjectQuery();

        const queries = [
            queryOperation(typedContextQuery),
            queryOperation(projectQuery),
        ];

        const promise = session._call(queries).then((results) => {
            let entity = null;

            for (const result of results) {
                if (result.data.length) {
                    entity = result.data[0];
                }
            }

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
        const contextId = this.props.params.context;
        const entity = this.state.entity;
        const tabs = [
            { route: 'notes', label: 'Notes' },
            { route: 'versions', label: 'Versions' },
        ];
        let entityElement = null;
        if (this.state.entity) {
            entityElement = <ContextCard entity={entity} flat />;
        } else if (this.state.loading) {
            entityElement = (
                <div className={style.loader}>
                    <ProgressBar mode="indeterminate" />
                </div>
            );
        }

        return (
            <div>
                <HomeHeader back context={contextId} />
                {entityElement}
                <RouteTabs items={tabs} baseRoute={`/context/${contextId}/`} />
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
