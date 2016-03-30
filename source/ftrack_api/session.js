// :copyright: Copyright (c) 2016 ftrack

import { forIn } from 'lodash';
import moment from 'moment';
import loglevel from 'loglevel';

import { EventHub } from './event';
import { queryOperation } from './operation';


const logger = loglevel.getLogger('ftrack_api');

function _gatherCache(data, cache) {
    data.forEach(
        (item) => {
            if (!item.__entity_type__) {
                return;
            }
            const identifier = `${item.id}, ${item.__entity_type__}`;
            for (const key in item) {
                // skip loop if the property is from prototype
                if (!item.hasOwnProperty(key)) continue;

                if (item[key] && item[key].constructor === Array) {
                    _gatherCache(item[key], cache);
                }

                if (item[key] && item[key].constructor === Object) {
                    _gatherCache([item[key]], cache);
                }
            }

            if (!cache[identifier]) {
                cache[identifier] = [];
            }

            cache[identifier].push(item);
        }
    );
}

function merge(data) {
    const cache = {};

    _gatherCache(data, cache);

    // Now merge all objects with the same identifier.
    forIn(cache, (objects) => {
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
            logger.debug('Decode ', result);
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

    /** Return thumbnail URL for *componentId* with *size*. */
    thumbnail(componentId, size) {
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
