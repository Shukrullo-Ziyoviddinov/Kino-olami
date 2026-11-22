import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate, useNavigationType, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SearchModalResults from '../SearchModalResults/SearchModalResults';
import './EmbedLayout.css';

export default function EmbedLayout() {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const isRussian = i18n.resolvedLanguage === 'ru';
  const isHome = pathname === '/';

  useEffect(() => {
    if (navigationType === 'PUSH') window.scrollTo(0, 0);
  }, [pathname, navigationType]);

  const updateQuery = (value) => {
    const nextParams = new URLSearchParams(params);
    if (value) nextParams.set('q', value);
    else nextParams.delete('q');
    setParams(nextParams, { replace: true });
  };

  return (
    <header className="embed-catalog-header">
      <nav className="embed-catalog-controls" aria-label={isRussian ? 'Каталог' : 'Katalog'}>
        {!isHome && window.history.state?.idx > 0 && (
          <button type="button" onClick={() => navigate(-1)}>
            {isRussian ? 'Назад' : 'Orqaga'}
          </button>
        )}
        <Link to="/">{isRussian ? 'Каталог' : 'Katalog'}</Link>
        <Link to="/recommended">{isRussian ? 'Фильтры' : 'Filtrlar'}</Link>
      </nav>
      {isHome && (
        <>
          <input
            type="search"
            aria-label={t('navbar.search')}
            placeholder={t('navbar.search')}
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
          />
          {query.trim() && <SearchModalResults query={query.trim()} />}
        </>
      )}
    </header>
  );
}
