// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import HomeHeader from 'container/home_header';
import ContextCard from 'component/context_card';
import ContextBar from 'component/context_bar';
import RouteTabs from 'container/route_tabs';
import { session } from '../../ftrack_api';
import { operation } from 'ftrack-javascript-api';
import { notificationWarning } from 'action/notification';

import style from './style.scss';

/** Context view */
class _ContextView extends React.Component {

    constructor() {
        super();
        this.state = {
            entity: null, projectId: null, loading: true, error: false,
        };
        this._loadContext = this._loadContext.bind(this);
        this._onEntityUpdate = this._onEntityUpdate.bind(this);
    }

    componentDidMount() {
        this._loadContext();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.params.active !== this.props.params.context) {
            this._loadContext();
        }
    }

    /** Handle update of *entity* and commit it to the remote. */
    _onEntityUpdate(newEntity) {
        const oldEntity = this.state.entity;

        const response = session.call(
            [
                operation.update(
                    newEntity.__entity_type__, [newEntity.id],
                    Object.assign({}, { status: newEntity.status })
                ),
            ]
        );

        response.catch(
            (error) => {
                this.setState({ entity: oldEntity });
                this.props.onError(error, oldEntity);
            }
        );

        this.setState({ entity: newEntity });
    }

    /** Return query string to get a TypedContext. */
    _getTypedContextQuery() {
        const select = [
            'project_id', 'thumbnail_id', 'link', 'status.sort', 'status.name',
            'status.color', 'assignments.resource.id', 'end_date',
            'project.project_schema_id', 'type_id',
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
            'id', 'thumbnail_id', 'link',
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

        const promise = session.query(queryString).then((result) => {
            const entity = result.data[0];

            if (!entity) {
                return Promise.reject(new Error('Failed to find entity.'));
            }

            const projectId = entity.project_id || entity.id;
            this.setState({ entity, projectId, loading: false });
            return Promise.resolve(entity);
        });

        promise.catch((error) => {
            this.setState({ loading: false, error });
        });
    }

    render() {
        const contextId = this.props.params.id;
        const projectId = this.state.projectId;
        const contextType = this.props.params.type;
        const entity = this.state.entity;
        const tabs = [
            { route: 'notes', label: 'Notes' },
            { route: 'versions', label: 'Versions' },
        ];
        return (
            <div className={style.view}>
                <div className={style['view-top']}>
                    <HomeHeader back context={contextId} projectId={projectId} />
                    <ContextBar
                        entity={entity}
                        onEntityUpdate={this._onEntityUpdate}
                    />
                    <ContextCard entity={entity} flat className={style.info} />
                    <div className={style.tabs}>
                        <RouteTabs
                            items={tabs}
                            baseRoute={`/context/${contextType}/${contextId}/`}
                        />
                    </div>
                </div>
                {this.props.children}
            </div>
        );
    }
}

_ContextView.propTypes = {
    params: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired,
    onError: PropTypes.func,
};

_ContextView.defaultProps = {};

const ContextView = connect(
    null,
    (dispatch) => (
        {
            onError: (error, entity) => {
                const type = entity.__entity_type__;
                let errorMessage = `Failed to update the ${type}`;
                if (error.message && error.message.indexOf('permission') !== -1) {
                    errorMessage = `You're not permitted to update this ${type}`;
                }
                dispatch(notificationWarning(errorMessage));
            },
        }
    )
)(_ContextView);

export default ContextView;
