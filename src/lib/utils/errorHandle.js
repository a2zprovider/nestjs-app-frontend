export const errorHandle = (error) => {
    const errData = error?.data;

    const fieldErrors = {};

    if (Array.isArray(errData?.message)) {
        for (const item of errData.message) {
            const property = item.property;
            const constraints = item.constraints;

            if (property && constraints) {
                fieldErrors[property] = Array.isArray(constraints)
                    ? constraints
                    : Object.values(constraints);
            }
        }
    }

    return fieldErrors;
};
