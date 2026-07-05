export interface LangOption {
  code: string;
  label: string;
  flagCode: string;
}

export const LANGUAGES: LangOption[] = [
  { code: 'vi', label: 'Tiếng Việt', flagCode: 'vn' },
  { code: 'en', label: 'English',    flagCode: 'gb' },
];

const BASE_LANG = 'vi';
export const LANG_KEY = 'myiu_lang';

export function getSavedLang(): string {
  return localStorage.getItem(LANG_KEY) ?? BASE_LANG;
}

function setCookie(value: string) {
  document.cookie = `googtrans=${value}; path=/`;
  document.cookie = `googtrans=${value}; path=/; domain=${window.location.hostname}`;
}

function clearCookies() {
  const past = new Date(0).toUTCString();
  document.cookie = `googtrans=; expires=${past}; path=/`;
  document.cookie = `googtrans=; expires=${past}; path=/; domain=${window.location.hostname}`;
  document.cookie = `googtrans=; expires=${past}; path=/; domain=.${window.location.hostname}`;
}

export function changeLanguage(lang: string): void {
  localStorage.setItem(LANG_KEY, lang);

  if (lang === BASE_LANG) {
    clearCookies();
    window.location.reload();
    return;
  }

  // Try using the widget select (no reload needed)
  const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
  if (select) {
    select.value = lang;
    select.dispatchEvent(new Event('change'));
    return;
  }

  // Widget not ready yet — set cookie and reload
  setCookie(`/${BASE_LANG}/${lang}`);
  window.location.reload();
}
