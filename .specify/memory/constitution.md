<!--
  Sync Impact Report
  ==================
  Version change: N/A → 1.0.0 (initial)

  Added Principles:
  - I. Simplicity First
  - II. Fun Over Perfect
  - III. Mobile-Ready
  - IV. Works Offline

  Added Sections:
  - Project Identity
  - Technical Constraints
  - Governance

  Removed Sections: None (initial creation)

  Templates Status:
  - spec-template.md: ✅ Compatible (no changes needed)
  - plan-template.md: ✅ Compatible (no changes needed)
  - tasks-template.md: ✅ Compatible (no changes needed)

  Follow-up TODOs: None
-->

# Sanam Quiz App Constitution

## Project Identity

**Purpose**: A fun, personal one-page web app to ask Sanam to be my girlfriend through an interactive quiz with 15 funny questions and a misbehaving "No" button.

**Audience**: One person - Sanam. That's it.

**Vibe**: Edgy, funny, self-aware, personal. Not generic romantic cheese.

## Core Principles

### I. Simplicity First

This project MUST remain a single-page static web app.

- One HTML file, one CSS file, one JS file
- No frameworks, no build tools, no npm, no dependencies
- If you can't open index.html directly in a browser and have it work, you've failed
- No over-engineering - this is a love letter, not a startup

**Rationale**: Complexity kills fun projects. Every dependency is a potential point of failure when showing her the quiz.

### II. Fun Over Perfect

Humor and personality take priority over code elegance.

- Hardcoded content is fine - there's exactly 15 questions, they won't change
- Clever UX tricks (runaway buttons, fake loading) matter more than clean architecture
- If it makes her laugh, it's good code
- Comments can be funny

**Rationale**: This exists to make one person smile, not to impress engineers on GitHub.

### III. Mobile-Ready

The quiz MUST work perfectly on a phone.

- She will probably view this on her phone
- Touch targets must be large enough (especially for that misbehaving "No" button)
- Text must be readable without zooming
- Animations must be smooth on mobile

**Rationale**: If the No button dodge doesn't work on mobile, half the joke is dead.

### IV. Works Offline

Once loaded, the quiz MUST function without internet.

- No external CDN dependencies that could fail
- No API calls
- All assets bundled or inline
- LocalStorage for any state (if needed)

**Rationale**: Can't risk "network error" killing the moment.

## Technical Constraints

**Stack**: Vanilla HTML5, CSS3, JavaScript (ES6+)

**Browser Support**: Modern browsers only (Chrome, Safari, Firefox). No IE support needed - it's 2025.

**File Structure**:
```
quiz/
├── index.html      # Single page app
├── styles.css      # All styles (pink theme)
└── app.js          # Quiz logic, animations, button shenanigans
```

**Design Requirements**:
- Pink color palette
- Card-based question flow
- Smooth transitions between cards
- Compatibility score display
- Misbehaving "No" button on final question
- Victory screen with celebration

## Governance

This constitution defines what matters for this specific project. When in doubt:

1. Does it make the quiz funnier or better? → Do it
2. Does it add complexity without clear benefit? → Don't do it
3. Will it work on her phone? → Must work
4. Can it break at showtime? → Eliminate the risk

**Amendments**: This constitution can be updated if project scope changes. Given the audience size (1 person), formal amendment procedures are overkill.

**Version**: 1.0.0 | **Ratified**: 2025-02-04 | **Last Amended**: 2025-02-04
