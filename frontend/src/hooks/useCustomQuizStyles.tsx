import { Style } from "../interfaces/style.interface";

// const DATA_URL = window.location.hostname === '172.16.255.204'
// ? import.meta.env.VITE_DATA_URL_PRIVATE
// : import.meta.env.VITE_DATA_URL_PUBLIC;

const DATA_URL = import.meta.env.VITE_DATA_URL_PUBLIC;

export default function useCustomQuizStyles(style: Style) {
    return {
        backgroundImage: style.backgroundImage ? `url(${DATA_URL}${style.backgroundImage})` : "",
        backgroundColor: style.backgroundColor,
        fontFamily: style.fontFamily,
        color: style.textColor,
        panelsColor: style.panelsColor,
    };
}
