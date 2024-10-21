const toUTCString = Date.prototype.toUTCString = function () {
    //! 2024-10-17T01:41:14.224Z (Pattern)
    const year = this.getUTCFullYear();
    const month = String(this.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(this.getUTCDate()).padStart(2, '0');
    const hours = String(this.getUTCHours()).padStart(2, '0');
    const minutes = String(this.getUTCMinutes()).padStart(2, '0');
    const seconds = String(this.getUTCSeconds()).padStart(2, '0');
    const milliSeconds = String(this.getMilliseconds()).padStart(3, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliSeconds}Z`;
};

export { toUTCString }