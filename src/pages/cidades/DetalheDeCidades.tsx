import { useNavigate, useParams } from "react-router-dom";
import { Box, Grid, LinearProgress, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import * as yup from "yup";

import { FerramentasDeDetalhe } from "../../shared/components";
import { LayoutBaseDePagina } from "../../shared/layouts";
import { CidadeService } from "../../shared/services/api/cidades/CidadesService";
import { VTextField, VForm, useVForm, IVFormsErrors } from "../../shared/forms";

interface IFormData {
    nome: string;
}

const formValidationSchema: yup.SchemaOf<IFormData> = yup.object().shape({
    nome: yup.string().required().min(3),
});

export const DetalheDeCidades: React.FC = () => {
    const { id = "nova" } = useParams<"id">();
    const navigate = useNavigate();
    const { formRef, save, saveAndClose, IsSaveAndClose } = useVForm();

    const [isLoading, setIsLoading] = useState(false);
    const [nome, setNome] = useState("");

    useEffect(() => {
        if (id !== "nova") {
            setIsLoading(true);

            CidadeService.getById(Number(id)).then((result) => {
                setIsLoading(false);
                if (result instanceof Error) {
                    alert(result.message);
                    navigate("/cidades");
                } else {
                    setNome(result.nome);
                    formRef.current?.setData(result);
                }
            });
        } else {
            formRef.current?.setData({
                nome: "",
            });
        }
    }, [id]);

    const handleSave = (dados: IFormData) => {
        formValidationSchema
            .validate(dados, { abortEarly: false })
            .then((dadosValidados) => {
                setIsLoading(true);

                if (id === "nova") {
                    CidadeService.create(dadosValidados).then((result) => {
                        setIsLoading(false);
                        if (result instanceof Error) {
                            alert(result.message);
                        } else {
                            if (IsSaveAndClose()) {
                                navigate("/cidades");
                            } else {
                                navigate(`/cidades/detalhe/${result}`);
                            }
                        }
                    });
                } else {
                    CidadeService.updateById(Number(id), {
                        id: Number(id),
                        ...dadosValidados,
                    }).then((result) => {
                        setIsLoading(false);
                        if (result instanceof Error) {
                            alert(result.message);
                        } else {
                            if (IsSaveAndClose()) {
                                navigate("/cidades");
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
            CidadeService.deleteById(id).then((result) => {
                if (result instanceof Error) {
                    alert(result.message);
                } else {
                    alert("Registro apagado com sucesso");
                    navigate("/cidades");
                }
            });
        }
    };

    return (
        <LayoutBaseDePagina
            titulo={id === "nova" ? "Nova Cidade" : nome}
            barraDeFerramentas={
                <FerramentasDeDetalhe
                    textoBotaoNovo="Nova"
                    mostrarBotaoSalvarEFechar
                    mostrarBotaoNovo={id !== "nova"}
                    mostrarBotaoApagar={id !== "nova"}
                    aoClicarEmSalvar={save}
                    aoClicarEmSalvarEFechar={saveAndClose}
                    aoClicarEmApagar={() => handleDelete(Number(id))}
                    aoClicarEmVoltar={() => navigate("/cidades")}
                    aoClicarEmNovo={() => navigate("/cidades/detalhe/nova")}
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
                                    label="Nome"
                                    name="nome"
                                    fullWidth
                                    disabled={isLoading}
                                    onChange={(e) => setNome(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </VForm>
        </LayoutBaseDePagina>
    );
};
