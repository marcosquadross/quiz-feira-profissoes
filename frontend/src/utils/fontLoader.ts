
export async function loadFontOnce(fontFamily: string, apiUrl: string): Promise<void> {
  if (!fontFamily) return;

  // pega primeiro token antes da vírgula (como no seu código)
  const fontName = fontFamily.split(',')[0].replace(/['"]/g, '').trim();
  const proxyCssUrl = `${apiUrl}/fonts/${encodeURIComponent(fontName)}`;

  // evita inserir duplicado
  if (!document.querySelector(`link[href="${proxyCssUrl}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = proxyCssUrl;
    document.head.appendChild(link);
  }

  // tenta carregar com timeout
  const timeoutMs = 4000;
  const loadPromise = document.fonts.load(`1rem "${fontName}"`);
  const timeout = new Promise<void>((res) => setTimeout(res, timeoutMs));
  try {
    await Promise.race([loadPromise, timeout]);
  } catch {
    // swallow
  }
}
