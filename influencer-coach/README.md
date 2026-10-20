# Cadence Coach

Content coaching for micro-creators (under ~100k followers): one tip a day on the channel they choose, plus human-checked reviews of their actual posts. A learner adapts to each creator.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdimasyrotkin%2Fclaudecloud&root-directory=influencer-coach&project-name=cadence-coach&env=ANTHROPIC_API_KEY,CRON_SECRET,ADMIN_KEY)

## What's in the prototype

| Page | What it does |
|---|---|
| `/` | Landing + 30-second onboarding (platform, niche, stage, goals, struggle, delivery channel, time). First tip is sent right away. |
| `/u/<id>` | Private dashboard: today's tip, one-tap feedback + tags, weekly check-in, "what your coach has learned" (posteriors with uncertainty), history, notes, delivery settings. |
| `/u/<id>#reviews` | Post feedback: creator pastes caption/script, adds up to 3 screenshots and metrics. Claude scores 6 areas, lists fixes, rewrites the hook and suggests an experiment. |
| `/admin` | Coach console (needs `ADMIN_KEY`): approve, edit or reject each post review before the creator sees it, spot-check sent tips, and turn mistakes into rules. |
| `/lab` | Simulation with synthetic creators. It runs the production learner in the browser and compares it against random tips and a perfect-knowledge ceiling. |

Delivery channels: web inbox (always), Email (Resend), Telegram (inline 👍/✅/👎 buttons, free-text replies become coach memory), WhatsApp and SMS (Twilio), Discord and Slack (webhooks). If a channel isn't configured on the server, the tip still lands in the web inbox and is marked "simulated".

## How it learns

```
onboarding goals + population prior
            │
            ▼
 ┌─ Topic bandit (14 arms) ─┐   ┌─ Format bandit (5 arms) ─┐   4 dials: length,
 │  Thompson sampling, Beta │ × │  quick win / framework /  │ + specificity, tone,
 │  posteriors, 1% discount │   │  teardown / challenge ... │   level
 └──────────────────────────┘   └───────────────────────────┘
            │  pick
            ▼
  Claude writes the tip (profile, notes, last 10 tips + reactions, dials)
            │
            ▼
  👍 = 1 · ✅ did it = 1 (x2 weight) · 👎 = 0 · silence = 0 (x0.3)
  tags ("too long") move dials and mostly blame the format, not the topic
  weekly check-in "more of X" = x3 weight on that topic
```

### Human-in-the-loop

```
creator submits post ─▶ Claude draft ─▶ admin queue ─▶ approve / edit / reject ─▶ creator notified
                                             │
                                             └─▶ "caught a mistake" rule ─▶ added to every future tip + review prompt
approved scores ─▶ weakest 2 areas nudge the topic learner (real posts beat stated goals)
```

Daily tips go out without approval (one per creator per day would not scale), but admins can flag them, which also creates a rule.

Code: `lib/learner.ts` (model), `lib/coach.ts` (Claude prompt), `lib/simulate.ts` (personas). `npm test` checks that the learner beats the non-learning baseline across 20 seeds.

## Deploy on Vercel

1. Import this repo in Vercel and set **Root Directory** to `influencer-coach` (the button above does this).
2. Add **Upstash for Redis** from the Vercel Marketplace (Storage tab). It sets `KV_REST_API_URL` / `KV_REST_API_TOKEN`. Without it, data lives in memory and resets.
3. Env vars:

| Var | Needed for |
|---|---|
| `ANTHROPIC_API_KEY` | AI-written tips (falls back to built-in library without it) |
| `COACH_MODEL` | optional, default `claude-opus-5-5` (`claude-haiku-5-5` is far cheaper at scale) |
| `ADMIN_KEY` | enables `/admin`; post reviews then wait for approval |
| `ADMIN_EMAIL` | optional: email when a review lands in the queue (needs Resend) |
| `REVIEW_MODE=auto` | optional: skip approval and publish AI reviews directly |
| `REVIEW_MODEL` | optional, defaults to `COACH_MODEL` |
| `CRON_SECRET` | protects `/api/cron/daily` (Vercel Cron sends it automatically) |
| `RESEND_API_KEY`, `EMAIL_FROM` | Email |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_WEBHOOK_SECRET` | Telegram. Then open `/api/telegram/setup?key=<CRON_SECRET>` once. |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`, `TWILIO_SMS_FROM` | WhatsApp / SMS |
| `CRON_MODE=hourly` | Pro plan only: change `vercel.json` to `0 * * * *` to respect each creator's chosen hour |

The cron in `vercel.json` runs daily at 16:00 UTC (9am PT). Hobby plans only allow daily crons, so everyone gets their tip in that run.

## Local

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # learner regression check
```

## Known prototype limits

- Auth is a private link (`/u/<id>`). Fine for a pilot, but it needs magic-link login before real users.
- Screenshots are compressed in the browser and stored in Redis next to the review (about 250KB each, max 3). Move them to Vercel Blob before scaling.
- The cron sends sequentially, so one run handles about 30-60 creators. Fan out with a queue to scale.
- Feedback links open the dashboard instead of recording a click. Email scanners and Slack unfurlers pre-fetch links and would fake thumbs-ups.
