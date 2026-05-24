import { createContext, useContext, useEffect, useState } from "react";
import { AuthApi } from "../api/auth";
import { useSnackbar } from "notistack";

interface AuthContextType {
    userId: string | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<any>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [userId, setUser] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    // Recupera o usuário salvo no localStorage, se existir.
    useEffect(() => {
        const storageUser = localStorage.getItem("userId");
        const storageToken = localStorage.getItem("accessToken"); 
        
        if (storageUser) {
            setUser(storageUser);
        }

        if (storageToken) {
            setToken(storageToken);
        }

        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const reponse = await AuthApi.login(email, password);

            localStorage.setItem("accessToken", reponse.token.accessToken);
            localStorage.setItem("refreshToken", reponse.token.refreshToken);
            localStorage.setItem("userId", reponse.id);

            setUser(reponse);
            setToken(reponse.token.accessToken);
            enqueueSnackbar("Login efetuado com sucesso.", { variant: "success" });
            return reponse;
        } catch (error: any) {
            console.error(`ERROR: ${error}`);
            enqueueSnackbar("Falha ao fazer login. Verifique os dados informados.", { variant: "error" });
        }
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ userId, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
    return context;
};
