export const NARRATIVES: Record<string, string> = {
  gdp_nominal: `Nigeria's nominal GDP has grown significantly over the past decade, reaching approximately ₦214 trillion in 2024. Growth has been driven primarily by services — particularly telecoms, finance, and trade — while the oil sector's contribution has declined structurally. The economy recovered from the 2020 COVID recession but faces headwinds from FX volatility, inflation, and infrastructure constraints.`,

  gdp_growth: `Real GDP growth averaged ~6% before the 2016 oil-price shock triggered Nigeria's first recession in 25 years. After a brief recovery, COVID-19 caused another contraction in 2020. The economy has since returned to positive growth (3–4% range), though population growth (~2.4% pa) means per-capita improvement is modest. Non-oil GDP is the primary growth driver.`,

  gdp_per_capita: `Nigeria's GDP per capita has stagnated in dollar terms due to Naira depreciation, hovering around $1,700–$2,100 before falling sharply post-2023 devaluation. In PPP terms, living standards are higher but the country's large, fast-growing population (220M+) limits per-capita gains. Poverty remains widespread with ~40% below the national poverty line.`,

  inflation_headline: `Nigeria's headline inflation reached 34.8% in December 2023 — a near three-decade high — driven by: the removal of fuel subsidies (May 2023), Naira devaluation (~60% in June 2023), elevated food prices, and energy costs. The CBN responded with aggressive rate hikes, bringing the MPR to 27.25% by late 2024. NBS rebased the CPI in January 2025, showing lower reported figures.`,

  inflation_food: `Food inflation has consistently outpaced headline CPI, reflecting Nigeria's high food import dependency, poor rural infrastructure, and insecurity disrupting farming in key agricultural states. Food CPI rose above 40% YoY in 2024. Rising fertiliser costs and supply chain disruptions post-subsidy removal compounded the pressure.`,

  inflation_core: `Core inflation (excluding food and energy) tracks underlying demand pressures. It has risen sharply since 2022 driven by Naira weakness (import cost pass-through), rising energy costs for businesses, and fiscal expansion. Core inflation typically lags headline by 2–4 months and has been slower to decelerate.`,

  unemployment: `Nigeria's unemployment rate, as measured by NBS, has been volatile — partly due to definitional changes in 2020 that initially showed a spike to ~33%. Under the revised methodology aligned with ILO standards, the rate stands around 5% by strict definition, but underemployment and informality remain pervasive concerns. Youth unemployment is significantly higher.`,

  fx_usd: `The NGN/USD official rate has depreciated dramatically: from ~₦152/$ in 2010 to over ₦1,500/$ by early 2024. Key devaluation episodes: 2016 managed float (₦197→₦283), 2020 COVID devaluation (₦307→₦380), and the June 2023 unification when the CBN floated the Naira (~₦760+). Continued depreciation reflects structural current account pressures and capital flight.`,

  fx_parallel: `The parallel (black market) rate has historically traded at a premium to the official rate — a reflection of FX scarcity and restricted access. At the height of FX restrictions (2016–2022), the premium exceeded 60%. Post-June 2023 unification, the gap narrowed significantly but re-emerged as official supply tightened. The parallel rate serves as a signal of FX market stress.`,

  mpr: `The CBN's Monetary Policy Rate has been a key tool in managing the inflation-growth trade-off. After cutting to 11.5% during COVID to support growth, the CBN launched an aggressive hiking cycle from May 2022, raising the MPR to 27.25% by late 2024 — the highest in Nigeria's history — in a bid to anchor the Naira and reduce inflation. The cumulative hike of ~1,575 bps since 2022 has significantly tightened financial conditions.`,

  t_bill_91: `91-day Treasury Bill yields have closely tracked the MPR, rising sharply alongside the rate hike cycle to above 20% by 2024 — making Nigerian T-Bills among the highest-yielding short-term government securities globally. Elevated yields reflect tight liquidity, high inflation risk premium, and Naira depreciation risk demanded by investors.`,

  exports: `Nigeria's exports are dominated by crude oil and LNG, accounting for ~85–90% of total export value. Non-oil exports (agriculture, solid minerals, manufactured goods) remain small but are a policy priority. Export values fluctuate with global oil prices and domestic production levels. The Dangote Refinery's commissioning may shift the export basket over time.`,

  imports: `Import demand is driven by refined petroleum products (Nigeria historically imported ~85% of its fuel needs), machinery, foodstuffs, and consumer goods. FX scarcity has frequently compressed import volumes. The full commissioning of the Dangote Refinery is expected to significantly reduce fuel import bills, potentially saving ~$10B in FX annually.`,

  trade_balance: `Nigeria runs a merchandise trade surplus, primarily due to large oil export revenues. However, the balance deteriorates when global oil prices fall or domestic production drops. The services and income account is structurally negative (debt service, profit repatriation), such that the current account balance is often smaller than the trade surplus suggests.`,

  govt_revenue: `Federal government revenue has been persistently below budget targets, reflecting underperformance in oil revenues (theft, production disruptions) and slow growth in non-oil tax collection. FAAC receipts (shared among federal, state, and local governments) are the primary channel. Revenue-to-GDP ratio (~10%) remains one of the lowest globally, limiting fiscal capacity.`,

  govt_expenditure: `Government expenditure is dominated by debt service (now consuming ~90–100% of revenue in some periods), personnel costs, and recurrent items. Capital expenditure — critical for infrastructure — is chronically under-funded and often the first to be cut. The debt service burden has become a critical fiscal risk following years of deficit financing.`,

  budget_balance: `Nigeria's fiscal position has been in persistent deficit since the 2014 oil price collapse, with deficits widening dramatically since 2020. Deficits have been financed through domestic borrowing (T-Bills, bonds) and external debt (Eurobonds, World Bank, China). The debt service-to-revenue ratio exceeding 90% in 2023 flagged serious fiscal sustainability concerns.`,

  fx_reserves: `Foreign exchange reserves peaked around $48B in 2008 and have since declined structurally, sitting around $33–38B in recent years. Reserves provide import cover (~5 months at current levels) and serve as a buffer for Naira defence. A key concern is the proportion of "pledged" or "encumbered" reserves (FX swap lines, forwards) that may overstate usable liquidity.`,

  external_debt: `Nigeria's external debt has risen sharply from ~$6B in 2010 to over $42B by 2024, reflecting Eurobond issuances, multilateral loans (World Bank, AfDB), and bilateral loans (China EXIM Bank). Debt service costs in hard currency are a growing pressure on FX reserves. The IMF has flagged Nigeria as being at moderate risk of debt distress.`,

  oil_production: `Nigeria's crude oil production has declined from 2.4 mbpd in 2011 to around 1.3–1.5 mbpd by 2023 due to oil theft (estimated 150k–250k bpd stolen at peak), pipeline vandalism, underinvestment, and divestment by IOCs. OPEC quota compliance is impacted by these structural issues. The government has set a target of returning to 2+ mbpd.`,

  oil_price: `Brent crude prices heavily influence Nigeria's macroeconomic outlook through their impact on fiscal revenues, FX earnings, and reserves. The 2014 crash to $30/bbl caused Nigeria's recession. COVID briefly pushed prices below $20. The 2022 Russia-Ukraine war drove prices above $120. Nigeria typically uses a conservative benchmark price in its annual budget ($70–$77/bbl in recent budgets).`,

  ngx_index: `The NGX All-Share Index has been a strong performer in local currency terms, reaching record highs above 100,000 points in 2024 — boosted by positive real returns compared to T-Bill yields and as a hedge against Naira depreciation. However, in USD terms, the index has underperformed due to exchange rate losses. Market depth remains limited, dominated by banking and telecoms stocks.`,

  market_cap: `NGX market capitalisation has grown substantially in Naira terms, driven by both price appreciation and new listings. In USD terms, the market remains relatively small (~$35B at peak), reflecting structural constraints including limited foreign investor participation, shallow liquidity, and FX repatriation concerns. Banking sector stocks (GTB, Zenith, Access, UBA) account for a significant portion of capitalisation.`,
};
