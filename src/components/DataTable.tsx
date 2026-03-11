import { useState } from 'react';
import { Download, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { INDICATOR_MAP } from '../data/indicators';
import type { DataPoint } from '../data/types';
import { filterByDateRange, downloadCSV } from '../utils/dataHelpers';
import { fmtNumber, fmtDate } from '../utils/format';

interface DataTableProps {
  indicatorIds: string[];
  seriesMap: Record<string, DataPoint[]>;
  dateFrom: string;
  dateTo: string;
}

type SortKey = 'date' | string;
type SortDir = 'asc' | 'desc';

function SortIcon({ k, sortKey, sortDir }: { k: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  return sortKey !== k ? <ArrowUpDown size={11} className="text-slate-400" /> :
    sortDir === 'asc' ? <ArrowUp size={11} className="text-brand-500" /> :
    <ArrowDown size={11} className="text-brand-500" />;
}

export default function DataTable({ indicatorIds, seriesMap, dateFrom, dateTo }: DataTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);
  const [filterText, setFilterText] = useState('');
  const PAGE_SIZE = 20;

  // Flatten: one row per (indicator, date) point
  const allRows: { indicatorId: string; date: string; value: number }[] = [];
  for (const id of indicatorIds) {
    const filtered = filterByDateRange(seriesMap[id] ?? [], dateFrom, dateTo);
    for (const pt of filtered) {
      allRows.push({ indicatorId: id, date: pt.date, value: pt.value });
    }
  }

  const filtered = allRows.filter(r => {
    if (!filterText) return true;
    const ind = INDICATOR_MAP[r.indicatorId];
    return (
      ind?.name.toLowerCase().includes(filterText.toLowerCase()) ||
      r.date.includes(filterText)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'date') cmp = a.date.localeCompare(b.date);
    else if (sortKey === 'value') cmp = a.value - b.value;
    else if (sortKey === 'indicator') cmp = a.indicatorId.localeCompare(b.indicatorId);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageRows = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(0);
  };

  const handleDownload = () => {
    const headers = ['Indicator', 'Category', 'Date', 'Value', 'Unit', 'Source'];
    const rows = sorted.map(r => {
      const ind = INDICATOR_MAP[r.indicatorId];
      return [ind?.name || r.indicatorId, ind?.category || '', r.date, r.value, ind?.unit || '', ind?.source || ''];
    });
    downloadCSV(headers, rows, `nigeria_economic_data_${dateFrom}_${dateTo}.csv`);
  };

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          placeholder="Filter by indicator or date…"
          value={filterText}
          onChange={e => { setFilterText(e.target.value); setPage(0); }}
          className="text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500 w-64"
          aria-label="Filter table data"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {sorted.length.toLocaleString()} records
          </span>
          <button onClick={handleDownload} className="btn-primary text-xs gap-1.5">
            <Download size={13} />
            Download CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm" role="grid" aria-label="Economic data table">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <th className="px-3 py-2.5 text-left">
                <button
                  onClick={() => handleSort('indicator')}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide hover:text-slate-900 dark:hover:text-slate-200"
                >
                  Indicator <SortIcon k="indicator" sortKey={sortKey} sortDir={sortDir} />
                </button>
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Category
              </th>
              <th className="px-3 py-2.5 text-left">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide hover:text-slate-900 dark:hover:text-slate-200"
                >
                  Date <SortIcon k="date" sortKey={sortKey} sortDir={sortDir} />
                </button>
              </th>
              <th className="px-3 py-2.5 text-right">
                <button
                  onClick={() => handleSort('value')}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide hover:text-slate-900 dark:hover:text-slate-200 ml-auto"
                >
                  Value <SortIcon k="value" sortKey={sortKey} sortDir={sortDir} />
                </button>
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Unit
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Source
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {pageRows.map((row, i) => {
              const ind = INDICATOR_MAP[row.indicatorId];
              return (
                <tr
                  key={i}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  tabIndex={0}
                >
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        style={{ backgroundColor: ind?.color ?? '#888' }}
                        className="w-1.5 h-4 rounded-full shrink-0"
                      />
                      <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[180px]">
                        {ind?.name || row.indicatorId}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate-500 dark:text-slate-400 text-xs">
                    {ind?.category}
                  </td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300 font-mono text-xs tabular-nums">
                    {fmtDate(row.date)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                    {fmtNumber(row.value)}
                  </td>
                  <td className="px-3 py-2 text-slate-500 dark:text-slate-400 text-xs">
                    {ind?.unit}
                  </td>
                  <td className="px-3 py-2 text-slate-500 dark:text-slate-400 text-xs">
                    <a
                      href={ind?.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-brand-500 underline underline-offset-2 truncate"
                    >
                      {ind?.source}
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {pageRows.length === 0 && (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-sm">
            No data found for the current filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="btn-outline text-xs disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="btn-outline text-xs disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
