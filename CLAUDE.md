# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sanam Quiz App** - A fun, personal one-page web app to ask Sanam to be my girlfriend through an interactive quiz with 15 funny questions and a misbehaving "No" button.

**Stack**: Pure vanilla HTML5, CSS3, JavaScript (ES6+). No frameworks, no build tools, no npm.

## Running the Project

```bash
# Open directly in browser
open quiz/index.html

# Or serve with any static server
python3 -m http.server 8000 --directory quiz
```

## Project Structure

```
quiz/                    # The actual app
├── index.html          # Single page entry
├── styles.css          # Pink theme, glassmorphism
└── app.js              # Quiz logic, animations, button shenanigans

.claude/
├── agents/             # Custom Claude agents (16+ specialized agents)
└── commands/           # Slash commands for workflows

.specify/
├── memory/constitution.md  # Project principles (READ THIS FIRST)
├── templates/              # Plan, spec, task templates
└── scripts/                # Bash utilities

tasks/todo.md           # Task tracking
```

## Core Principles (from constitution)

1. **Simplicity First** - One HTML, one CSS, one JS. No dependencies. Must work by opening index.html directly.

2. **Fun Over Perfect** - Humor > code elegance. Hardcoded content is fine. If it makes her laugh, it's good code.

3. **Mobile-Ready** - She'll view on her phone. Touch targets must be large, text readable, animations smooth.

4. **Works Offline** - No external CDNs, no API calls. Once loaded, must function without internet.

## Key App Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Quiz State | `app.js:12-19` | Tracks current card, no-button attempts, completion |
| Questions Data | `app.js:24-226` | All 15 question cards with options and behaviors |
| No Button Escalation | `app.js:231-238` | States: dodge → shrink → tiny → disappear |
| Card Rendering | `app.js:264-333` | Creates/shows/hides cards with animations |
| Score Animation | `app.js:553-580` | Animates compatibility percentage |
| Confetti | `app.js:585-606` | Victory celebration effect |

## CSS Variables (theming)

Edit `quiz/styles.css:6-49` for colors, spacing, timing. Key variables:
- `--color-primary: #FF1493` (hot pink)
- `--card-max-width: 420px`
- `--transition-slow: 0.5s`

## Available Custom Commands

Located in `.claude/commands/`:
- `/constitution` - Update project principles
- `/dev-setup` - Development setup guide
- `/ui-upgrade` - UI enhancement workflow
- `/promptOptimizer` - Optimize prompts
- Various `speckit.*` commands for spec/plan workflows

## Decision Framework

When making changes, follow this order (from constitution):
1. Does it make the quiz funnier or better? → Do it
2. Does it add complexity without clear benefit? → Don't do it
3. Will it work on her phone? → Must work
4. Can it break at showtime? → Eliminate the risk
