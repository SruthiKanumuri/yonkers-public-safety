/**
 * Yonkers Crime Reporting App — Backend API
 * Node.js + Express REST API serving dynamic dashboard data
 * Run: node server.js (port 3001)
 */

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────
// In-memory "database" (replace with real DB)
// ─────────────────────────────────────────────
const CATEGORIES = ['Theft', 'Suspicious Activity', 'Vandalism', 'Vehicle Break-in', 'Noise/Disturbance', 'Assault', 'Trespassing', 'Other'];
const PRECINCTS  = ['All', 'Getty Square', 'Park Hill', 'Nodine Hill', 'Waterfront', 'McLean Ave', 'Yonkers Ave'];
const CHANNELS   = ['Mobile', 'Web', 'Kiosk', 'Call Center'];
const PRIORITIES = ['Critical', 'High', 'Normal', 'Low'];
const STATUSES   = ['Needs Review', 'Assigned', 'Evidence Review', 'Pending', 'Resolved', 'Closed'];
const TEAMS      = ['Patrol Desk', 'Field Unit A', 'Field Unit B', 'Investigations', 'Queue', 'Special Ops'];

let reportIdCounter = 2000;

// Generate a random report entry
function makeReport() {
  reportIdCounter++;
  const priority = PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)];
  const slaMinutes = priority === 'Critical' ? Math.floor(Math.random() * 30) + 5
                   : priority === 'High'     ? Math.floor(Math.random() * 60) + 20
                   : priority === 'Normal'   ? Math.floor(Math.random() * 120) + 30
                   : Math.floor(Math.random() * 240) + 60;
  return {
    id: `YR-2026-${reportIdCounter}`,
    category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
    location: PRECINCTS.slice(1)[Math.floor(Math.random() * (PRECINCTS.length - 1))],
    priority,
    status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
    team: TEAMS[Math.floor(Math.random() * TEAMS.length)],
    slaMinutes,
    channel: CHANNELS[Math.floor(Math.random() * CHANNELS.length)],
    anonymous: Math.random() < 0.32,
    timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    lat: 40.93 + (Math.random() - 0.5) * 0.08,
    lng: -73.89 + (Math.random() - 0.5) * 0.08,
  };
}

// Seed initial reports
const reports = Array.from({ length: 300 }, makeReport);

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function filterReports(query) {
  const { precinct, channel, priority, days } = query;
  const cutoff = new Date(Date.now() - (parseInt(days) || 30) * 24 * 60 * 60 * 1000);
  return reports.filter(r => {
    if (precinct && precinct !== 'All' && r.location !== precinct) return false;
    if (channel  && channel  !== 'All' && r.channel  !== channel)  return false;
    if (priority && priority !== 'All' && r.priority !== priority) return false;
    if (new Date(r.timestamp) < cutoff) return false;
    return true;
  });
}

