// :copyright: Copyright (c) 2016 ftrack

/** Return a new error class from *name*. */
function _errorFactory(name) {
    function CustomError(message) {
        this.name = name;
        this.message = message;
        this.stack = (new Error()).stack;
    }

    CustomError.prototype = new Error();

    return CustomError;
}

// Throw when a permission denied error occurs.
export const ServerPermissionDeniedError = _errorFactory('ServerPermissionDeniedError');

// Throw when a validation error occurs.
export const ServerValidationError = _errorFactory('ServerValidationError');

// Throw when a connect timeout error occurs.
export const ConnectTimeoutError = _errorFactory('ConnectTimeoutError');

// Throw when connect publish error occurs.
export const ConnectPublishError = _errorFactory('ConnectPublishError');

// Throw when event publish timeout occurs.
export const EventServerPublishTimeoutError = _errorFactory('EventServerPublishTimeoutError');

