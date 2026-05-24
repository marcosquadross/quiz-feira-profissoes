import { useState, useEffect } from "react";

const DATA_URL = import.meta.env.VITE_DATA_URL;

export const usePreloadImages = (urls: string[]) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!urls || urls.length === 0) {
      setLoaded(true);
      return;
    }

    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    urls.forEach((url) => {
      const img = new Image();
      img.src = `${DATA_URL}/${url}`; 

      img.onload = () => {
        loadedCount++;
        if (loadedCount === urls.length) setLoaded(true);
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === urls.length) setLoaded(true);
      };

      images.push(img);
    });

    return () => {
      images.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [urls]);

  return loaded;
};
