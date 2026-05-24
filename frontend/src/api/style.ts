import api from "./axiousInstance";

const getFont = async (fontFamily: string): Promise<string> => {
    try {
        const response = await api.get(`/fonts/${encodeURIComponent(fontFamily)}`, {
            responseType: "text",
        });

        if (!response.data) {
            throw new Error("Resposta vazia do servidor.");
        }

        return response.data;

    } catch (error) {
        alert("Erro ao obter a fonte.");
        console.log("ERROR:", error);
        console.error("ERROR:", error);
        throw new Error("Falha na obtenção da fonte.");
    }
};

export const StyleAPI = {
    getFont,
};
