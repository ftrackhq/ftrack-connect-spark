// :copyright: Copyright (c) 2016 ftrack

/**
 * Abstract Mediator
 */
export default class AbstractMediator {
    /** Return ftrack API credentials. */
    getCredentials() {
        throw new Error('Not implemented');
    }

    getPublishOptions() {
        throw new Error('Not implemented');
    }

    // eslint-disable-next-line no-unused-vars
    exportMedia(options) {
        throw new Error('Not implemented');
    }

    // eslint-disable-next-line no-unused-vars
    uploadMedia(options) {
        throw new Error('Not implemented');
    }

    /** Return components to import for *options*. */
    // eslint-disable-next-line no-unused-vars
    getImportComponents(options) {
        throw new Error('Not implemented');
    }

    /** Import *component* and resolve on success. */
    // eslint-disable-next-line no-unused-vars
    importComponent(component) {
        throw new Error('Not implemented');
    }
}