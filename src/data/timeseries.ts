import type { DataPoint, TimeSeries, SectorBreakdown, TradeBreakdown } from './types';

// ── Utility: seeded pseudo-random for reproducible data ───────────────────────
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 4294967296;
  };
}

function genSeries(
  startYear: number,
  endYear: number,
  freq: 'monthly' | 'quarterly' | 'annual',
  seed: number,
  baseValue: number,
  trend: number,      // per period drift
  volatility: number,
  floor?: number,
  ceiling?: number,
): DataPoint[] {
  const rand = seededRandom(seed);
  const pts: DataPoint[] = [];
  let v = baseValue;
  const periods = freq === 'monthly' ? 12 : freq === 'quarterly' ? 4 : 1;
  for (let y = startYear; y <= endYear; y++) {
    for (let p = 0; p < periods; p++) {
      v = v + trend + (rand() - 0.5) * 2 * volatility;
      if (floor !== undefined) v = Math.max(floor, v);
      if (ceiling !== undefined) v = Math.min(ceiling, v);
      let date: string;
      if (freq === 'monthly') {
        date = `${y}-${String(p + 1).padStart(2, '0')}-01`;
      } else if (freq === 'quarterly') {
        const month = p * 3 + 3;
        date = `${y}-${String(month).padStart(2, '0')}-30`;
      } else {
        date = `${y}-12-31`;
      }
      pts.push({ date, value: Math.round(v * 100) / 100 });
    }
  }
  return pts;
}

// ── GDP Nominal (₦ Trillion, quarterly) ───────────────────────────────────────
const gdpNominal: DataPoint[] = genSeries(2010, 2024, 'quarterly', 1, 18, 0.9, 1.2, 10);

// ── GDP Growth Rate (% YoY, quarterly) ────────────────────────────────────────
const gdpGrowthRaw = genSeries(2010, 2024, 'quarterly', 2, 6.5, -0.02, 1.8, -4, 12);
// Add COVID dip
const gdpGrowth = gdpGrowthRaw.map(p => {
  if (p.date >= '2020-03' && p.date <= '2020-09') return { ...p, value: Math.min(p.value, -3.6) };
  if (p.date >= '2021-03' && p.date <= '2021-09') return { ...p, value: Math.max(p.value, 3.5) };
  return p;
});

// ── GDP Per Capita (USD, annual) ───────────────────────────────────────────────
const gdpPerCapita: DataPoint[] = genSeries(2010, 2024, 'annual', 3, 2250, 5, 180, 1200, 3500);

// ── Inflation Headline (% YoY, monthly) ───────────────────────────────────────
const inflationRaw = genSeries(2010, 2025, 'monthly', 4, 11, 0.08, 1.5, 6, 38);
const inflationHeadline = inflationRaw.map(p => {
  if (p.date >= '2022-06') return { ...p, value: Math.max(20, p.value) };
  if (p.date >= '2023-06') return { ...p, value: Math.max(24, p.value) };
  if (p.date >= '2024-01') return { ...p, value: Math.max(29, Math.min(38, p.value)) };
  return p;
});

// ── Food Inflation (% YoY, monthly) ───────────────────────────────────────────
const inflationFood = inflationHeadline.map(p => ({
  ...p,
  value: Math.round((p.value * 1.08 + seededRandom(5)() * 2) * 100) / 100,
}));

// ── Core Inflation (% YoY, monthly) ───────────────────────────────────────────
const inflationCore = inflationHeadline.map(p => ({
  ...p,
  value: Math.round((p.value * 0.85 - seededRandom(6)() * 1.5) * 100) / 100,
}));

// ── Unemployment (%, quarterly) ───────────────────────────────────────────────
const unemployment: DataPoint[] = genSeries(2010, 2024, 'quarterly', 7, 14, 0.15, 1.5, 9, 34);

// ── FX Official USD/NGN (monthly) ─────────────────────────────────────────────
const fxRaw = genSeries(2010, 2025, 'monthly', 8, 152, 2.8, 8, 140);
const fxUSD = fxRaw.map(p => {
  if (p.date >= '2023-06') return { ...p, value: Math.max(760, p.value + 600) };
  if (p.date >= '2024-01') return { ...p, value: Math.max(1450, p.value + 1000) };
  return p;
});

