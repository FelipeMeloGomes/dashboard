import { useNavigate, useParams } from "react-router-dom";
import { Box, Grid, LinearProgress, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import * as yup from "yup";

import { FerramentasDeDetalhe } from "../../shared/components";
import { LayoutBaseDePagina } from "../../shared/layouts";
import { PessoasService } from "../../shared/services/api/pessoas/PessoasService";
import { VTextField, VForm, useVForm, IVFormsErrors } from "../../shared/forms";
import { AutoCompleteCidade } from "./components/AutoCompleteCidade";

interface IFormData {
    email: string;
    nomeCompleto: string;
    cidadeId: number;
}

const formValidationSchema: yup.SchemaOf<IFormData> = yup.object().shape({
    nomeCompleto: yup.string().required().min(3),
    email: yup.string().required().email(),
    cidadeId: yup.number().required(),
});

export const DetalheDePessoas: React.FC = () => {
    const { id = "nova" } = useParams<"id">();
    const navigate = useNavigate();
    const { formRef, save, saveAndClose, IsSaveAndClose } = useVForm();

    const [isLoading, setIsLoading] = useState(false);
    const [nome, setNome] = useState("");

    useEffect(() => {
        if (id !== "nova") {
            setIsLoading(true);

            PessoasService.getById(Number(id)).then((result) => {
                setIsLoading(false);
                if (result instanceof Error) {
                    alert(result.message);
                    navigate("/pessoas");
                } else {
                    setNome(result.nomeCompleto);
                    formRef.current?.setData(result);
                }
            });
        } else {
            formRef.current?.setData({
                nomeCompleto: "",
                email: "",
                cidadeId: undefined,
            });
        }
    }, [id]);

    const handleSave = (dados: IFormData) => {
        formValidationSchema
            .validate(dados, { abortEarly: false })
            .then((dadosValidados) => {
                setIsLoading(true);

                if (id === "nova") {
                    PessoasService.create(dadosValidados).then((result) => {
                        setIsLoading(false);
                        if (result instanceof Error) {
                            alert(result.message);
                        } else {
                            if (IsSaveAndClose()) {
                                navigate("/pessoas");
                            } else {
                                navigate(`/pessoas/detalhe/${result}`);
                            }
                        }
                    });
                } else {
                    PessoasService.updateById(Number(id), {
                        id: Number(id),
                        ...dadosValidados,
                    }).then((result) => {
                        setIsLoading(false);
                        if (result instanceof Error) {
                            alert(result.message);
                        } else {
                            if (IsSaveAndClose()) {
                                navigate("/pessoas");
                            }
                        }
                    });
                }
            })
            .catch((errors: yup.ValidationError) => {
                const validationsErrors: IVFormsErrors = {};

                errors.inner.forEach((error) => {
                    if (!error.path) return;

                    validationsErrors[error.path] = error.message;
                });

                console.log(validationsErrors);
                formRef.current?.setErrors(validationsErrors);
            });
    };

    const handleDelete = (id: Number) => {
        if (confirm("Realmente deseja apagar?")) {
            PessoasService.deleteById(id).then((result) => {
                if (result instanceof Error) {
                    alert(result.message);
                } else {
                    alert("Registro apagado com sucesso");
                    navigate("/pessoas");
                }
            });
        }
    };

    return (
        <LayoutBaseDePagina
            titulo={id === "nova" ? "Nova Pessoa" : nome}
            barraDeFerramentas={
                <FerramentasDeDetalhe
                    textoBotaoNovo="Nova"
                    mostrarBotaoSalvarEFechar
                    mostrarBotaoNovo={id !== "nova"}
                    mostrarBotaoApagar={id !== "nova"}
                    aoClicarEmSalvar={save}
                    aoClicarEmSalvarEFechar={saveAndClose}
                    aoClicarEmApagar={() => handleDelete(Number(id))}
                    aoClicarEmVoltar={() => navigate("/pessoas")}
                    aoClicarEmNovo={() => navigate("/pessoas/detalhe/nova")}
                />
            }
        >
            <VForm ref={formRef} onSubmit={handleSave}>
                <Box
                    margin={1}
                    display="flex"
                    flexDirection="column"
                    component={Paper}
                    variant="outlined"
                >
                    <Grid container direction="column" padding={2} spacing={2}>
                        {isLoading && (
                            <Grid item>
                                <LinearProgress variant="indeterminate" />
                            </Grid>
                        )}

                        <Grid item>
                            <Typography variant="h6">Geral</Typography>
                        </Grid>

                        <Grid container item direction="row" spacing={2}>
                            <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                                <VTextField
                                    label="Nome Completo"
                                    name="nomeCompleto"
                                    fullWidth
                                    disabled={isLoading}
                                    onChange={(e) => setNome(e.target.value)}
                                />
                            </Grid>
                        </Grid>

                        <Grid container item direction="row" spacing={2}>
                            <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                                <VTextField
                                    label="Email"
                                    name="email"
                                    fullWidth
                                    disabled={isLoading}
                                />
                            </Grid>
                        </Grid>

                        <Grid container item direction="row" spacing={2}>
                            <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                                <AutoCompleteCidade
                                    isExternalLoading={isLoading}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </VForm>
        </LayoutBaseDePagina>
    );
};
