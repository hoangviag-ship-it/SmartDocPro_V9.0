// Hệ thống giao diện tập trung: font chữ, cỡ chữ, độ nén — áp cho TOÀN BỘ app
// Lưu ở localStorage 'sde_theme_v1' (được đồng bộ qua sync engine -> mọi thiết bị)

export const FONT_OPTIONS = [
  { id: 'sans', label: 'Mặc định (Sans)', stack: 'ui-sans-serif, system-ui, "Segoe UI", Roboto, Arial, sans-serif' },
  { id: 'inter', label: 'Inter', stack: '"Inter", ui-sans-serif, system-ui, sans-serif' },
  { id: 'roboto', label: 'Roboto', stack: '"Roboto", ui-sans-serif, system-ui, sans-serif' },
  { id: 'serif', label: 'Serif (Times)', stack: 'Georgia, "Times New Roman", serif' },
  { id: 'mono', label: 'Mono', stack: 'ui-monospace, "Cascadia Code", "Courier New", monospace' },
];

export const DEFAULT_THEME = {
  fontId: 'sans',
  fontScale: 1, // 0.85 .. 1.3
  density: 'normal', // 'compact' | 'normal' | 'comfortable'
};

const KEY = 'sde_theme_v1';

export function loadTheme() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_THEME, ...JSON.parse(raw) };
  } catch { /* bỏ qua */ }
  return { ...DEFAULT_THEME };
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(KEY, JSON.stringify(theme));
  } catch { /* bỏ qua */ }
}

// Áp theme ra giao diện bằng CSS variables (đọc lại trong index.css)
export function applyTheme(theme) {
  const t = { ...DEFAULT_THEME, ...theme };
  const font = FONT_OPTIONS.find((f) => f.id === t.fontId) || FONT_OPTIONS[0];
  const root = document.documentElement;
  root.style.setProperty('--app-font-family', font.stack);
  root.style.setProperty('--app-zoom', String(t.fontScale));
  const gap = t.density === 'compact' ? '0.85' : t.density === 'comfortable' ? '1.15' : '1';
  root.style.setProperty('--app-density', gap);
  root.setAttribute('data-density', t.density);
}