// ── FX Parallel Rate (monthly) ────────────────────────────────────────────────
const fxParallel = fxUSD.map(p => ({
  ...p,
  value: Math.round((p.value * 1.05 + seededRandom(9)() * 20) * 10) / 10,
}));

// ── MPR (%, monthly) ──────────────────────────────────────────────────────────
const mprData: DataPoint[] = [
  ...genSeries(2010, 2015, 'monthly', 10, 10.5, 0.01, 0.3, 8, 13).map(p => ({ ...p, value: Math.round(p.value * 4) / 4 })),
  ...genSeries(2016, 2021, 'monthly', 11, 13.5, -0.04, 0.1, 11, 14.5).map(p => ({ ...p, value: Math.round(p.value * 4) / 4 })),
  ...genSeries(2022, 2025, 'monthly', 12, 16.5, 0.3, 0.2, 11, 27).map(p => ({ ...p, value: Math.round(p.value * 4) / 4 })),
];

// ── T-Bill 91-day (%, monthly) ────────────────────────────────────────────────
const tBill91 = mprData.map(p => ({
  ...p,
  value: Math.round((p.value - 1.5 + seededRandom(13)() * 2) * 100) / 100,
}));

// ── Exports ($ Billion, quarterly) ────────────────────────────────────────────
const exports_ = genSeries(2010, 2024, 'quarterly', 14, 14, 0.05, 2, 4);

// ── Imports ($ Billion, quarterly) ────────────────────────────────────────────
const imports_ = genSeries(2010, 2024, 'quarterly', 15, 10, 0.1, 1.5, 3);

// ── Trade Balance ($ Billion, quarterly) ──────────────────────────────────────
const tradeBalance = exports_.map((p, i) => ({
  ...p,
  value: Math.round((p.value - imports_[i].value) * 100) / 100,
}));

// ── Govt Revenue (₦ Trillion, quarterly) ──────────────────────────────────────
const govtRevenue = genSeries(2010, 2024, 'quarterly', 16, 1.2, 0.08, 0.3, 0.5);

// ── Govt Expenditure (₦ Trillion, quarterly) ──────────────────────────────────
const govtExpenditure = genSeries(2010, 2024, 'quarterly', 17, 1.6, 0.12, 0.35, 0.8);

// ── Budget Balance (₦ Trillion, annual) ───────────────────────────────────────
const budgetBalance = genSeries(2010, 2024, 'annual', 18, -1.2, -0.15, 0.5, -12, 0.5);

// ── FX Reserves ($ Billion, monthly) ─────────────────────────────────────────
const fxReservesRaw = genSeries(2010, 2025, 'monthly', 19, 36, -0.05, 2, 25, 48);
const fxReserves = fxReservesRaw.map(p => {
  if (p.date >= '2020-03' && p.date <= '2021-06') return { ...p, value: Math.max(33, p.value) };
  return p;
});

// ── External Debt ($ Billion, quarterly) ─────────────────────────────────────
const externalDebt = genSeries(2010, 2024, 'quarterly', 20, 6, 0.6, 0.8, 5, 45);

// ── Oil Production (mbpd, monthly) ───────────────────────────────────────────
const oilProductionRaw = genSeries(2010, 2025, 'monthly', 21, 2.1, -0.003, 0.08, 1.2, 2.4);
const oilProduction = oilProductionRaw.map(p => {
  if (p.date >= '2016-01' && p.date <= '2017-06') return { ...p, value: Math.min(1.6, p.value) };
  if (p.date >= '2021-01' && p.date <= '2023-06') return { ...p, value: Math.min(1.5, p.value) };
  return p;
});

// ── Oil Price Brent ($/bbl, monthly) ─────────────────────────────────────────
const oilPriceRaw = genSeries(2010, 2025, 'monthly', 22, 90, -0.05, 8, 25);
const oilPrice = oilPriceRaw.map(p => {
  if (p.date >= '2014-07' && p.date <= '2016-03') return { ...p, value: Math.min(50, Math.max(28, p.value - 40)) };
  if (p.date >= '2020-03' && p.date <= '2020-05') return { ...p, value: Math.min(40, Math.max(20, p.value - 60)) };
  if (p.date >= '2022-03' && p.date <= '2022-09') return { ...p, value: Math.max(100, p.value + 30) };
  return p;
});

