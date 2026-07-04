import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTheme } from '@/context/ThemeContext';

const BRAND = '#2563EB';
const VIOLET = '#7C3AED';
const ACCENT = '#06B6D4';
const PALETTE = [BRAND, VIOLET, ACCENT, '#22C55E', '#F59E0B', '#EF4444', '#3b6ef5', '#8b5cf6'];

const useAxis = () => {
  const { isDark } = useTheme();
  return {
    grid: isDark ? '#1e293b' : '#e2e8f0',
    tick: isDark ? '#94a3b8' : '#64748b',
    tooltipBg: isDark ? '#0f172a' : '#ffffff',
    tooltipBorder: isDark ? '#1e293b' : '#e2e8f0',
  };
};

const tooltipStyle = (c) => ({
  contentStyle: {
    background: c.tooltipBg,
    border: `1px solid ${c.tooltipBorder}`,
    borderRadius: 12,
    fontSize: 13,
    color: c.tick,
  },
  labelStyle: { color: c.tick },
  cursor: { fill: 'rgba(37,99,235,0.06)' },
});

export function GrowthAreaChart({ data }) {
  const c = useAxis();
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND} stopOpacity={0.35} />
            <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
        <XAxis dataKey="label" tick={{ fill: c.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: c.tick, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip {...tooltipStyle(c)} />
        <Area type="monotone" dataKey="value" stroke={BRAND} strokeWidth={2.5} fill="url(#growthFill)" name="New users" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ActivityBarChart({ data, color = VIOLET }) {
  const c = useAxis();
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
        <XAxis dataKey="label" tick={{ fill: c.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: c.tick, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip {...tooltipStyle(c)} />
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} name="Count" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TagBarChart({ data }) {
  const c = useAxis();
  const rows = data.map((d) => ({ label: `#${d.tag}`, value: d.count }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 16, left: 10, bottom: 4 }}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis type="category" dataKey="label" width={90} tick={{ fill: c.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle(c)} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
          {rows.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export { PALETTE };
