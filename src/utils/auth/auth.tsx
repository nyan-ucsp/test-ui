export const isAuthenticated = (): boolean => {
    if (typeof window !== "undefined") {
        const apikey = localStorage.getItem("api-key");
        return !!apikey;
    }
    return false;
};