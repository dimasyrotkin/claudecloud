# Pandatron "The Diagnose Conversation": Step 1 Audit

Source: `Pandatron_3_Layers_Deck.pdf` (17 slides, 1080 x 607.56 pt, Arial, built with PptxGenJS).
Status: awaiting approval before Step 2 (design system).

## TLDR

- 3 of 3 headline stats on slide 3 fail verification as written. One is real but mislabeled (Bain 88%), one is unfindable (HBR 52%), one is misattributed and weak (FT $2.3T). Verified replacements below.
- Slide 11 has a data error (cohort n sums to 719, footnote says 792) and a subtitle that contradicts its own table.
- Slide 16 attributes a +24% stock rise to Pandatron. Coach A is also a Pandatron reseller (since Aug 2023). Both need fixing before any CHRO sees it.
- Design: 13 different greens, 49 em dashes, 4 different "Ask" treatments, brand green text fails WCAG AA (3.4:1).
- Proposed flow: 17 to 14 slides (live) and 14 (leave-behind).
- Format: PPTX with native charts plus PDF. HTML is not materially better for this use.

## A. Claim verification (slide 3 and others)

| Claim on slide | Verdict | What the primary source says | Recommendation |
|---|---|---|---|
| "88% of business transformations fail to achieve their original ambitions." Source: Bain | **Verified.** High confidence | Bain & Company press release, 15 Apr 2024, survey of 400+ executives. Only ~12% achieve original ambitions. Bain's explanation is talent allocation (overloading top talent), not employee resistance | Keep, but the tile label "TRANSFORMATIONS FAIL" overstates it. Use exact wording and year |
| "52% of leaders cite resistance to change as the primary barrier to digital transformation." Source: HBR | **Not found.** Medium-high confidence it is not an HBR figure | Closest HBR item: an HBR Analytic Services report (sponsored by Red Hat) with 46% and 45% for different barriers. No 52% resistance figure located | Cut. Replace (see B) |
| "$2.3T is destroyed annually by failed transformation efforts." Source: Financial Times | **Misattributed.** Medium-high confidence | Traces to an April 2024 book-promotion press release by author Brian Harkin (Taylor & Francis, distributed via EurekAlert and EIN Presswire). Appears derived from the contested "70% fail" rate times IDC digital transformation spend. No FT source found | Cut. The 70% base rate has no empirical basis (Hughes, *Journal of Change Management*, 2011) |
| Slide 13: "Conversational memory rated the #1 differentiator by users" | Unverified internal claim | No source, n, or date on slide | Provide source and n, or cut |
| Slide 16: Coach A "+24% stock price rise as employees built AI competency" | **Causal overclaim** | Pandatron's own case study says the stock rose 24% in the first six months after Coach A made the partnership public. Coach A (TSE: 9339) became a Pandatron reseller in Aug 2023. Timing is not attribution | Drop the stock metric. Use "3 AI products launched" and disclose the partnership |
| Slide 16: Asahi Kasei "surfaced hidden employee risks" | Verified, but scope inflated | Pandatron case study: Clinical Development Center at Asahi Kasei Pharma, multi-continent merger. Perceived support scored 2.7/5 | Name the unit. Use 2.7/5 as the metric |
| Slide 16: Skanska "6 to 2 months" | Partially verified | Public Pandatron material says "similar results to previous programs, three times faster". Exact 6 to 2 months not found | Confirm source internally |

## B. Verified replacement stats

| Stat | Source, year, n | Best use |
|---|---|---|
| Only 12% of transformations achieve their original ambitions | Bain & Company, Apr 2024, n = 400+ executives | Slide 3, tile 1 |
| Resistance to change is the #1 cited implementation barrier, ahead of budget, timelines and technology. Only 29% of transformations consistently deliver intended value | Kearney Transformation Study 2026, "The adoption gap: why most transformations fail after the strategy is approved", n = 102 transformation leaders | Slide 3, tile 2. Its title is nearly Pandatron's thesis |
| Only 22% of employees say they got enough training, coaching or tools to adapt after a reorganization | Bain & Company, Jan 2026, n ≈ 1,000 executives and employees | Slide 3, tile 3. Frames the environment, not people, as the gap |
| 88% of leaders believe their reorganization will deliver. 36% of employees agree | Bain & Company, Jan 2026, same study | Slide 4 "Adoption theater": real data replacing the hypothetical 80% |
| Skills gaps are the #1 perceived barrier (63%). Culture and resistance to change are #2 (46%) | World Economic Forum, Future of Jobs Report 2025, 1,000+ employers, 14M workers | Speaker notes on slide 7: proof that friction "gets filed as a skills problem" |

