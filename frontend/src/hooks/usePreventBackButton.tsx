import { useEffect } from 'react';

export function usePreventBackButton() {
    useEffect(() => {
        const handlePopState = () => {
            window.history.pushState(null, "", window.location.pathname);
        };

        window.history.pushState(null, "", window.location.pathname);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);
}
