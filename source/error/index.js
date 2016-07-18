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

// Throw when components hook failed.
export const CreateComponentsHookError = _errorFactory('CreateComponentsError');
