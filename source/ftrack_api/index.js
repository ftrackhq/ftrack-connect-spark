// :copyright: Copyright (c) 2016 ftrack

/**
 * ftrack API session
 */
class Session {
    constructor(serverUrl, apiUser, apiKey) {
        this._apiUser = apiUser;
        this._apiKey = apiKey;
        this._serverUrl = serverUrl;

        this._name = 'Session';
    }

    _call(data) {
        const url = `${this._serverUrl}/api`;

        const request = fetch(url, {
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'ftrack-api-key': this._apiKey,
                'ftrack-user': this._apiUser,
            },
            body: JSON.stringify(data),
        }).then(
            (response) => response.json()
        );

        return request;
    }
}

/** Shared API session instance. */
export let session = null;

/** Configure shared session instance. */
export function configureSession(serverUrl, apiUser, apiKey) {
    session = new Session(serverUrl, apiUser, apiKey);
}
