import { useEffect, useMemo, useState } from "react";
import { fetchStatistics } from "../../services/statisticsApi";
import "./Statistika.css";

function fmt(value) {
  return new Intl.NumberFormat("ru-RU").format(Number(value) || 0);
}

function toPercent(value, total) {
  const v = Number(value) || 0;
  const t = Number(total) || 0;
  if (t <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((v / t) * 100)));
}

function toTrend(current, previous) {
  const c = Number(current) || 0;
  const p = Number(previous) || 0;
  if (p <= 0) return { direction: c > 0 ? "up" : "flat", value: c > 0 ? 100 : 0 };
  const diff = ((c - p) / p) * 100;
  if (Math.abs(diff) < 0.5) return { direction: "flat", value: 0 };
  return {
    direction: diff > 0 ? "up" : "down",
    value: Math.abs(Math.round(diff)),
  };
}

function StatCard({ title, value, tone = "blue", progress = 0, trend = { direction: "flat", value: 0 } }) {
  const ringStyle = { "--progress": `${Math.max(0, Math.min(100, progress))}%` };
  return (
    <div className={`statistika__card statistika__card--${tone}`}>
      <div className="statistika__card-head">
        <p className="statistika__card-title">{title}</p>
        <div className={`statistika__trend statistika__trend--${trend.direction}`}>
          <span>{trend.direction === "up" ? "↗" : trend.direction === "down" ? "↘" : "•"}</span>
          <b>{trend.value}%</b>
        </div>
      </div>

      <div className="statistika__card-body">
        <div className="statistika__ring" style={ringStyle}>
          <div className="statistika__ring-inner">{progress}%</div>
        </div>
        <p className="statistika__card-value">{fmt(value)}</p>
      </div>
    </div>
  );
}

function PeriodRow({ label, data }) {
  return (
    <div className="statistika__period-row">
      <span>{label}</span>
      <strong>{fmt(data)}</strong>
    </div>
  );
}

function StatBlock({
  title,
  subtitle,
  totalUsers,
  totalBeforeThisMonth = 0,
  activeUsers = {},
  visits = {},
  registrations = null,
}) {
  const dayProgress = toPercent(activeUsers.day, totalUsers);
  const weekProgress = toPercent(activeUsers.week, totalUsers);
  const monthProgress = toPercent(activeUsers.month, totalUsers);
  const totalProgress = 100;
  const dayTrend = toTrend(activeUsers.day, Math.round((Number(activeUsers.week) || 0) / 7));
  const weekTrend = toTrend(activeUsers.week, Math.round((Number(activeUsers.month) || 0) / 4));
  const monthTrend = toTrend(activeUsers.month, Math.round((Number(activeUsers.year) || 0) / 12));
  const totalTrend = toTrend(totalUsers, totalBeforeThisMonth);

  return (
    <section className="statistika__block">
      <div className="statistika__block-head">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>

      <div className="statistika__cards">
        <StatCard
          title="Umumiy userlar"
          value={totalUsers}
          tone="purple"
          progress={totalProgress}
          trend={totalTrend}
        />
        <StatCard
          title="Bugungi faol userlar"
          value={activeUsers.day}
          tone="blue"
          progress={dayProgress}
          trend={dayTrend}
        />
        <StatCard
          title="Haftalik faol userlar"
          value={activeUsers.week}
          tone="green"
          progress={weekProgress}
          trend={weekTrend}
        />
        <StatCard
          title="Oylik faol userlar"
          value={activeUsers.month}
          tone="orange"
          progress={monthProgress}
          trend={monthTrend}
        />
      </div>

      <div className="statistika__tables">
        <div className="statistika__table">
          <h4>Tashrif statistikasi</h4>
          <PeriodRow label="1 kunlik" data={visits.day} />
          <PeriodRow label="1 haftalik" data={visits.week} />
          <PeriodRow label="1 oylik" data={visits.month} />
          <PeriodRow label="1 yillik" data={visits.year} />
        </div>

        <div className="statistika__table">
          <h4>Foydalangan userlar</h4>
          <PeriodRow label="1 kunlik" data={activeUsers.day} />
          <PeriodRow label="1 haftalik" data={activeUsers.week} />
          <PeriodRow label="1 oylik" data={activeUsers.month} />
          <PeriodRow label="1 yillik" data={activeUsers.year} />
        </div>

        {registrations ? (
          <div className="statistika__table">
            <h4>Ro'yxatdan o'tganlar</h4>
            <PeriodRow label="1 kunlik" data={registrations.day} />
            <PeriodRow label="1 haftalik" data={registrations.week} />
            <PeriodRow label="1 oylik" data={registrations.month} />
            <PeriodRow label="1 yillik" data={registrations.year} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default function Statistika() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchStatistics();
        setStats(data);
      } catch (e) {
        setError(e.message || "Statistikani yuklashda xatolik.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const bot = useMemo(() => stats?.bot || {}, [stats]);
  const site = useMemo(() => stats?.site || {}, [stats]);

  return (
    <div className="statistika">
      <div className="statistika__header">
        <h2>Statistika</h2>
        <p>Bot va sayt bo'yicha umumiy, davriy tashrif hamda faol userlar hisoboti.</p>
      </div>

      {loading ? <p className="statistika__state">Yuklanmoqda...</p> : null}
      {error ? <p className="statistika__state statistika__state--error">{error}</p> : null}

      {!loading && !error ? (
        <div className="statistika__layout">
          <StatBlock
            title="Bot statistikasi"
            subtitle="Telegram bot foydalanuvchilari bo'yicha ko'rsatkichlar"
            totalUsers={bot.totalUsers}
            totalBeforeThisMonth={bot.totalBeforeThisMonth}
            activeUsers={bot.activeUsers}
            visits={bot.visits}
            registrations={bot.registrations}
          />

          <StatBlock
            title="Sayt statistikasi"
            subtitle="KinoMax web app foydalanuvchilari bo'yicha ko'rsatkichlar"
            totalUsers={site.totalUsers}
            totalBeforeThisMonth={site.totalBeforeThisMonth}
            activeUsers={site.activeUsers}
            visits={site.visits}
            registrations={site.registrations}
          />
        </div>
      ) : null}
    </div>
  );
}