Sources:
[Bain 2024](https://www.bain.com/about/media-center/press-releases/2024/88-of-business-transformations-fail-to-achieve-their-original-ambitions-those-that-succeed-avoid-overloading-top-talent/) ·
[Bain 2026](https://www.prnewswire.com/news-releases/88-of-leaders-are-confident-their-reorganization-will-deliver--only-36-of-employees-agree-bain--co-research-302672357.html) ·
[Kearney 2026](https://www.prnewswire.com/news-releases/kearney-report-transformation-success-remains-stuck-around-30-percent-despite-surge-in-ai-investments-302854789.html) ·
[WEF 2025](https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/4-workforce-strategies/) ·
[HBR Analytic Services](https://www.redhat.com/en/blog/hbr-analytics-services-report-digital-transformation-refocused-new-goals-require-new-strategies) ·
[$2.3T origin](https://www.einnews.com/pr_news/699136034/2-3trillion-lost-globally-in-failed-digital-transformation-schemes-but-costly-business-strategies-not-necessary) ·
[Coach A case](https://pandatron.ai/case-studies/digital-transformation-in-the-age-of-ai/) ·
[Asahi Kasei case](https://pandatron.ai/knowledge/ma-integration-strategy-how-change-confidence-drives-post-merger-success)

Note: page fetches were blocked in the build environment. Verification relied on search-result excerpts of the primary pages. Recheck exact wording on bain.com and kearney.com before external use.

## C. Slide-by-slide audit

| # | Problem | Sev | Fix |
|---|---|---|---|
| All | 49 em dashes in slide copy | M | Rewrite as two sentences or a colon |
| All | 13 distinct greens (#28A019 logo, #29A41A, #2E8B1D, #1E7A13, #4FA23D, #5FD64E, #7CBB6E, plus 6 tints) | M | One accent, one AA-safe text shade, one tint |
| All | Contrast: brand green text on white 3.4:1. Gray labels #AAAAAA 2.3:1 and #8A8A8A 3.5:1. Every footer, source line and small-caps label fails AA | H | Green text only at 24px+ bold. Small green text uses #1E7A13 (5.5:1, already in deck). Grays no lighter than #666 |
| All | Logo: slide 1 icon plus Arial text, slide 17 real wordmark, slides 2 to 16 none. Footer says "PANDATRON.AI" on 1, "PANDATRON" elsewhere | M | Real wordmark on cover and close. Icon in footer |
| All | "Ask" moments use 4 treatments: headline, bordered strip, filled block, plain text | H | One green "Ask" card everywhere |
| All | Topic-label headlines ("Adoption theater.", "That's the purpose of the Diagnose layer.", "What leaders see in real time.") | M | Assertion headlines |
| All | Section numbering stops after 03 | L | Replace with a 5-step progress tracker |
| All | Employee-as-problem language: "fail on people", "Resistant", "veto", "resistance hotspots". HR buyers advocate for employees | M | Systems framing, using the deck's own best line: "the environment is suppressing it" |
| All | Trust story is one phrase ("shares, never names"). No minimum group size, no data ownership, no AI Act or works council answer | H | Privacy line on slides 10, 11, 13. Optional appendix slide |
| All | PDF metadata reads "PptxGenJS Presentation" | L | Set title, author, subject |
| 1 | B&W stock photo. Man centered as speaker, women at the edges as listeners | H | Abstract brand graphic |
| 1 | Cover asserts the answer ("they fail on people") before slide 2 asks the question | M | Live: neutral title. Leave-behind: keep the assertion |
| 2 | Third chip pre-highlighted green. Leads the witness | M | Neutral chips. Reveal happens on slide 3 |
| 3 | Stats fail verification (Section A). Bottom line repeats slides 5 and 6 | H | Verified tiles with source and year. Cut the repeat |
| 4 | "80%" is hypothetical but looks like data. Meaning carried by red vs green only. Its Ask duplicates slide 8 | M | Reported vs actual gap chart anchored on Bain 88% vs 36%. Ask moves to notes |
| 5 | Two jobs: tool list plus 1 to 10 question. Green gradient implies 10 is the right answer. Gray 1 to 4 fails contrast | M | Merge with 6. Neutral readiness ruler |
| 6 | Facilitator note printed on slide ("Their answer lists what already exists..."). Stock photo | H | Move to speaker notes. Merge into 5 |
| 7 | Strongest content in the deck. "THE ONLY FIX" x4 is absolutist. Body ~11pt. Knowledge card de-emphasized with failing gray | M | "What works". Icons. De-emphasize Knowledge with outline, not low contrast |
| 8 | Two questions plus a list on one slide. Headline centered mid-sentence | M | One question in Ask card. Decisions as 5 chips |
| 9 | Card emphasis inconsistent. Tagline "Change Activation Champion" collides with "Champion" readiness level on 11 | M | Closed-loop diagram. Rename taglines |
| 10 | Headline depends on slide 9 ("That's"). Readiness Map and Change Readiness Profile overlap. "NEW" tag ages | M | Thumbnails per deliverable. Clarify or merge the two |
| 11 | **n sums to 719, footnote says 792** | H | Correct one or explain the gap |
| 11 | Subtitle says Incentive cohorts have "a large champion share". They have the lowest after Customer Service (22 to 27% vs 58 to 65%) | H | Accurate insight: "About half of Claims, Underwriting and Legal (48 to 57%) already score Ready or Champion. Incentive holds them back" |
| 11 | "Activate without a single new training hour" overclaims. 43 to 52% of those cohorts are Hesitant or Resistant | H | "Fixing incentives could unlock about half of each cohort without new training" |
| 11 | "CHAMPIONS ≥ 4" and "N" undefined. "Illustrative" in 8pt | H | Plain labels. Illustrative badge at headline level |
| 11 | Table of 8 x 7. Not sorted by champion share | M | 100% stacked bars, sorted, n shown, constraint tags |
| 12 | 7 x 4 table at ~10pt. "DRIVER +2" and "VETO +2" read as scores. No reliability or validity evidence | M | Gauge diagram. Psychometric note in appendix or notes |
| 13 | "#1 differentiator" unsourced. "World-class thinking" is hype. "Habit-forming" may alarm HR and works councils | M | Source or cut. Name the actual methods |
| 14 | Cards ~60% empty. Misaligned title. "System-level transformation" overclaims | M | Merge with 13: session loop on a 12 to 24 week timeline |
| 15 | "Real time" vs a weekly cadence. "Sensory apparatus" jargon (also slide 4). Text only | M | Mock dashboard. "Weekly signal" |
| 16 | Coach A stock claim and undisclosed reseller relationship. Asahi Kasei scope inflated. Proof shares a slide with the ask | H | Honest case cards. Proof before ask |
| 17 | No booking link or QR. Email casing "Robert.newland" | L | QR plus link. Merge with next step |

## D. Proposed flow

| New | Live version | Leave-behind | From old |
|---|---|---|---|
| 1 | Cover, neutral title | Cover, assertion title | 1 |
| 2 | Ask: where is the biggest risk? | (removed) | 2 |
| 3 | Evidence: 3 verified tiles | same | 3 |
| 4 | Adoption theater: reported vs actual | same | 4 |
| 5 | Ask: readiness ruler 1 to 10 | "What today's tools miss" | 5, 6 |
| 6 | Four costs of change + Ask | Four costs, Ask removed | 7 |
| 7 | Ask: what would you decide differently? | "Five decisions this informs" | 8 |
| 8 | Diagnose, Activate, Measure loop | same | 9 |
| 9 | Diagnose deliverables with thumbnails | same | 10 |
| 10 | Change Readiness Profile chart | same | 11 |
| 11 | CCI+2 model: gauge, amplifier, gate | same | 12 |
| 12 | Activate: session loop on a timeline | same | 13, 14 |
| 13 | Measure: executive dashboard | same | 15 |
| 14 | Proof cases + next step + contact and QR | split into proof and next step | 16, 17 |
| A1 | Optional appendix: trust and privacy | same | new |

## E. Format decision

PPTX plus PDF. Reasons:
1. Buyers live in PowerPoint and Teams. Robert will tailor per account.
2. Native charts keep slide 10 and 13 data editable.
3. Leave-behind PDF must travel through email and procurement portals.

HTML (reveal.js) would win only for an interactive demo. Not this job.
Risk: PDF is rendered with LibreOffice here, which can differ slightly from PowerPoint. Fonts are not embedded by python-pptx.

## F. Open questions (blocking)

1. Brand: pandatron.ai is blocked from the build environment. Logo pixels give #28A019. Confirm it as primary green, and name the brand font.
2. Slide 11 data: real anonymized client data or synthetic? Which n is right, 719 or 792? How are Champion, Ready, Hesitant and Resistant cut?
3. Case studies: OK to drop the stock metric and disclose Coach A as a partner? Source for Skanska 6 to 2 months? Logo usage rights for all three?
4. Booking link for the QR code.
5. Source and n for "#1 differentiator".
6. Minimum reporting group size for cohort data.
