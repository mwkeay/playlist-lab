export interface ServerActionError {
    name: string,
    message: string,
    cause?: unknown,
    stack?: string,
}

const formatServerActionError = (error: unknown): ServerActionError => {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            cause: error.cause,
            stack: error.stack,
        };
    }
    else {
        return {
            name: "UNEXPECTED_ERROR",
            message: "Invalid type thrown",
        }
    }
}

export default formatServerActionError;
