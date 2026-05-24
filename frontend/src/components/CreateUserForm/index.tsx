import { useNavigate } from "react-router-dom";
import { Container, Typography, Box, Paper } from "@mui/material";
import { CustomInput } from "../Input";
import { StyledButton } from "../Button";
import { useSnackbar } from "notistack";
import { UserApi } from "../../api/user";
import {GoogleButton} from "../GoogleLoginButton";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const schema = z.object({
    name: z.string().nonempty("Este campo é obrigatório"),
    email: z.string().nonempty("Este campo é obrigatório").email("Insira um email válido"),
    password: z.string().nonempty("Este campo é obrigatório").min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type CreateUserFormValues = z.infer<typeof schema>;

export function CreateUserForm() {
    const { enqueueSnackbar } = useSnackbar();

    const navigate = useNavigate();

    const { control, handleSubmit } = useForm<CreateUserFormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: "", email: "", password: "" },
    });

    const onSubmit = async (data: CreateUserFormValues) => {
        try {
            await UserApi.create(data.name, data.email, data.password);
            enqueueSnackbar("Usuário criado com sucesso.", { variant: "success" });
            navigate("/login");
        } catch (error: any) {
            console.error(`ERROR: ${error}`);
            enqueueSnackbar("Falha ao criar usuário. Verifique os dados informados.", { variant: "error" });
        }
    };

    return (
        <Container maxWidth="xs">
            <Box mt={10}>
                <Paper elevation={3} sx={{ padding: 2 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Crie um Conta
                    </Typography>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <CustomInput name="name" label="Nome" control={control} />
                        <CustomInput name="email" label="Email" control={control} />
                        <CustomInput name="password" label="Senha" type="password" control={control} />
                        <Box mt={2}>
                            <StyledButton type="submit" variant="contained" color="primary" fullWidth>
                                Criar Conta
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
                            Já possui uma conta? <a href="/login">Faça login</a>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}
