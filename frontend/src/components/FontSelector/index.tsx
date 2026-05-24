import { useEffect, useState } from 'react';
import { Control } from 'react-hook-form';
import CustomSelect from '../Select';

const GOOGLE_FONTS_API = import.meta.env.VITE_GOOGLE_FONTS_API;
const API_KEY = import.meta.env.VITE_GOOGLE_FONTS_API_KEY;

interface FontSelectorProps {
    control: Control<any>;
    name?: string;
    popOverText?: string;
    label?: string;
    onFontLoad?: (font: string) => void;
}

export function FontSelector({
    control,
    name = 'font',
    label = 'Fonte',
    popOverText,
    onFontLoad,
}: FontSelectorProps) {
    const [fontOptions, setFontOptions] = useState<{ value: string; label: string }[]>([]);

    const updateFontLink = (font: string) => {
        const fontName = font.replace(/ /g, '+');
        let link = document.getElementById('dynamic-google-font') as HTMLLinkElement;

        if (!link) {
            link = document.createElement('link');
            link.id = 'dynamic-google-font';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }

        link.href = `https://fonts.googleapis.com/css2?family=${fontName}&display=swap`;

        if (onFontLoad) onFontLoad(font);
    };

    useEffect(() => {
        const fetchFonts = async () => {
            try {
                const res = await fetch(`${GOOGLE_FONTS_API}?key=${API_KEY}&sort=popularity`);
                const data = await res.json();
                const fonts = data.items
                    .sort((a: any, b: any) => a.family.localeCompare(b.family)) // ordenação alfabética
                    .map((font: any) => ({
                        label: font.family,
                        value: font.family,
                    }));
                setFontOptions(fonts);
            } catch (err) {
                console.error('Erro ao buscar fontes do Google:', err);
            }
        };

        fetchFonts();
    }, []);

    return (
        <CustomSelect
            control={control}
            name={name}
            options={fontOptions}
            popOverText={popOverText}
            label={label}
            onChange={(e) => {
                const font = e.target.value;
                if (typeof font === 'string') {
                    updateFontLink(font);
                }
            }}
        />
    );
}
