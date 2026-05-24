import api from "./axiousInstance";

const create = async (name: string, email: string, password: string): Promise<any> => {
    try {
        const url = `user`;
        const response = await api.post(
            url,
            {
                name,
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

export const UserApi = {
    create,
};