// ── NGX All-Share Index (points, monthly) ────────────────────────────────────
const ngxIndex = genSeries(2010, 2025, 'monthly', 23, 25000, 200, 2500, 18000, 112000);

// ── NGX Market Cap (₦ Trillion, monthly) ─────────────────────────────────────
const marketCap = ngxIndex.map(p => ({
  ...p,
  value: Math.round((p.value * 0.00155 + seededRandom(24)() * 2) * 100) / 100,
}));

// ── Assemble all time series ──────────────────────────────────────────────────
export const ALL_TIMESERIES: TimeSeries[] = [
  { indicatorId: 'gdp_nominal', data: gdpNominal },
  { indicatorId: 'gdp_growth', data: gdpGrowth },
  { indicatorId: 'gdp_per_capita', data: gdpPerCapita },
  { indicatorId: 'inflation_headline', data: inflationHeadline },
  { indicatorId: 'inflation_food', data: inflationFood },
  { indicatorId: 'inflation_core', data: inflationCore },
  { indicatorId: 'unemployment', data: unemployment },
  { indicatorId: 'fx_usd', data: fxUSD },
  { indicatorId: 'fx_parallel', data: fxParallel },
  { indicatorId: 'mpr', data: mprData },
  { indicatorId: 't_bill_91', data: tBill91 },
  { indicatorId: 'exports', data: exports_ },
  { indicatorId: 'imports', data: imports_ },
  { indicatorId: 'trade_balance', data: tradeBalance },
  { indicatorId: 'govt_revenue', data: govtRevenue },
  { indicatorId: 'govt_expenditure', data: govtExpenditure },
  { indicatorId: 'budget_balance', data: budgetBalance },
  { indicatorId: 'fx_reserves', data: fxReserves },
  { indicatorId: 'external_debt', data: externalDebt },
  { indicatorId: 'oil_production', data: oilProduction },
  { indicatorId: 'oil_price', data: oilPrice },
  { indicatorId: 'ngx_index', data: ngxIndex },
  { indicatorId: 'market_cap', data: marketCap },
];

export const TS_MAP = Object.fromEntries(ALL_TIMESERIES.map(ts => [ts.indicatorId, ts.data]));

// ── GDP Sector Breakdown (quarterly) ─────────────────────────────────────────
export const GDP_SECTORS: SectorBreakdown[] = (() => {
  const rand = seededRandom(99);
  const result: SectorBreakdown[] = [];
  for (let y = 2019; y <= 2024; y++) {
    for (let q = 1; q <= 4; q++) {
      const base = 20 + y - 2019;
      result.push({
        period: `${y}-Q${q}`,
        agriculture: Math.round((base * 0.25 + (rand() - 0.5) * 2) * 100) / 100,
        industry:    Math.round((base * 0.22 + (rand() - 0.5) * 2) * 100) / 100,
        services:    Math.round((base * 0.46 + (rand() - 0.5) * 3) * 100) / 100,
        oil:         Math.round((base * 0.07 + (rand() - 0.5) * 0.5) * 100) / 100,
      });
    }
  }
  return result;
})();

// ── Trade Breakdown (quarterly) ───────────────────────────────────────────────
export const TRADE_BREAKDOWN: TradeBreakdown[] = (() => {
  const rand = seededRandom(100);
  const result: TradeBreakdown[] = [];
  for (let y = 2019; y <= 2024; y++) {
    for (let q = 1; q <= 4; q++) {
      result.push({
        period: `${y}-Q${q}`,
        oilExports:    Math.round((12 + (rand() - 0.5) * 3) * 100) / 100,
        nonOilExports: Math.round((2.5 + (rand() - 0.5) * 0.8) * 100) / 100,
        imports:       Math.round((10 + (rand() - 0.5) * 2) * 100) / 100,
      });
    }
  }
  return result;
})();
