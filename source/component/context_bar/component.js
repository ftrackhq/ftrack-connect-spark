// :copyright: Copyright (c) 2016 ftrack

// TODO: Consider rewriting this component to take advantage of redux and saga.

import React from 'react';
import { session } from '../../ftrack_api';

// import projectSchema from 'ftrack-javascript-api/lib/project_schema';

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
            assignees: undefined,
        };
    }

    componentDidMount() {
        this._loadData(this.props.entity);
    }

    componentWillReceiveProps(nextProps) {
        const currentEntityId = this.props.entity && this.props.entity.id || null;
        const nextEntityId = nextProps.entity && nextProps.entity.id || null;

        if (currentEntityId !== nextEntityId) {
            this._loadData(nextProps.entity);
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
    _loadData(entity) {
        if (!entity) {
            return;
        }

        if (entity.status) {
            // const statusesResponse = projectSchema.getStatuses(
            //     session,
            //     entity.project.project_schema_id,
            //     entity.__entity_type__,
            //     entity.type_id
            // );
            // statusesResponse.then(
            //     (statuses) => {
            //         this.setState({
            //             statuses,
            //         });
            //     }
            // );
        }

        if (entity.__entity_type__ === 'Task') {
            const resourceIds = entity.assignments.map(
                (assignment) => assignment.resource.id
            );

            if (resourceIds.length > 0) {
                const assigneesResponse = session.query(
                    'select first_name, last_name, thumbnail_id from User where id in ' +
                    `(${resourceIds.join(', ')})`
                );

                this.setState({ assignees: undefined });
                assigneesResponse.then(
                    (result) => {
                        this.setState({
                            assignees: result.data,
                        });
                    }
                );
            } else {
                this.setState({
                    assignees: [],
                });
            }
        }
    }

    render() {
        const { entity } = this.props;
        const { statuses, assignees } = this.state;

        const items = [];

        if (entity && entity.__entity_type__ === 'Task') {
            items.push(
                <AssigneeField
                    key="assignees"
                    assignees={assignees || []}
                    loading={assignees === undefined}
                />
            );
            items.push(
                <DateField key="date" date={entity.end_date} />
            );
        }

        if (entity && entity.status) {
            items.push(
                <StatusField
                    key="status"
                    selected={entity.status}
                    statuses={statuses}
                    onSelect={this.onStatusChange}
                />
            );
        }

        return (
            <div className={style['context-bar']}>
                {items}
            </div>
        );
    }
}

ContextBar.propTypes = {
    entity: React.PropTypes.object,
    onEntityUpdate: React.PropTypes.func,
};

export default ContextBar;
