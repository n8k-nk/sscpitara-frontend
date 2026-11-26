---
name: SSC Pitara Homepage
description: A scorebook for trying an SSC CGL question and seeing what to practise next.
colors:
  track-yellow: "#ffda59"
  track-yellow-hover: "#ffe78e"
  deep-navy: "#101c36"
  report-navy: "#1b2d50"
  ink: "#14233d"
  slate: "#52617a"
  sky: "#c9d9f4"
  rule: "#d4deed"
  cool-paper: "#f7f9fd"
  white: "#ffffff"
  sheet-band: "#edf3ff"
  sheet-label: "#394f74"
  option-border: "#7389aa"
  resources-blue: "#e8effb"
  focus-blue: "#4671c5"
  correct-fill: "#e0f4e9"
  correct-border: "#398057"
  incorrect-fill: "#fbeae8"
  incorrect-border: "#b95849"
typography:
  display:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(3rem, 5.6vw, 5.25rem)"
    fontWeight: 800
    lineHeight: 1.01
    letterSpacing: "-.04em"
  headline:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.4vw, 3.8rem)"
    fontWeight: 800
    lineHeight: 1.09
    letterSpacing: "-.035em"
  title:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "1.18rem"
    fontWeight: 800
    lineHeight: 1.25
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Noto Sans, Noto Sans Devanagari, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontSize: ".83rem"
    fontWeight: 750
    lineHeight: 1.6
  action:
    fontSize: ".94rem"
    fontWeight: 750
    lineHeight: 1.6
  score:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 5rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-.035em"
rounded:
  marker: "4px"
  control: "8px"
  panel: "14px"
spacing:
  page-cap: "76rem"
  gutter: "1.5rem"
  gutter-phone: "1rem"
  target-minimum: "44px"
  action-minimum: "3rem"
  answer-gap: ".625rem"
  sheet-padding: "clamp(1rem, 2.2vw, 1.75rem)"
components:
  primary-action:
    backgroundColor: "{colors.track-yellow}"
    textColor: "{colors.deep-navy}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: ".6rem 1rem"
  primary-action-hover:
    backgroundColor: "{colors.track-yellow-hover}"
  secondary-action:
    textColor: "{colors.white}"
    typography: "{typography.action}"
  answer-option:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: ".45rem .65rem"
  answer-option-hover:
    backgroundColor: "{colors.sheet-band}"
  answer-option-correct:
    backgroundColor: "{colors.correct-fill}"
  answer-option-incorrect:
    backgroundColor: "{colors.incorrect-fill}"
  question-sheet:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
  mock-report:
    backgroundColor: "{colors.report-navy}"
    textColor: "{colors.white}"
    rounded: "{rounded.panel}"
    padding: "clamp(1rem, 3vw, 2rem)"
  archive-evidence:
    backgroundColor: "{colors.track-yellow}"
    textColor: "{colors.ink}"
    padding: "1rem 0"
  landing-navigation:
    backgroundColor: "{colors.deep-navy}"
    textColor: "{colors.sky}"
---

# Design System: SSC Pitara Homepage

## Overview

**Creative North Star: "Scorebook"**

The homepage borrows its visual language from sports scorekeeping. Deep navy frames a cool white question sheet, and track yellow identifies the first action and the figures worth reading. The question is the working centrepiece. A visitor can choose an answer, read the working and follow the topic into the archive.

The layout gives the headline and sample question room to breathe, then uses ruled rows and tabular figures to show how a mock result leads to the next study task. This guide covers the public homepage at `/`.

**Key Characteristics**

- A working question set into a full-width navy field.
- Yellow actions and tabular figures for archive counts and net marks.
- Cool paper and ruled rows for explanations, steps and resource links.

## Colors

Deep blue frames the page, cool paper holds the reading sections, and track yellow carries the main action and figures.

### Primary

- **Track Yellow** fills the primary buttons and archive coverage strip. It also highlights the exam name in the headline and the net score in the report. Its lighter hover variant belongs to the filled action. Track yellow also outlines keyboard focus on navy.

