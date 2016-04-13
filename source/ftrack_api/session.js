// :copyright: Copyright (c) 2016 ftrack

import { forIn } from 'lodash';
import moment from 'moment';
import loglevel from 'loglevel';

import { EventHub } from './event';
import { queryOperation } from './operation';


const logger = loglevel.getLogger('ftrack_api');

// A list of combined primary keys. If a entity type does not exist in this map
// the primary key will be assumed to be id.
const COMBINED_PRIMARY_KEY_MAP = {
    NoteComponent: ['note_id', 'component_id'],
    Metadata: ['parent_id', 'key'],
    SchemaStatus: ['status_id', 'schema_id'],
};

/* Return the identity of *item*. */
function identity(item) {
    if (COMBINED_PRIMARY_KEY_MAP[item.__entity_type__]) {
        const combinedKey = COMBINED_PRIMARY_KEY_MAP[item.__entity_type__].map(
            key => item[key]
        );
        return combinedKey.join(',');
    }

    return item.id;
}

/** Recursively iterate *data* and gather duplicates in *collection*.
*
* Note that *collection* is assumed to be a object and is updated in place. The
* result will be a dictionary with all entities mapped with their identity.
*
* .. example::
*
*       {
*           <primary-key>,Task: [<Task1>, <Task2>, <Task3>],
*           <primary-key>,Note: [<Note1>, <Note2>]
*       }
*
*       Where Task1, Task2 and Task3 is containing data for the same task.
*
*/
function _gatherEntityDuplicates(data, collection) {
    data.forEach(
        (item) => {
            if (!item.__entity_type__) {
                // Only process API entity types.
                return;
            }

            const primaryKey = identity(item);

            if (!primaryKey) {
                // This happens for combined primary keys if the do not exist
                // in COMBINED_PRIMARY_KEY_MAP.
                logger.warn('Key could not be determined for: ', item);
                return;
            }

            const identifier = `${primaryKey},${item.__entity_type__}`;

            forIn(
                item,
                (value) => {
                    if (value && value.constructor === Array) {
                        _gatherEntityDuplicates(value, collection);
                    }

                    if (value && value.constructor === Object) {
                        _gatherEntityDuplicates([value], collection);
                    }
                }
            );

            if (!collection[identifier]) {
                collection[identifier] = [];
            }

            collection[identifier].push(item);
        }
    );
}

/** Merge lazy loaded entities in *data*. */
function merge(data) {
    const collection = {};

    _gatherEntityDuplicates(data, collection);

    // Now merge all objects with the same identifier.
    forIn(collection, (objects) => {
        const map = {};
        forIn(objects, (item) => {
            forIn(item, (value, key) => {
                if (value && value.constructor !== Array && value.constructor !== Object) {
                    map[key] = value;
                }
            });
        });

        forIn(objects, (item) => {
            Object.assign(item, map);
        });
    });

    return data;
}

/** Iterate *data* and decode entities with special encoding logic.
*
* This will translate objects with __type__ equal to 'datetime' into moment
* datetime objects.
*
*/
function decode(data) {
    if (data && data.constructor === Array) {
        return data.map(item => decode(item));
    }

    if (data && data.constructor === Object) {
        if (data.__type__ === 'datetime') {
            return moment(data.value);
        }

        const out = {};
        forIn(data, (value, key) => {
            out[key] = decode(value);
        });

        return out;
    }

    return data;
}

/**
 * ftrack API session
 */
export class Session {

    /** Construct Session instance with API credentials. */
    constructor(serverUrl, apiUser, apiKey, { autoConnectEventHub = false }) {
        this._apiUser = apiUser;
        this._apiKey = apiKey;
        this._serverUrl = serverUrl;
        this.eventHub = new EventHub(serverUrl, apiUser, apiKey);

        if (autoConnectEventHub) {
            this.eventHub.connect();
        }
    }

    /**
     * Initialize session
     * Returns promise which will be resolved once session is ready for use.
     */
    initialize() {
        const operations = [
            { action: 'query_server_information' },
            { action: 'query_schemas' },
        ];
        const request = this._call(operations);

        request.then(
            (responses) => {
                this._serverInformation = responses[0];
                this._schemas = responses[1];
            }
        );

        return request;
    }

    /**
     * Call API with array of operation objects in *operations*.
     *
     * Returns promise which will be resolved with an array of decoded
     * responses.
     */
    _call(operations) {
        const url = `${this._serverUrl}/api`;

        let request = fetch(url, {
            method: 'post',
            credentials: 'include',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'ftrack-api-key': this._apiKey,
                'ftrack-user': this._apiUser,
            },
            body: JSON.stringify(operations),
        });

        request = request.then(
            (response) => response.json()
        );

        request = request.then((data) => {
            const result = decode(data);
            return Promise.resolve(result);
        });

        // Reject promise on API exception.
        request = request.then((response) => {
            if (response.exception) {
                return Promise.reject(
                    new Error(`${response.exception}: ${response.content}`)
                );
            }
            return Promise.resolve(response);
        });

        return request;
    }

    getStatuses(projectSchemaId, entityType, typeId = null) {
        let response;

        const select = [
            '_task_workflow.statuses.name',
            '_task_workflow.statuses.color',
            '_overrides.type_id',
            '_overrides.workflow_schema.statuses.name',
            '_overrides.workflow_schema.statuses.sort',
            '_overrides.workflow_schema.statuses.color',
            '_overrides.workflow_schema.statuses.sort',
            '_schemas.type_id',
            '_schemas.statuses.task_status.name',
            '_schemas.statuses.task_status.color',
            '_schemas.statuses.task_status.sort',
        ];

        response = this._query(
            `select ${select.join(', ')} from ProjectSchema where id is ${projectSchemaId}`
        );
        response = response.then(
            (result) => {
                const data = result.data[0];
                let statuses;
                if (entityType === 'Task') {
                    statuses = null;

                    if (typeId !== null && data._overrides.length > 0) {
                        for (const index in data._overrides) {
                            if (data._overrides[index].type_id === typeId) {
                                statuses = data._overrides[index].workflow_schema.statuses;
                                break;
                            }
                        }
                    }

                    if (statuses === null) {
                        statuses = data._task_workflow.statuses;
                    }
                }
                debugger;
                return Promise.resolve(statuses);
            }
        );

        return response;
    }

    /**
     * Perform a single query operation with *expression*.
     *
     * Returns a promise which will be resolved with an object containing data
     * and metadata.
     */
    _query(expression) {
        logger.debug('Query ', expression);

        const operation = queryOperation(expression);
        let request = this._call([operation]);
        request = request.then(
            (responses) => {
                const response = responses[0];
                response.data = merge(response.data);
                return response;
            }
        );

        return request;
    }

    /** Return an URL where *componentId* can be downloaded. */
    getComponent(componentId) {
        if (!componentId) {
            return `${this._serverUrl}/img/thumbnail2.png`;
        }

        return (
            `${this._serverUrl}/component/get?id=${componentId}` +
            `&username=${this._apiUser}&apiKey=${this._apiKey}`
        );
    }

    /** Return thumbnail URL for *componentId* with *size*. */
    thumbnail(componentId, size = 300) {
        if (!componentId) {
            return `${this._serverUrl}/img/thumbnail2.png`;
        }

        return (
            `${this._serverUrl}/component/thumbnail?id=${componentId}` +
            `&size=${size}&username=${this._apiUser}&apiKey=${this._apiKey}`
        );
    }
}

export default Session;
