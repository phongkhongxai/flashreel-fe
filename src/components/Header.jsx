import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Languages, LogOut, Search } from 'lucide-react';
import { LANGUAGE_STORAGE_KEY } from '../i18n';
import { useAuth } from '../auth';

export default function Header({ search, onSearch }) {
  const { t, i18n } = useTranslation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  function changeLanguage(event) {
    const nextLanguage = event.target.value;
    i18n.changeLanguage(nextLanguage);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="top">
      <div>
        <h1>{t('app.title')}</h1>
        <div className="lang">{user ? t('auth.signedInAs', { name: user.displayName || user.email }) : t('app.subtitle')}</div>
      </div>
      <div className="tools">
        <label className="searchBox">
          <Search size={17} />
          <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder={t('search.placeholder')} disabled={isLoggingOut} />
        </label>
        <label className="selectBox" aria-label={t('language.label')}>
          <Languages size={17} />
          <select value={i18n.resolvedLanguage || i18n.language} onChange={changeLanguage} disabled={isLoggingOut}>
            <option value="en">{t('language.english')}</option>
            <option value="vi">{t('language.vietnamese')}</option>
            <option value="zh">{t('language.chinese')}</option>
          </select>
        </label>
        <button className="iconBtn" title={isLoggingOut ? t('button.loggingOut') : t('button.logout')} aria-label={isLoggingOut ? t('button.loggingOut') : t('button.logout')} disabled={isLoggingOut} onClick={handleLogout}><LogOut size={18} /></button>
      </div>
    </header>
  );
}
