import type { Channel, CreatorPlatform } from "./types.ts";

export interface Topic {
  id: string;
  label: string;
  blurb: string;
}

/** Bandit arms, dimension 1: what the tip is about. */
export const TOPICS: Topic[] = [
  { id: "hooks", label: "Hooks", blurb: "The first 1-3 seconds / first line" },
  { id: "storytelling", label: "Storytelling", blurb: "Structure, tension, payoff" },
  { id: "editing", label: "Editing & pacing", blurb: "Cuts, captions, retention" },
  { id: "visuals", label: "Thumbnails & covers", blurb: "Click-worthy visuals" },
  { id: "consistency", label: "Cadence & batching", blurb: "Systems to post consistently" },
  { id: "trends", label: "Trends & remixing", blurb: "Riding trends without losing yourself" },
  { id: "analytics", label: "Analytics", blurb: "Reading the numbers that matter" },
  { id: "community", label: "Community", blurb: "Comments, DMs, superfans" },
  { id: "collabs", label: "Collaborations", blurb: "Duets, guests, cross-promo" },
  { id: "repurposing", label: "Repurposing", blurb: "One idea, many formats" },
  { id: "monetization", label: "Brand deals & money", blurb: "Pricing, pitching, negotiating" },
  { id: "niche", label: "Niche & personal brand", blurb: "Positioning and point of view" },
  { id: "wellbeing", label: "Burnout & boundaries", blurb: "Sustainable creating, rest, hate comments" },
  { id: "psychology", label: "Creator psychology", blurb: "Impostor feelings, comparison, perfectionism, fear of being seen" },
  { id: "safety", label: "Privacy & safety", blurb: "Doxxing, location leaks, stalkers, harassment" },
];

export interface Style {
  id: string;
  label: string;
  instruction: string;
}

/** Bandit arms, dimension 2: how the tip is delivered. */
export const STYLES: Style[] = [
  { id: "quick_win", label: "Quick win", instruction: "One tactic they can apply in under 15 minutes today." },
  { id: "framework", label: "Framework", instruction: "A small named framework or checklist (3-5 steps) they can reuse." },
  { id: "teardown", label: "Example teardown", instruction: "Describe a realistic example post in their niche and break down why it works." },
  { id: "challenge", label: "Challenge", instruction: "A concrete challenge with a measurable target for today or this week." },
  { id: "reframe", label: "Mindset reframe", instruction: "A perspective shift that changes how they approach creating, ending with one action." },
];

export const PLATFORMS: { id: CreatorPlatform; label: string }[] = [
  { id: "tiktok", label: "TikTok" },
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "x", label: "X" },
  { id: "twitch", label: "Twitch" },
  { id: "pinterest", label: "Pinterest" },
  { id: "substack", label: "Substack / newsletter" },
];

