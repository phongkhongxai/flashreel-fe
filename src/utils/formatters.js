export function formatNumber(value, language) {
  const localeMap = {
    en: 'en-US',
    vi: 'vi-VN',
    zh: 'zh-CN'
  };
  return new Intl.NumberFormat(localeMap[language] || 'en-US').format(value);
}
