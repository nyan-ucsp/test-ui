import { toUTCDateString } from "../date_helper/datehelper";

const toFormData = function toFormData<T extends Record<string, any>>(model: T): FormData {
    const formData = new FormData();

    Object.keys(model).forEach((key) => {
        const value = model[key];
        if (typeof value === 'boolean') {
            // Convert boolean to string 'true' or 'false'.
            formData.append(key, value ? "true".toString() : "false".toString());
        } else if (value instanceof File) {
            // If the value is a File, append it directly.
            formData.append(key, value);
        } else if (value instanceof FileList) {
            Array.from(value).forEach((file) => {
                formData.append(key, file);
            });
        } else if (value instanceof Date) {
            // Convert Date to ISO string.
            formData.append(key, toUTCDateString(value));
        } else if (Array.isArray(value)) {
            // Handle empty arrays by appending an empty placeholder or skip based on requirements.
            if (value.length === 0) {
                // You can choose how to handle empty arrays.
                formData.append(`${key}[]`, ''); // Appending an empty string for empty arrays
            } else {
                // Handle non-empty arrays.
                value.forEach((item, index) => {
                    formData.append(`${key}[${index}]`, item);
                });
            }
        } else if (typeof value === 'object' && value !== null) {
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