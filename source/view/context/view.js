// :copyright: Copyright (c) 2016 ftrack

import React from 'react';

import { MenuItem } from 'react-toolbox/lib/menu';
import { connect } from 'react-redux';

import HomeHeader from 'container/home_header';
import ContextCard from 'component/context_card';
import { User, PlaceholderUser } from 'component/user';
import RouteTabs from 'container/route_tabs';
import ButtonMenu from 'component/button_menu';
import FontIcon from 'react-toolbox/lib/font_icon';
import { session } from '../../ftrack_api';
import { updateOperation } from '../../ftrack_api/operation';
import { notificationWarning } from 'action/notification';
import style from './style.scss';


function AssigneeField({ assignees }) {

    if (assignees.length === 0) {
        return (
            <div>
                <PlaceholderUser title="Unassigned" />
            </div>
        );
    }

    return (
        <div>
            {
                assignees.map(
                    asignee => <User data={asignee.resource} thumbnail />
                )
            }
        </div>
    );
}

function DateField({ date }) {
    const className = date ? '' : style['empty-date'];
    let item;

    if (!date) {
        item = (
             <span className={className}>
                Due date
                <FontIcon className={style.icon} value="insert_invitation" />
            </span>
        );
    } else {
        item = <span>{date.toDate().toDateString()}</span>;
    }

    return (
        <div>{item}</div>
    );
}

DateField.propTypes = {
    date: React.PropTypes.object,
};

function StatusField({ selected, statuses, onSelect }) {
    return (
        <ButtonMenu
            label={selected.name}
            className={style['status-field']}
            style={{ borderColor: selected.color }}
            onSelect={onSelect}
        >
            {
                statuses.map(
                    (status) => <MenuItem caption={status.name} key={status.id} value={status.id} />
                )
            }
        </ButtonMenu>
    );
}

StatusField.propTypes = {
    selected: React.PropTypes.object,
    statuses: React.PropTypes.array,
    onSelect: React.PropTypes.func,
};

class ContextBar extends React.Component {

    constructor() {
        super();

        this.onStatusChange = this.onStatusChange.bind(this);

        this.state = {
            statuses: [],
        };
    }

    componentDidMount() {
        this._loadData();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.entity.id !== this.props.entity.id) {
            this._loadData();
        }
    }

    onStatusChange(newStatusId) {
        const statuses = this.state.statuses;
        const entity = Object.assign(
            {}, this.props.entity
        );
        const index = statuses.findIndex(
            (status) => status.id === newStatusId
        );

        if (index >= 0) {
            entity.status = Object.assign({}, statuses[index]);
        }

        this.props.onEntityUpdate(entity);
    }

    _loadData() {
        const response = session.getStatuses(
            this.props.entity.project.project_schema_id,
            this.props.entity.__entity_type__,
            this.props.entity.type_id
        );

        response.then(
            (statuses) => {
                this.setState({
                    statuses,
                });
            }
        );
    }

    render() {
        const { entity } = this.props;
        const { statuses } = this.state;

        if (!entity) {
            return <noscript />;
        }

        return (
            <div className={style['context-bar']}>
                <AssigneeField assignees={entity.assignments} />
                <DateField date={entity.end_date} />
                <StatusField selected={entity.status} statuses={statuses} onSelect={this.onStatusChange} />
            </div>
        );
    }
}

ContextBar.propTypes = {
    entity: React.PropTypes.object.isRequired,
    onEntityUpdate: React.PropTypes.func,
};


/** Context view */
class _ContextView extends React.Component {

    constructor() {
        super();
        this.state = { entity: null, loading: true, error: false };
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

    _onEntityUpdate(newEntity) {
        const oldEntity = this.state.entity;

        const response = session._call(
            [
                updateOperation(
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
            'thumbnail_id', 'link', 'status.sort', 'status.name',
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
            <div>
                <HomeHeader back context={contextId} />
                {
                    entity ?
                    <ContextBar
                        entity={entity}
                        onEntityUpdate={this._onEntityUpdate}
                    />
                    : <noscript />
                }
                <ContextCard entity={entity} flat />
                <RouteTabs
                    items={tabs}
                    baseRoute={`/context/${contextType}/${contextId}/`}
                />
                {this.props.children}
            </div>
        );
    }
}

_ContextView.propTypes = {
    params: React.PropTypes.object.isRequired,
    children: React.PropTypes.node.isRequired,
    onError: React.PropTypes.func,
};

_ContextView.defaultProps = {};

const ContextView = connect(
    null,
    (dispatch) => {
        return {
            onError: (error, entity) => {
                const type = entity.__entity_type__;
                let errorMessage = `Failed to update the ${type}`;
                if (error.message && error.message.indexOf('permission') !== -1) {
                    errorMessage = `You're note permitted to update this ${type}`;
                }
                dispatch(notificationWarning(errorMessage));
            },
        };
    }
)(_ContextView);

export default ContextView;
