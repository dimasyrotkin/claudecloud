# The Diagnose Conversation: rebuild report

## TLDR

- 17 slides became 14 (live) and 14 (leave-behind). Both decks are editable PPTX with native charts, plus PDF and per-slide PNG.
- All three original slide 3 stats were replaced or relabelled with verified sources (Bain 2024, Kearney 2026, Bain 2026).
- Two overclaims removed: the Coach A share price and "activate without a single new training hour".
- Slide 11 data error fixed (the cohorts add up to 719, not 792). Senior Leaders (n = 34) is now hidden under your 50-person rule.
- QA: file validation passes, every text pair meets WCAG AA, readiness scale is colorblind-checked, zero em dashes or semicolons.

## Deliverables (`pandatron-deck/output/`)

| File | What it is |
|---|---|
| `Pandatron_Diagnose_Conversation_Live.pptx` / `.pdf` | Facilitated version. Ask cards on screen, talk tracks and prompts in speaker notes |
| `Pandatron_Diagnose_Conversation_LeaveBehind.pptx` / `.pdf` | No questions, answers implied, readable without a presenter. Clickable email and web links |
| `Pandatron_Design_System.pptx` / `.pdf` | One reference slide: grid, type, color, readiness scale, components, rules |
| `png/` | Every slide rendered at 1600 x 900 |
| `build/` | Generator source. `python3 build/build_deck.py` rebuilds both decks |

## What changed

| New (live) | Old | Change |
|---|---|---|
| 1 Cover | 1 | Stock photo replaced with a brand graphic (a population of dots, green rings are surfaced signals, echoing the logo ring). Neutral title, so it no longer answers slide 2 before it is asked |
| 2 Ask: biggest risk | 2 | Neutral options. The pre-highlighted answer is gone |
| 3 Evidence | 3 | Three verified tiles with source, year and n |
| 4 Adoption theater | 4 | Split panel: dashboard mock (badged Illustrative) vs reality. Real anchor: Bain 2026, leaders 88% vs employees 36% |
| 5 Readiness ruler | 5 + 6 | Merged. Neutral 1 to 10 scale. "Why isn't that number lower?" moved to notes |
| 6 Four costs | 7 | Icons, Knowledge de-emphasised, "the expensive three" bracket. "The only fix" became "What works" |
| 7 Ask: decide differently | 8 | One question, five decision chips. Second question moved to notes |
| 8 The loop | 9 | Closed-loop diagram. Layer taglines renamed so "Champion" means one thing only |
| 9 Deliverables | 10 | Thumbnail per deliverable. Map (where) vs Profile (how many) made distinct |
| 10 Readiness Profile | 11 | 100% stacked bars (native chart), sorted, n shown, constraint tags, corrected insight, privacy line |
| 11 CCI+2 model | 12 | Five components feed a readiness gauge, Value amplifies, Incentive gates. Gating rule in one sentence |
| 12 Activate | 13 + 14 | Merged. Four-step session loop plus a 12 to 24 week timeline |
| 13 Measure | 15 | Mock executive dashboard, CCI+2 trends per cohort (native chart), hotspot callouts |
| 14 Next step | 16 + 17 | Proof cards, pilot proposal, contact card with QR code |

Leave-behind differs on 1 (assertion subtitle), drops 2, turns 5 into "what snapshot tools show vs miss", replaces Ask cards with takeaways, and splits 14 into a proof slide and a next-step slide.

## What was cut and why

- **HBR 52% and FT $2.3T.** Unverifiable or misattributed (see `AUDIT.md`).
- **Coach A "+24% stock price".** Timing is not attribution, and Coach A is a Pandatron reseller. Replaced with "3 AI products launched" plus disclosure.
- **"Rated the #1 differentiator by users".** No source. Moved to notes with a do-not-say flag.
- **"World-class thinking", "system-level transformation", "real time".** Hype or inaccurate (cadence is weekly).
- **Both B&W stock photos.** Generic, and they cast men as speakers and women as listeners.
- **Printed facilitator note on old slide 6.** Now in speaker notes.

