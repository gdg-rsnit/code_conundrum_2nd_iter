import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

// Response interceptor to handle 401 errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // If we get a 401 Unauthorized error, the session has expired
        if (error.response?.status === 401) {
            // Clear localStorage
            localStorage.removeItem("cc_auth_user");
            
            // Redirect to login page
            window.location.href = "/login";
        }
        
        return Promise.reject(error);
    }
);

export default api;