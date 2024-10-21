const toFormData = function toFormData<T extends Record<string, any>>(model: T): FormData {
    const formData = new FormData();

    Object.keys(model).forEach((key) => {
        const value = model[key];
        console.log(`${key} : ${typeof value} : ${value}`)
        if (typeof value === 'boolean') {
            console.log(`Boolean key ${key}`)
            // Convert boolean to string 'true' or 'false'.
            formData.append(key, value ? 'true' : 'false');
        }
        else if (value instanceof File) {
            // If the value is a File, append it directly.
            formData.append(key, value);
        } else if (value instanceof FileList) {
            Array.from(value).forEach((file) => {
                formData.append(key, file);
            });
        } else if (Array.isArray(value)) {
            // Handle arrays (e.g., multiple files or multiple values).
            value.forEach((item, index) => {
                formData.append(`${key}[${index}]`, item);
            });
        } else if (value instanceof Date) {
            // Convert Date to ISO string.
            formData.append(key, value.toUTCString());
        } else if (typeof value === 'object') {
            // Recursively handle nested objects (optional).
            Object.keys(value).forEach((subKey) => {
                formData.append(`${key}.${subKey}`, value[subKey]);
            });
        } else {
            // Append other primitive values (strings, numbers, etc.).
            formData.append(key, String(value));
        }
    });

    return formData;
}


export { toFormData }