## Decisions I made for you

1. **Font: Arial**, set as the theme font. It matches the original, ships with Office, and renders true-to-width in QA. To switch to a brand font, change the theme font once (Design > Variants > Fonts). Charts are set to Arial explicitly.
2. **Senior Leaders hidden** (n = 34 is under your 50-person minimum). The slide says so, which demonstrates the safeguard. Reverse only if your threshold applies to cohort population, not respondents.
3. **n = 685** shown (7 cohorts). The original footnote said 792 and the 8 cohorts summed to 719.
4. **Champion = CCI score of 4 or higher.** My reading of "CHAMPIONS ≥ 4". Ready, Hesitant and Resistant cut points are not stated on the slide.
5. **Kept "Proactive" and "Resistant"** as labels. They are your instrument's terms.
6. **QR code opens an email to Robert** with subject "Diagnose pilot". No booking link existed. One line to change in `build_deck.py` (`MAILTO`).
7. **Illustrative content is badged:** dashboard mock (slide 4), deliverable thumbnails (9), Measure dashboard (13, trend values simulated using the slide 10 cohorts).
8. **Case logos are set as type, not image logos.** Logo files were not reachable from the build environment.
9. **Readiness scale colors:** Champion #1E7A13, Ready #7CBB6E, Hesitant #D4D4D4, Resistant #4A4A4A. Green arm vs neutral arm, ordered by lightness, no red. Worst colorblind pair ΔE 13.6 (target 8).

## Claims still needing verification

| Claim | Where | Status |
|---|---|---|
| Bain 2024: 88% fall short, 400+ executives | Slide 3 | Verified via search excerpts. Recheck wording on bain.com before external use |
| Kearney 2026: resistance to change is the #1 barrier, n = 102 | Slide 3 | Same |
| Bain 2026: 22% of employees got enough support. Leaders 88% vs employees 36% | Slides 3, 4 | Same |
| Skanska: 6 months to 2 months, "scaled to thousands" | Slide 14 | Public material says "3x faster". Confirm the exact months internally |
| Asahi Kasei Pharma: 2.7 / 5, "milestones met", timeframe | Slide 14 | From Pandatron's case study. No date given |
| n = 792 vs 719 | Slide 10 notes | Reconcile before anyone quotes a total |
| CCI reliability and validity | Slide 11 notes | Expect I/O psychologists to ask |

## Open questions

1. Brand font name, if not Arial.
2. A booking URL to replace the email QR.
3. Logo files and usage approval for Asahi Kasei, Skanska, Coach A.
4. Exact cut points for Ready, Hesitant, Resistant.
5. Privacy specifics beyond "shares, never names" (data ownership, EU AI Act stance, works councils). Worth an appendix slide once confirmed.

## QA

| Check | Result |
|---|---|
| OOXML validation (`validate.py`) | Passed, all 3 files |
| Visual inspection | Every slide rendered and inspected. Fixed: shape shadows, speech-bubble tail, text overflow on 7 slides, gauge angles, wrapped chart labels, legend crowding |
| WCAG AA | Body/caption pairs 4.85:1 to 17.4:1. White on brand green and brand green text (3.4:1) used only at large-text sizes, enforced by a script check |
| Colorblind safety | Readiness scale validated (protan/deutan simulation). Identity never by color alone: every segment direct-labelled |
| Punctuation | 0 em dashes, 0 semicolons in slide text and notes (both decks) |
| 5 seconds at 3 m | Assertion headlines at 30pt carry each slide. Slides 10 and 13 hold detail beyond 5 seconds by design, but the headline states the takeaway |
| PDF | Metadata set (title, author). Fonts render as Liberation Sans, which has the same metrics as Arial. Re-export from PowerPoint for true Arial glyphs |
