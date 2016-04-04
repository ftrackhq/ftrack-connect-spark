// :copyright: Copyright (c) 2016 ftrack

import React from 'react';
import { Tab, Tabs } from 'react-toolbox/lib/tabs';
import ProgressBar from 'react-toolbox/lib/progress_bar';

import HomeHeader from 'container/home_header';
import ContextCard from 'component/context_card';

import { session } from '../../ftrack_api';

import style from './style';


/** Context view */
class ContextView extends React.Component {

    constructor() {
        super();
        this.state = { index: 0, entity: null, loading: true, error: false };
        this._handleTabChange = this._handleTabChange.bind(this);
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

    _handleTabChange(index) {
        this.setState({ index });
    }

    /** Load context entity. */
    _loadContext() {
        const select = [
            'thumbnail_id', 'type.color', 'type.is_billable', 'type.name',
            'type.sort', 'priority.sort', 'end_date', 'name', 'status',
            'type.name', 'assignments', 'assignments.resource_id', 'project',
            'description', 'priority.name', '_link', 'object_type_id',
            'status.sort', 'status.name', 'status.color',
        ];
        const queryString = (
            `select ${select.join(', ')} from TypedContext where ` +
            `id is "${this.props.params.context}" limit 1`
        );

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
        const contextId = this.props.params.context;
        const entity = this.state.entity;
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
                <Tabs index={this.state.index} onChange={this._handleTabChange}>
                    <Tab label="Notes">
                        <p>
                            Notes on the context.
                        </p>
                    </Tab>
                    <Tab label="Versions">
                        <p>
                            Versions on the contex.
                        </p>
                    </Tab>
                </Tabs>
            </div>
        );
    }
}

ContextView.propTypes = {
    params: React.PropTypes.object.isRequired,
};

ContextView.defaultProps = {};

export default ContextView;