### Secondary

- **Focus Blue** outlines keyboard focus on light surfaces and marks the border of a hovered answer.
- **Answer feedback** uses a green fill and border for the correct option and a red fill and border for a chosen incorrect option. The solution states the result in words.

### Neutral

- **Deep Navy** frames the header, hero and closing section. **Report Navy** provides a lighter dark surface for the report and a gradient endpoint for the hero.
- **Ink** is the primary text colour on light surfaces. **Slate** is used for descriptions and source metadata. **Sky** serves the same supporting role on navy.
- **Cool Paper** is the page base. **White** is used for the question body and footer. **Sheet Band** holds the question metadata, option letters and footer. **Resources Blue** sets off the resource rows.
- **Rule** divides light reading rows. **Option Border** outlines answer buttons at rest.

## Typography

Manrope carries the headline, section titles and scores. The page inherits the app's Inter-first stack for prose, links, source metadata and answers.

- **Display** is tightly tracked at weight 800. Its measure is capped at 12ch on desktop and 14ch from 820px down. At 570px and below it uses `clamp(2.45rem, 10.8vw, 3.55rem)`.
- **Headline** gives the mock method and resource sections their opening line. **Title** names the individual steps and resources.
- **Question stem** uses Manrope (`clamp(1.12rem, 1.65vw, 1.45rem)`, line-height 1.4). Hero supporting copy is limited to 40ch.
- **Tabular figures** are used for the net score, archive counts and numbered method steps.

## Layout

Sections run full width around a shared inner container capped at 76rem. At desktop widths, the hero pairs a left-aligned introduction with the question. The method section uses a second two-column grid, with the illustrative mock report beside the sequence of study steps. Resource rows align the title, description and arrow in three columns.

At 820px and below, both two-column grids stack in reading order and the archive link moves below the two counts. At 570px and below, the side gutters narrow to 1rem. The header places the brand and account action above a visible navigation row. Resource descriptions wrap under their titles and arrows remain aligned to the right.

## Elevation & Depth

The question sheet lifts off the hero with one diffuse shadow (`0 24px 52px rgb(0 0 0 / 19%)`). The mock report and reading sections use contrasting backgrounds and 1px dividers to establish their layers.

## Shapes

The question sheet and mock report use 14px corners. Buttons and the outlined sign-in link use 8px corners, while the small square answer letters use 4px corners. Horizontal rules define the report rows and the open lists of study steps and resources.

## Components

### Buttons and links

The primary action combines track yellow, navy text and a trailing arrow. The secondary hero action is an underlined link on navy. Both have a 3rem minimum height. The primary background and answer backgrounds or borders transition over 160ms with `ease`. Keyboard focus uses a 3px outline offset by 4px. Use track yellow on navy and focus blue on light surfaces, including the question sheet.

### Question sheet

Pale blue bands frame a white question body. The top band names the subject and topic, the body shows the source and question, and a two-column grid holds the answer buttons. Choosing an answer reveals the explanation below a rule and changes the footer's instruction to a practice link. The source link appears when the archive record is available. The explanation is announced in a live region and fades and rises 4px over 240ms. Reduced-motion preferences disable the animation and transitions.

### Mock report and archive evidence

The report puts the tabular net score above ruled rows that identify a topic to revisit and link to practice. Its header labels the figures as illustrative. The full-width archive strip shows the published question and paper counts with an archive link when the data is available.

### Navigation

The navy header contains the SSC Pitara mark, links to past papers, lessons and mock tests, and an outlined account action. Underlines identify hovered links. Header and footer navigation targets are at least 44px high. On phones the three study links remain visible in a second header row.

## Do's and Don'ts

- **Do** keep the real question keyboard-accessible and put its worked answer directly below the choices.
- **Do** use tabular figures for coverage and scores, with nearby labels that explain what the numbers measure.
- **Do** keep the archive counts tied to available data and label the example report as illustrative.
- **Don't** use green or red alone to communicate whether the selected answer was correct.
- **Don't** add elevation to ruled rows or the mock report.
