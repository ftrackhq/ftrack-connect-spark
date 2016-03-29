// :copyright: Copyright (c) 2016 ftrack

/**
 * Abstract Mediator
 */
export default class AbstractMediator {

    getPublishOptions() {
        throw new Error('Not implemented');
    }

    exportMedia(options) { // eslint-disable-line no-unused-vars
        throw new Error('Not implemented');
    }

    uploadMedia(options) { // eslint-disable-line no-unused-vars
        throw new Error('Not implemented');
    }
}
