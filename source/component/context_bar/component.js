// :copyright: Copyright (c) 2016 ftrack

// TODO: Consider rewriting this component to take advantage of redux and saga.

import React from 'react';
import { session } from '../../ftrack_api';

import { AssigneeField, StatusField, DateField } from 'component/field';
import style from './style.scss';

/** Context bar component with fields depending on *entity* in props.
*
* This component will fetch necessary data from the api when props are updated
* or the component mounts. As such it should be used with care to not spam the
* server with requests.
*
*/
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

    /* Handle status changed and update entity status with *newStatusId*. */
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

    /** Load necessary data for presentation. */
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

        const items = [];

        if (entity.__entity_type__ === 'Task') {
            items.push(<AssigneeField assignees={entity.assignments} />);
            items.push(
                <DateField date={entity.end_date} />
            );
        }

        if (entity.status) {
            items.push(
                <StatusField
                    selected={entity.status}
                    statuses={statuses}
                    onSelect={this.onStatusChange}
                />
            );
        }

        if (items.length === 0) {
            return <noscript />;
        }

        return (
            <div className={style['context-bar']}>
                {items}
            </div>
        );
    }
}

ContextBar.propTypes = {
    entity: React.PropTypes.object.isRequired,
    onEntityUpdate: React.PropTypes.func,
};

export default ContextBar;
