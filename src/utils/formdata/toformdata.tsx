const toFormData = function toFormData<T extends Record<string, any>>(data: T): FormData {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            // Handle array values, which might be needed for some form fields
            if (Array.isArray(value)) {
                value.forEach((item) => {
                    formData.append(`${key}[]`, item instanceof File ? item : item.toString());
                });
            }
            // Handle File objects directly
            else if (value instanceof File) {
                formData.append(key, value);
            }
            // Handle Date objects, converting them to ISO strings
            else if (value instanceof Date) {
                formData.append(key, value.toISOString());
            }
            // Default handling for all other types
            else {
                formData.append(key, value.toString());
            }
        }
    });

    return formData;
}

export { toFormData }