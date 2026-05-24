import { useEffect } from "react";

export function useDynamicFont(fontFamily?: string) {
    useEffect(() => {
        if (!fontFamily) return;

        const fontName = fontFamily.split(',')[0].replace(/['"]/g, '').trim();
        const proxyCssUrl = `${import.meta.env.VITE_API_URL}/fonts/${encodeURIComponent(fontName)}`;

        if (document.querySelector(`link[href="${proxyCssUrl}"]`)) return;

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = proxyCssUrl;
        document.head.appendChild(link);

        document.fonts.load(`1rem "${fontName}"`);

        // return () => {
        //     // Opcional: remover a fonte ao desmontar o componente
        //     // document.head.removeChild(link);
        // };
    }, [fontFamily]);
}