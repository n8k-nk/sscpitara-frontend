# Hero showreel: guide and Codex prompt

A 30 second looping product tour for the right side of the signed-out homepage.

## How to use this

1. Open Codex in the `frontend/` folder, with the backend and `npm run dev` running.
2. Commit or stash your work first, so you can throw the attempt away.
3. Paste **Prompt 1**. It only plans. Fix the storyboard until you like it.
4. Paste **Prompt 2**. It builds.
5. Watch it at http://127.0.0.1:3000/ signed out. Use the review checklist below.
6. Fix problems one at a time with the follow-up lines. Name the scene and the second.
7. Only if you need a file for YouTube or Instagram, run **Prompt 3**.

Why code and not a video: text stays sharp on every screen, it follows light and dark
themes, it weighs a few KB instead of several MB, and you can edit one scene without
re-rendering. AI video generators tend to garble interface text.

## Prompt 1: storyboard

```text
Read PROJECT_HANDOFF.md, AGENTS.md, app/page.js, app/_home/HeroPreview.js,
app/home.module.css and components/AppShell.js. Then open the real pages for Learn,
Revision, PYQs, Practice and mock results, Analytics, AI Tutor, Games, Current Affairs
and News, and read their components.

I want to replace HeroPreview with a 30 second animated product tour that loops forever.
It is for a first-time visitor who does not know what SSC Pitara offers.

Do not write code yet. Give me a storyboard table with: start second, end second,
feature, headline (max 5 words), exactly what is on screen, what moves, and how it hands
over to the next scene.

Use this order and timing:
 0.0- 2.5  Opening: SP mark, "One place for SSC prep"
 2.5- 6.5  Learn: a lesson opens, the rule appears, then a worked example, progress fills
 6.5- 9.0  Revision: a due card flips to its answer
 9.0-12.5  PYQs: year and shift picked, a real question appears, an option is chosen
12.5-16.0  Mock test: timer runs, then the report shows where marks were lost
16.0-19.5  Analytics: a chart draws, then today's plan items tick in
19.5-23.5  AI Tutor: a doubt is typed, a first-step hint streams in
23.5-25.5  Games: one quick speed round, correct answer pops
25.5-28.0  Current Affairs and News: fact cards swipe, a headline slides in
28.0-30.0  Close: all features gather into one grid, "Start learning for free",
           then settle into the exact first frame

Rules for content:
- Show only features that exist in the app. Copy the real labels and layout.
- Use real or clearly correct sample content. Check every answer and calculation.
- No invented numbers: no user counts, ratings, ranks, success rates or testimonials.
- Mark anything that needs Premium with a small "Premium" tag.
- One idea per scene. A person must be able to read each scene in the time it has.
Tell me any feature you could not find or that does not fit the time.
```

## Prompt 2: build

```text
Build the approved storyboard as a new component, app/_home/HeroShowreel.js with its own
CSS module, and use it in app/page.js in place of HeroPreview. Keep HeroPreview.js.
Follow the Next.js docs in node_modules/next/dist/docs/ as AGENTS.md requires.

Technique
- HTML, CSS and inline SVG only. No video, GIF, canvas, screenshots or new dependency.
- One master clock drives all scenes from a single timeline array, so I can change a
  duration in one place. Total loop: 30 seconds.
- Animate only transform and opacity (stroke-dashoffset is fine for drawing charts).
- The loop must be seamless: the last frame equals the first, with no flash or jump.

Frame
- Fixed aspect ratio close to the current preview (about 544 x 430 on desktop).
  No layout shift between scenes and no inner scrolling.
- Responsive from 320px to 1440px. Scale with container units; keep text at least 12px
  on phones, and simplify a scene rather than shrink it.

Look
- Use the --lp-* colour tokens and fonts in home.module.css, so light and dark both work.
- Flat and professional: one blue accent, hairline borders, no gradients, no glow, no
  emoji, no particles, no 3D. Green and red only for correct and wrong.
- It should look like our product being used: a small cursor or tap that clicks, text
  that types, bars that fill. Calm motion, 250-450ms, ease cubic-bezier(.22,1,.36,1).
  Hold each finished state long enough to read.

Controls and accessibility
- A visible Pause/Play button, and a thin segmented progress bar naming each scene.
  Clicking a segment jumps to that scene.
- Pause when the tab is hidden or the component is off screen.
- With prefers-reduced-motion, do not autoplay: show a still grid of all features and
  let the segments change scenes without movement.
- The animated area is decorative for screen readers (aria-hidden). Give the section a
  short text description listing the features. Do not announce scene changes.

Performance
- Server render the first frame. Nothing may delay the headline or buttons.

Verify before you report
- Run npm run build.
- With Playwright, screenshot the middle of every scene at 390px and 1440px in light and
  dark. Look at each image and fix clipping, overlap and unreadable text.
- Record two full loops and check the seam at 30s.
- Update PROJECT_HANDOFF.md.
Report what you changed, what you checked and anything you could not do.
```

## Review checklist

- Can you name what the product offers after one watch with no sound?
- Is every scene readable without pausing?
- Do you notice where the loop restarts? You should not.
- Does it match the real app? Open the real page next to the scene.
- Are the sample answers right?
- Check dark and light, and a real phone.
- Does the headline on the left still get attention first?

## Follow-up lines

- "Scene 'Analytics' (16-19.5s) is too busy. Remove everything except the chart and two plan items."
- "The AI Tutor text finishes at 23.4s and cannot be read. Start typing earlier and hold 1.2s."
- "This scene does not match the real page. Read its component again and copy the layout."
- "Motion feels like a slideshow. Show the click that causes each change."
- "The loop jumps at 30s. Make frame 29.9s identical to frame 0."

## Prompt 3: export an MP4 (optional)

```text
Export HeroShowreel as a 30 second MP4 for social media, without changing how it looks on
the site. Add a capture mode that sets the clock from a URL parameter, hides the controls
and renders a chosen size. Write a script that uses Playwright to screenshot every frame
at 30fps and ffmpeg to encode them. Produce 1920x1080 and 1080x1920 versions in light
and dark. Do not add the script's output to Git.
```

## Honest limit

Ten scenes in 30 seconds is about 3 seconds each. If it feels rushed, cut Games and
News from the loop, or lengthen the loop to 40 seconds. Fewer, readable scenes sell
better than every feature at once.
