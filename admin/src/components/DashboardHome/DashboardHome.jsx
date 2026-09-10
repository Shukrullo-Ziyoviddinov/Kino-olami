import { useEffect, useState } from 'react';
import StatCard from './StatCard';
import ScrollTouch from '../ScrollTouch/ScrollTouch';
import { fetchDashboardCounts } from '../../services/statisticsApi';
import './DashboardHome.css';

const STAT_ITEMS = [
  { variant: 'movies', label: 'Kinolar', key: 'movies' },
  { variant: 'actors', label: 'Aktyorlar', key: 'actors' },
  { variant: 'banners', label: 'Bannerlar', key: 'banners' },
  { variant: 'ads', label: 'Reklamalar', key: 'ads' },
  { variant: 'genres', label: 'Janrlar', key: 'genres' },
  { variant: 'trillers', label: 'Trillerlar', key: 'trillers' },
];

function formatCount(value) {
  return new Intl.NumberFormat('uz-UZ').format(Number(value) || 0);
}

export default function DashboardHome() {
  const [counts, setCounts] = useState({
    movies: 0,
    actors: 0,
    banners: 0,
    ads: 0,
    genres: 0,
    trillers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchDashboardCounts();
        if (cancelled) return;
        setCounts({
          movies: Number(data.movies) || 0,
          actors: Number(data.actors) || 0,
          banners: Number(data.banners) || 0,
          ads: Number(data.ads) || 0,
          genres: Number(data.genres) || 0,
          trillers: Number(data.trillers) || 0,
        });
      } catch (err) {
        if (cancelled) return;
        setError(err?.message || "Sonlarni olishda xatolik.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="dashboard-home">
      {error ? <p className="dashboard-home__error">{error}</p> : null}
      <ScrollTouch className="dashboard-home__stats" role="list">
        {STAT_ITEMS.map((item) => (
          <div key={item.variant} className="dashboard-home__stat-wrap" role="listitem">
            <StatCard
              variant={item.variant}
              label={item.label}
              value={loading ? '…' : formatCount(counts[item.key])}
            />
          </div>
        ))}
      </ScrollTouch>
    </div>
  );
}
