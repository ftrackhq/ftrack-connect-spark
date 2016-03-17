// :copyright: Copyright (c) 2016 ftrack


/** Return create operation object for entity *type* and *data*. */
export function createOperation(type, data) {
    const operation = { action: 'create', entity_type: type };
    operation.entity_data = Object.assign({}, data, { __entity_type__: type });
    return operation;
}


/** Return query operation object for *expression*. */
export function queryOperation(expression) {
    return { action: 'query', expression };
}

/**
 * Return update operation object for entity *type* identified by *keys*.
 *
 * *data* should be an object of values to update.
 */
export function updateOperation(type, keys, data) {
    const operation = {
        action: 'update',
        entity_type: type,
        entity_key: keys,
    };
    operation.entity_data = Object.assign({}, data, { __entity_type__: type });
    return operation;
}

/**
 * ftrack API session
 */
class Session {

    /** Construct Session instance with API credentials. */
    constructor(serverUrl, apiUser, apiKey) {
        this._apiUser = apiUser;
        this._apiKey = apiKey;
        this._serverUrl = serverUrl;
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
     * Returns a promise which will be resolved with an array of matched
     * entities.
     */
    _query(expression) {
        const operation = queryOperation(expression);
        let request = this._call([operation]);
        request = request.then((responses) => responses[0].data);

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

/** Shared API session instance. */
export let session = null;

/**
 * Configure shared session instance.
 *
 * Returns promise which will be resolved once session is ready for use.
 */
export function configureSharedApiSession(
    serverUrl, apiUser, apiKey
) {
    session = new Session(serverUrl, apiUser, apiKey);
    return session.initialize();
}
