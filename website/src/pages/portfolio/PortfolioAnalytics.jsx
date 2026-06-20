import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartWrapper, CustomTooltip } from '../../components/analytics/ChartComponents';
import { getApiBase } from '../../utils/runtimeConfig';
import { ApiError } from '../../utils/apiClient.js';

const RANGE_OPTIONS = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

export default function PortfolioAnalytics({ username }) {
  const [passkey, setPasskey] = useState('');
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unlocked, setUnlocked] = useState(false);

  async function fetchStats(currentDays = days) {
    setIsLoading(true);
    setError(null);
    try {
      const base = getApiBase();
      const url = `${base}/api/portfolio/${username}/analytics?passkey=${encodeURIComponent(passkey)}&days=${currentDays}`;
      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      const data = await res.json();
      setStats(data);
      setUnlocked(true);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
      setUnlocked(false);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!passkey) return;
    fetchStats(days);
  }

  function handleRangeChange(value) {
    setDays(value);
    if (unlocked) fetchStats(value);
  }

  if (!unlocked) {
    return (
      <div style={{ maxWidth: 420, margin: '60px auto', padding: '0 24px' }}>
        <h1 style={{ marginBottom: 8 }}>Portfolio Analytics</h1>
        <p style={{ color: 'var(--t2)', marginBottom: 24 }}>
          Enter the passkey for <strong>@{username}</strong> to view its analytics.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="password"
            placeholder="Passkey"
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            className="form-input"
          />
          <button type="submit" className="btn btn-primary" disabled={isLoading || !passkey}>
            {isLoading ? 'Checking...' : 'View Analytics'}
          </button>
          {error && <p style={{ color: '#ee4444', fontSize: '0.9rem' }}>{error}</p>}
        </form>
      </div>
    );
  }

  const trendData = (stats?.trend || []).map((point) => ({
    name: new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    views: point.views,
    uniqueViews: point.uniqueViews,
  }));

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 24px' }}>
      <h1 style={{ marginBottom: 24 }}>Analytics for @{username}</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleRangeChange(opt.value)}
            className={`btn ${days === opt.value ? 'btn-primary' : 'btn-outline'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div className="portfolio-panel" style={{ padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats?.totalViews ?? 0}</div>
          <div style={{ color: 'var(--t2)' }}>Total Views</div>
        </div>
        <div className="portfolio-panel" style={{ padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats?.uniqueViews ?? 0}</div>
          <div style={{ color: 'var(--t2)' }}>Unique Visitors</div>
        </div>
      </div>

      <ChartWrapper
        title="View Trend"
        subtitle={`Page views over the last ${days} days`}
        loading={isLoading}
        height={350}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-color, rgba(255,255,255,0.08))"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="var(--text-muted, #888)"
              tick={{ fill: 'var(--text-secondary, #888)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--text-muted, #888)"
              tick={{ fill: 'var(--text-secondary, #888)' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line
              type="monotone"
              dataKey="views"
              name="Total Views"
              stroke="#60a5fa"
              strokeWidth={3}
              dot={{ r: 4, fill: '#111', strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1000}
            />
            <Line
              type="monotone"
              dataKey="uniqueViews"
              name="Unique Visitors"
              stroke="#4ade80"
              strokeWidth={3}
              dot={{ r: 4, fill: '#111', strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </div>
  );
}
