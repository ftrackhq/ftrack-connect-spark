// :copyright: Copyright (c) 2016 ftrack

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

        const request = fetch(url, {
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'ftrack-api-key': this._apiKey,
                'ftrack-user': this._apiUser,
            },
            body: JSON.stringify(operations),
        }).then(
            (response) => response.json()
        );

        return request;
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