export const CHANNELS: { id: Channel; label: string; contactLabel: string; placeholder: string; env: string[] }[] = [
  { id: "web", label: "Web inbox only", contactLabel: "", placeholder: "", env: [] },
  { id: "email", label: "Email", contactLabel: "Email address", placeholder: "you@example.com", env: ["RESEND_API_KEY"] },
  { id: "telegram", label: "Telegram", contactLabel: "Telegram chat id (or leave empty and tap the link after signup)", placeholder: "123456789", env: ["TELEGRAM_BOT_TOKEN"] },
  { id: "whatsapp", label: "WhatsApp", contactLabel: "Phone (E.164)", placeholder: "+14155550123", env: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_WHATSAPP_FROM"] },
  { id: "sms", label: "SMS", contactLabel: "Phone (E.164)", placeholder: "+14155550123", env: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_SMS_FROM"] },
  { id: "discord", label: "Discord", contactLabel: "Discord webhook URL", placeholder: "https://discord.com/api/webhooks/...", env: [] },
  { id: "slack", label: "Slack", contactLabel: "Slack incoming webhook URL", placeholder: "https://hooks.slack.com/services/...", env: [] },
];

export const topicLabel = (id: string) => TOPICS.find((t) => t.id === id)?.label ?? id;
export const styleLabel = (id: string) => STYLES.find((s) => s.id === id)?.label ?? id;
export const platformLabel = (id: string) => PLATFORMS.find((p) => p.id === id)?.label ?? id;

/**
 * Offline tip library, used when ANTHROPIC_API_KEY is not set or the model call fails.
 * `{platform}` and `{niche}` are filled in at render time.
 */
export const LIBRARY: Record<string, { title: string; body: string; action: string }[]> = {
  hooks: [
    { title: "Open with the ending", body: "Start your next {platform} post with the result (the before/after, the final dish, the number) and then rewind. Curiosity about *how* holds attention better than a slow build.", action: "Re-cut one existing {niche} post so the payoff is in the first 2 seconds and repost it." },
    { title: "The 'you're doing it wrong' pattern", body: "Hooks that name a common mistake trigger self-checking. Keep it specific to {niche}, not generic clickbait.", action: "Write 5 hooks that start with 'Stop ___ if you want ___' and pick the best one for tomorrow." },
    { title: "Say it, show it, text it", body: "The strongest openings stack three signals at once: a spoken line, a visual change, and on-screen text that says the same promise.", action: "Film your next intro with all three layers and compare 3-second hold rate to your average." },
  ],
  storytelling: [
    { title: "Stakes before facts", body: "Before you explain anything, tell viewers what is at risk. Even small stakes (\"I almost ruined this\") make {niche} content feel like a story.", action: "Add one stakes sentence to the script of your next post." },
    { title: "But / therefore, never 'and then'", body: "Link beats with 'but' and 'therefore' instead of 'and then'. Each beat should cause or complicate the next.", action: "Rewrite your next script and delete every 'and then'." },
    { title: "One person, one problem", body: "Stories about a specific person (you, a client, a follower) beat stories about 'people'.", action: "Turn a recent DM or comment into a 30-second story with a named person (with permission)." },
  ],
  editing: [
    { title: "Cut every breath", body: "Remove pauses and filler between sentences. Pace feels like energy on {platform}.", action: "Take your last video and trim 15% of its runtime without removing any information." },
    { title: "Pattern interrupt every 3-5 seconds", body: "A zoom, angle change, B-roll or text pop resets attention. Retention graphs dip where nothing changes.", action: "Open your retention graph, find the biggest dip, and note what was on screen." },
    { title: "Captions that lead, not follow", body: "Show the key word of each line slightly before it is spoken, and highlight one word per line.", action: "Restyle captions on one post with one highlighted keyword per line." },
  ],
  visuals: [
    { title: "One face, one emotion, three words", body: "Covers and thumbnails that work at phone size usually have a clear face with one emotion and at most three words.", action: "Redesign your weakest-performing cover with this rule and A/B it if {platform} allows." },
    { title: "The squint test", body: "Shrink your thumbnail to 10% and squint. If you can't tell what it is, neither can a scroller.", action: "Squint-test your last 6 covers and fix the two worst." },
    { title: "Consistent grid identity", body: "A recurring color, border, or framing makes your posts recognisable before people read your name.", action: "Pick one visual signature and apply it to the next 5 posts." },
  ],
  consistency: [
    { title: "Batch the boring parts", body: "Separate thinking, filming and editing into different sessions. Context switching is what kills cadence.", action: "Block a 90-minute 'ideas only' session this week and write 15 titles." },
    { title: "Minimum viable post", body: "Define the smallest post you'd still be proud of. On low-energy days you ship that instead of nothing.", action: "Write down your MVP format for {niche} and save 3 ideas for it." },
    { title: "Pick a cadence you can keep for 90 days", body: "The algorithm and your audience reward reliability more than volume. 3 posts every week beats 7 then 0.", action: "Set your realistic weekly number and put the posting slots in your calendar." },
  ],
  trends: [
    { title: "Trend + your angle", body: "Don't copy the trend, translate it. Ask: what would this trend look like if a {niche} expert did it?", action: "Find 3 trending sounds/formats and write your {niche} twist for each." },
    { title: "Be second, not first", body: "You don't need to catch trends on day one. Days 2-5 are often the sweet spot with proven formats and less saturation.", action: "Save 5 trends today and revisit them in 48 hours." },
    { title: "Evergreen the trend", body: "Use a trending format to deliver an evergreen idea, so the post keeps working after the trend dies.", action: "Pair one current trend with your most-asked question." },
  ],
  analytics: [
    { title: "Track 2 numbers, not 20", body: "For most creators: hold rate in the first 3 seconds and shares/saves per view. Everything else is downstream.", action: "Make a simple sheet with these two numbers for your last 10 posts." },
    { title: "Compare posts to yourself", body: "Benchmark against your own median, not other creators. A post at 2x your median is a signal to repeat.", action: "Find your top post vs median and list 3 differences." },
    { title: "Read comments as data", body: "Questions in comments are your next content calendar.", action: "Copy 10 questions from recent comments into an idea list." },
  ],
  community: [
    { title: "Reply in the first hour", body: "Early replies boost conversation and show newcomers that you're present.", action: "After your next post, set a 45-minute timer and reply to every comment." },
    { title: "Turn comments into content", body: "Video-replying to a comment rewards the commenter and makes others want to comment.", action: "Make one post answering a specific comment." },
    { title: "Name your superfans", body: "Notice the 10 people who always show up. Thank them by name occasionally.", action: "List your 10 most engaged followers and DM two of them a genuine thank-you." },
  ],
  collabs: [
    { title: "Collab sideways", body: "The best collaborators are adjacent, not identical: a fitness creator + a meal-prep creator.", action: "List 5 creators adjacent to {niche} with a similar audience size." },
    { title: "Pitch the idea, not the collab", body: "\"Want to collab?\" gets ignored. \"I have an idea for a video where we ___\" gets replies.", action: "Write one specific collab pitch and send it." },
    { title: "Low-lift collabs first", body: "Duets, stitches, guest comments and shared lives build trust before bigger projects.", action: "Duet/stitch or thoughtfully comment on 3 adjacent creators today." },
  ],
  repurposing: [
    { title: "One idea, five shapes", body: "A strong idea can be a short video, carousel, thread, newsletter section and story poll.", action: "Take your best post this month and turn it into 2 other formats." },
    { title: "Repost your winners", body: "Most followers never saw your best post. Re-edit and repost it 60-90 days later.", action: "Pick one top post from 3 months ago to refresh this week." },
    { title: "Film once, cut three", body: "Plan a long recording so you can cut a main video and 2 shorts from it.", action: "Outline your next shoot with 3 clip-able moments marked." },
  ],
  monetization: [
    { title: "Gifted is not paid", body: "Micro-creators get lots of free-product offers. Gifting is fine when you would have bought it anyway, but any required post, deadline or usage rights is work, and work gets a fee. Micro audiences often convert better than big ones. That is your pitch.", action: "Write a one-line reply for gifting offers that asks for a paid rate when deliverables are required." },
    { title: "Price from value, not followers", body: "Rates based purely on follower count undersell creators with engaged niches. Factor usage rights, exclusivity and production time.", action: "Write your rate card with separate lines for usage rights and exclusivity." },
    { title: "Never accept the first offer", body: "Brands expect negotiation. A polite counter with a reason often lands noticeably higher. Industry surveys report creator pay gaps by gender and race, so anchor high on purpose.", action: "Draft a counter-offer template you can reuse." },
    { title: "Build a one-page media kit", body: "Audience demographics, 3 best results, past partners, and a clear contact. Keep it to one page.", action: "Create or refresh your one-page media kit today." },
  ],
  niche: [
    { title: "Have a spiky point of view", body: "A clear opinion that some people disagree with makes you memorable in {niche}.", action: "Write down 3 beliefs about {niche} most people around you don't share." },
    { title: "The 'for whom' sentence", body: "\"I help ___ do ___ without ___.\" If you can't fill it in, your audience can't either.", action: "Write your sentence and put it in your bio." },
    { title: "Content pillars", body: "3-4 recurring pillars let you be consistent without being repetitive.", action: "Define your pillars and tag your last 10 posts by pillar." },
  ],
  wellbeing: [
    { title: "Separate your worth from your views", body: "Analytics measure a post, not you. Check numbers at a fixed time, not all day.", action: "Pick one daily 'stats window' and turn off view-count notifications." },
    { title: "Have a hate-comment protocol", body: "Decide in advance: delete, block, or ignore. Decisions made in advance cost less emotional energy than ones made at 11pm.", action: "Write your 3-line protocol and add keyword filters for the worst words." },
    { title: "Schedule a creative day off", body: "Rest is part of the work. Burnout usually shows up first as dread before filming.", action: "Put one no-content day in your calendar this week." },
  ],
  psychology: [
    { title: "Name the critic, then post anyway", body: "Before posting, the inner voice says \"who are you to talk about {niche}?\". Notice it and label it (\"there's the impostor story\") instead of arguing with it. Labelling a thought loosens its grip. You don't have to wait for the feeling to go away before you act.", action: "Write down the exact sentence your inner critic says before you post. Post anyway, then note what actually happened." },
    { title: "Compare with your past self, not their highlight reel", body: "Comparison on {platform} is rigged: you see their best 1% next to your raw 100%. This hits harder on visual platforms, where appearance gets judged alongside the work. Your own trend line is the honest comparison.", action: "Put your first post next to your latest one and list 3 things you do better now." },
    { title: "Lower the bar on purpose", body: "Perfectionism often feels like high standards, but it is mostly a way to avoid being judged. Aim for 'good enough to learn from'. Every post is an experiment, not a verdict on you.", action: "Ship one post today at 80% polish and treat it as data." },
  ],
  safety: [
    { title: "Audit your background", body: "Windows, street signs, mail, school uniforms and reflective surfaces can reveal where you live. This risk is disproportionately faced by women creators.", action: "Review your last 5 posts for location clues and archive anything risky." },
    { title: "Post location after you leave", body: "Share places after the fact, not in real time.", action: "Turn off automatic location tagging on {platform} and your camera app." },
    { title: "Separate your contact surfaces", body: "Use a dedicated business email and a P.O. box or virtual address for PR packages.", action: "Set up a business-only email and update your bio." },
  ],
};
