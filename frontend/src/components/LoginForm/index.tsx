import { useNavigate } from "react-router-dom";
import { Container, Typography, Box, Paper } from "@mui/material";
import { CustomInput } from "../Input";
import { StyledButton } from "../Button";
import { GoogleButton } from "../GoogleLoginButton";
import { useAuth } from "../../contexts/AuthContext";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const schema = z.object({
    email: z.string().nonempty("Este campo é obrigatório").email("Insira um email válido"),
    password: z.string().nonempty("Este campo é obrigatório").min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type LoginFormInputs = z.infer<typeof schema>;

export function LoginForm() {
    const navigate = useNavigate();

    const { login } = useAuth();

    const { control, handleSubmit } = useForm<LoginFormInputs>({
        resolver: zodResolver(schema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async ({ email, password }: LoginFormInputs) => {
        const response = await login(email, password);
        if (response) {
            navigate("/admin");
        }
    };

    return (
        <Container maxWidth="xs">
            <Box mt={10}>
                <Paper elevation={3} sx={{ padding: 2 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Login
                    </Typography>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <CustomInput name="email" label="Email" control={control} />
                        <CustomInput name="password" label="Senha" type="password" control={control} />
                        <Box mt={2}>
                            <StyledButton type="submit" variant="contained" color="primary" fullWidth >
                                Login
                            </StyledButton>
                        </Box>
                    </form>
                    <Box mt={2}>
                        <Typography variant="body2" align="center"> ou </Typography>
                    </Box>
                    <Box mt={2}>
                        <GoogleButton />
                    </Box>
                    <Box mt={2}>
                        <Typography variant="body2" align="center">
                            Não tem uma conta? <a href="/signup">Crie uma conta</a>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}
