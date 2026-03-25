# QA & Acceptance Checklist

## Data Accuracy
- [ ] All 27 indicators present with data
- [ ] GDP values in correct range (NGN Trillions)
- [ ] CPI values match NBS published figures within 0.5% tolerance
- [ ] Exchange rates reflect known historical movements (e.g., Jun 2023 unification)
- [ ] MPR values match CBN published decisions
- [ ] Foreign reserves in correct range (USD Billions)
- [ ] Oil production in realistic range (1.0-2.0 mbpd)

## Dashboard Functionality
- [ ] KPI row displays 9 cards with correct values and sparklines
- [ ] Clicking KPI card selects it and updates main chart
- [ ] Double-clicking KPI card opens drilldown modal
- [ ] Main chart renders with correct data for selected indicator
- [ ] Moving average toggle works
- [ ] Event annotations toggle works and shows policy events on chart
- [ ] Date range filter (1Y, 2Y, 5Y, 10Y, All, Custom) works
- [ ] Category filter narrows indicator dropdown
- [ ] Indicator dropdown changes selected indicator

## Time Series Tab
- [ ] All 8 chart panels render correctly
- [ ] GDP chart shows bar chart with positive/negative coloring
- [ ] Inflation chart shows 3 lines (headline, core, food)
- [ ] FX chart shows official and parallel rates
- [ ] Interest rates chart shows MPR and T-bill yields
- [ ] Trade chart shows stacked bars + balance line
- [ ] External chart shows reserves and debt on dual axis
- [ ] Oil chart shows production and price on dual axis
- [ ] NGX chart shows index with area fill

## Comparison Tab
- [ ] Both indicator dropdowns populate correctly
- [ ] Chart updates when indicators change
- [ ] Normalize (Index to 100) toggle works
- [ ] Dual Y-axis displays when not normalized

## Correlation Tab
- [ ] Scatter plot renders with data points
- [ ] Regression line displays
- [ ] R-squared, slope, and sample size shown
- [ ] Axes labeled with indicator names and units

## Data Table Tab
- [ ] Table shows date, value, change, % change columns
- [ ] Column sorting works (click headers)
- [ ] Values formatted correctly
- [ ] Positive/negative changes color-coded

## Events Tab
- [ ] All major events listed in reverse chronological order
- [ ] Each event shows date, title, description, tags

## Export
- [ ] CSV download (single indicator) produces valid file
- [ ] Excel download (single indicator) produces valid .xlsx
- [ ] CSV download (all data) includes all indicators
- [ ] Excel download (all data) creates multi-sheet workbook
- [ ] Chart PNG export captures current chart

## Drilldown Modal
- [ ] Opens on double-click of KPI card
- [ ] Shows summary statistics (current, high, low, avg)
- [ ] Threshold configuration works (set/clear)
- [ ] Drilldown chart renders
- [ ] Recent data table shows last 50 values
- [ ] Download buttons work from modal
- [ ] Modal closes on X, overlay click, or Escape key

## Threshold Alerts
- [ ] KPI card shows red left border when threshold exceeded
- [ ] Threshold persists during session
- [ ] Clear threshold removes alert styling

## Themes
- [ ] Light theme renders correctly
- [ ] Dark theme renders correctly (all text readable)
- [ ] High contrast mode renders correctly
- [ ] Charts re-render with appropriate colors on theme switch

## Responsive Design
- [ ] Desktop (1440px+): full grid layout, all features visible
- [ ] Tablet (768-1024px): charts stack to single column
- [ ] Mobile (< 768px): KPI cards 2-column, filters stack vertically
- [ ] Touch interactions work on mobile (chart zoom/pan)

## Accessibility
- [ ] Skip-to-content link works
- [ ] All interactive elements keyboard-focusable
- [ ] Tab order is logical
- [ ] ARIA labels on charts, tables, KPI cards
- [ ] Color is not sole indicator of meaning
- [ ] Focus indicators visible

## Performance
- [ ] Initial page load < 3s on broadband
- [ ] Chart render < 1s for monthly/quarterly data
- [ ] Daily data charts (FX, oil, NGX) render smoothly with downsampling
- [ ] No jank on filter changes
- [ ] No memory leaks on repeated tab switching

## Browser Compatibility
- [ ] Chrome 90+ (desktop & mobile)
- [ ] Firefox 88+
- [ ] Safari 14+ (desktop & iOS)
- [ ] Edge 90+

## ETL Pipeline
- [ ] `python etl/pipeline.py --all` runs without error
- [ ] World Bank API returns data for available indicators
- [ ] Provenance log created in data/provenance.jsonl
- [ ] `python etl/pipeline.py --validate` passes
- [ ] Incremental updates merge correctly (no duplicates)
