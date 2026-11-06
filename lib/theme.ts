export const themeInitScript = `(() => {
  let saved = null;
  try { saved = localStorage.getItem('gymbro_theme'); } catch {}
  const theme = saved === 'light' || saved === 'dark' ? saved : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
})();`
