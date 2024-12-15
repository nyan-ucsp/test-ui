const toUTCDateString = function (date: Date): string {
    //! 2024-10-17T01:41:14.224Z (Pattern)
    //! 2024-10-21T10:06:28.124Z
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    const milliSeconds = String(date.getMilliseconds()).padStart(3, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliSeconds}Z`;
};

const formatToLocalDateTime = function (created_at: string | null): string | null {
    if (!created_at) return null;

    // Convert to Date object
    const date = new Date(created_at);

    // Format to local date-time string
    return date.toLocaleString();
}

export { toUTCDateString, formatToLocalDateTime }