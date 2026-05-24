import axios from 'axios';
import api from './axiousInstance'

const login = async (email: string, password: string): Promise<any> => {
    try {
        const url = `auth/login`;
        const response = await api.post(
            url,
            {
                email,
                password,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error: any) {
        console.error(`ERROR: ${error}`);
        throw new Error(`ERROR: ${error}`);
    }
}

const loginWithGoogle = async (): Promise<any> => {
    try {
        const url = `auth/google/login`;
        const response = await api.get(
            url,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error: any) {
        console.error(`ERROR: ${error}`);
        throw new Error(`ERROR: ${error}`);
    }
}

const refreshToken = async (): Promise<any> => {
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
        return response.data;
    } catch (error: any) {
        console.error(`ERROR: ${error}`);
        throw new Error(`ERROR: ${error}`);
    }
};

export const AuthApi = {
    login,
    loginWithGoogle,
    refreshToken,
}