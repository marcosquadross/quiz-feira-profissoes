import axios from "axios";
import SnackbarUtils from "../utils/useSnackbar";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use(
    config => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            console.log("Token expirado. Tentando atualizar o token de acesso...");
            try {
                const url = `http://localhost:3000/auth/refresh`;
                const refreshToken = localStorage.getItem("refreshToken");
                const response = await axios.post(
                    url,
                    {},
                    {
                        headers: {
                            "Authorization": `Bearer ${refreshToken}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                localStorage.setItem("accessToken", response.data.accessToken);
                localStorage.setItem("refreshToken", response.data.refreshToken);

                // Atualiza o cabeçalho Authorization do originalRequest com o novo token
                originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;

                // Reenvia a solicitação original com o novo token
                return api(originalRequest);
            } catch (error: any) {
                // Se a atualização falhar, limpa os tokens e redireciona
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("userId");
                localStorage.setItem("message", "Sessão expirada. Faça login novamente.");
                // window.location.href = "/login"; // ou redirecione para a página de login

                SnackbarUtils.info("Necessário fazer login.");

                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

export default api;