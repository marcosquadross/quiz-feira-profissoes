import { SnackbarKey, SnackbarMessage, useSnackbar, OptionsObject } from "notistack";

let useSnackbarRef: {
    enqueueSnackbar: (message: SnackbarMessage, options?: OptionsObject) => SnackbarKey;
};

export const SnackbarUtilsConfigurator = () => {
    useSnackbarRef = useSnackbar();
    return null;
};

export default {
    success(msg: SnackbarMessage, options: OptionsObject = {}) {
        return useSnackbarRef.enqueueSnackbar(msg, { ...options, variant: "success" });
    },
    error(msg: SnackbarMessage, options: OptionsObject = {}) {
        return useSnackbarRef.enqueueSnackbar(msg, { ...options, variant: "error" });
    },
    warning(msg: SnackbarMessage, options: OptionsObject = {}) {
        return useSnackbarRef.enqueueSnackbar(msg, { ...options, variant: "warning" });
    },
    info(msg: SnackbarMessage, options: OptionsObject = {}) {
        return useSnackbarRef.enqueueSnackbar(msg, { ...options, variant: "info" });
    },
};