function formatSLA(minutes) {
  if (minutes < 0)  return 'Overdue';
  if (minutes < 60) return `${minutes}m left`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m left`;
}

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────

// GET /api/kpis — KPI summary cards
app.get('/api/kpis', (req, res) => {
  const data = filterReports(req.query);
  const prev = reports.filter(r => {
    const days = parseInt(req.query.days) || 30;
    const cutoff    = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const prevStart = new Date(Date.now() - days * 2 * 24 * 60 * 60 * 1000);
    const d = new Date(r.timestamp);
    return d >= prevStart && d < cutoff;
  });

  const total         = data.length;
  const prevTotal     = prev.length || 1;
  const highPrio      = data.filter(r => r.priority === 'Critical' || r.priority === 'High').length;
  const prevHigh      = prev.filter(r => r.priority === 'Critical' || r.priority === 'High').length || 1;
  const resolved      = data.filter(r => r.status === 'Resolved' || r.status === 'Closed').length;
  const backlog       = data.filter(r => r.status === 'Needs Review' || r.status === 'Pending').length;
  const duplicates    = Math.round(total * 0.047);
  const anonymous     = data.filter(r => r.anonymous).length;
  const avgResponse   = 11 - Math.floor(Math.random() * 3);
  const satisfaction  = (4.1 + Math.random() * 0.5).toFixed(1);
  const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;

  res.json([
    { id: 1, label: 'Total Reports Submitted',       value: total.toLocaleString(),    trend: `▲ ${Math.round(((total - prevTotal) / prevTotal) * 100)}% vs prior period`, dir: 'up' },
    { id: 2, label: 'High Priority Reports',         value: highPrio.toString(),        trend: prevHigh > highPrio ? `▼ ${Math.round(((prevHigh - highPrio) / prevHigh) * 100)}% fewer escalations` : `▲ ${Math.round(((highPrio - prevHigh) / prevHigh) * 100)}% more escalations`, dir: highPrio <= prevHigh ? 'down' : 'up' },
    { id: 3, label: 'Avg First Response Time',       value: `${avgResponse}m`,          trend: '▲ 22% faster', dir: 'up' },
    { id: 4, label: 'Case Resolution Rate',          value: `${resolutionRate}%`,       trend: '▲ 5 pts', dir: 'up' },
    { id: 5, label: 'Queue Backlog',                 value: backlog.toString(),         trend: '● Watch threshold', dir: 'flat' },
    { id: 6, label: 'Duplicate / Spam Flag Rate',    value: `${((duplicates / Math.max(total,1)) * 100).toFixed(1)}%`, trend: '▼ 1.2 pts', dir: 'down' },
    { id: 7, label: 'Anonymous Tip Share',           value: `${Math.round((anonymous / Math.max(total,1)) * 100)}%`, trend: '▲ 3 pts', dir: 'up' },
    { id: 8, label: 'Citizen Satisfaction Score',    value: `${satisfaction}/5`,        trend: '▲ 0.4 rating', dir: 'up' },
  ]);
});

// GET /api/trend — Daily report volume (last N days)
app.get('/api/trend', (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const data = filterReports(req.query);
  const buckets = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    buckets[d.toISOString().slice(0, 10)] = 0;
  }
  data.forEach(r => {
    const key = r.timestamp.slice(0, 10);
    if (key in buckets) buckets[key]++;
  });
  res.json(Object.entries(buckets).map(([date, count]) => ({ date, count })));
});

// GET /api/categories — Donut data
app.get('/api/categories', (req, res) => {
  const data = filterReports(req.query);
  const counts = {};
  CATEGORIES.forEach(c => { counts[c] = 0; });
  data.forEach(r => { counts[r.category] = (counts[r.category] || 0) + 1; });
  res.json(Object.entries(counts).map(([name, value]) => ({ name, value })));
});

// GET /api/priorities — Bar chart
app.get('/api/priorities', (req, res) => {
  const data = filterReports(req.query);
  const counts = { Critical: 0, High: 0, Normal: 0, Low: 0 };
  data.forEach(r => { counts[r.priority]++; });
  const max = Math.max(...Object.values(counts)) || 1;
  res.json(PRIORITIES.map(p => ({ name: p, count: counts[p], pct: Math.round((counts[p] / max) * 100) })));
});

// GET /api/heatmap — Hour-of-day by day-of-week
app.get('/api/heatmap', (req, res) => {
  const data = filterReports(req.query);
  const days  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const hours = [0, 3, 6, 9, 12, 15, 18, 21];
  const grid  = {};
  days.forEach(d  => hours.forEach(h => { grid[`${d}-${h}`] = 0; }));
  data.forEach(r => {
    const dt = new Date(r.timestamp);
    const dname = days[dt.getDay() === 0 ? 6 : dt.getDay() - 1];
    const hBucket = hours.reduce((a, b) => Math.abs(b - dt.getHours()) < Math.abs(a - dt.getHours()) ? b : a);
    const key = `${dname}-${hBucket}`;
    if (key in grid) grid[key]++;
  });
  const max = Math.max(...Object.values(grid)) || 1;
  res.json({ days, hours, grid, max });
});

// GET /api/funnel — Intake to resolution
app.get('/api/funnel', (req, res) => {
  const data = filterReports(req.query);
  const total      = data.length;
  const validated  = data.filter(r => r.status !== 'Needs Review').length;
  const assigned   = data.filter(r => !['Needs Review','Pending'].includes(r.status)).length;
  const resolved   = data.filter(r => ['Resolved','Closed'].includes(r.status)).length;
  res.json([
    { stage: 'Submitted',  count: total,     pct: 100 },
    { stage: 'Validated',  count: validated, pct: total ? Math.round((validated / total) * 100) : 0 },
    { stage: 'Assigned',   count: assigned,  pct: total ? Math.round((assigned  / total) * 100) : 0 },
    { stage: 'Resolved',   count: resolved,  pct: total ? Math.round((resolved  / total) * 100) : 0 },
  ]);
});

// GET /api/channels — Weekly channel bar chart
app.get('/api/channels', (req, res) => {
  const data = filterReports(req.query);
  const counts = { Mobile: 0, Web: 0, Kiosk: 0, 'Call Center': 0 };
  data.forEach(r => { counts[r.channel] = (counts[r.channel] || 0) + 1; });
  const max = Math.max(...Object.values(counts)) || 1;
  res.json(CHANNELS.map(c => ({ name: c, count: counts[c], pct: Math.round((counts[c] / max) * 100) })));
});

// GET /api/sla — SLA compliance gauge
app.get('/api/sla', (req, res) => {
  const data = filterReports(req.query).filter(r => ['Critical','High'].includes(r.priority));
  const target  = { Critical: 30, High: 60 };
  const onTime  = data.filter(r => r.slaMinutes >= 0 && r.slaMinutes <= target[r.priority]).length;
  const compliance = data.length ? Math.round((onTime / data.length) * 100) : 84;
  res.json({ compliance, total: data.length, onTime });
});

// GET /api/queue — High priority queue table
app.get('/api/queue', (req, res) => {
  const data = filterReports(req.query)
    .filter(r => r.priority === 'Critical' || r.priority === 'High')
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 20)
    .map(r => ({ ...r, slaFormatted: formatSLA(r.slaMinutes) }));
  res.json(data);
});

// GET /api/hotspots — Map pins
app.get('/api/hotspots', (req, res) => {
  const data = filterReports(req.query);
  const zones = {};
  data.forEach(r => {
    const key = r.location;
    if (!zones[key]) zones[key] = { location: key, count: 0, lat: r.lat, lng: r.lng };
    zones[key].count++;
  });
  res.json(Object.values(zones).sort((a,b) => b.count - a.count).slice(0, 8));
});

// POST /api/reports — Submit new report
app.post('/api/reports', (req, res) => {
  const { category, location, priority, channel, description, anonymous } = req.body;
  if (!category || !location) return res.status(400).json({ error: 'category and location are required' });
  const newReport = { ...makeReport(), category, location, priority: priority || 'Normal', channel: channel || 'Web', anonymous: !!anonymous, description, status: 'Needs Review', timestamp: new Date().toISOString() };
  reports.unshift(newReport);
  res.status(201).json(newReport);
});

// PATCH /api/queue/:id — Update report status/team
app.patch('/api/queue/:id', (req, res) => {
  const report = reports.find(r => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  const { status, team } = req.body;
  if (status) report.status = status;
  if (team)   report.team   = team;
  res.json(report);
});

// GET /api/meta — Dropdown options
app.get('/api/meta', (req, res) => {
  res.json({ precincts: PRECINCTS, channels: ['All', ...CHANNELS], priorities: ['All', ...PRIORITIES], statuses: STATUSES, teams: TEAMS, categories: CATEGORIES });
});

app.listen(PORT, () => console.log(`✅ Yonkers API running → http://localhost:${PORT}`));
