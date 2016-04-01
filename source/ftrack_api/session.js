// :copyright: Copyright (c) 2016 ftrack

import { EventHub } from './event';
import { queryOperation } from './operation';


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
        const operation = queryOperation(expression);
        let request = this._call([operation]);
        request = request.then((responses) => responses[0]);

        return request;
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
