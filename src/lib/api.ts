import axios from "axios";
export const Api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
});

Api.interceptors.request.use((config: any) => {
    if (!!localStorage.getItem("scanner_user")) {
        const Token_key = JSON.parse(localStorage.getItem("scanner_user") ?? "{}").Authorization || null;
        const token = Token_key;
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

Api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default Api;
