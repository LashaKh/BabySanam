# Upgrade Final Card (Card 13) - "Will you be my girlfriend?"

## Goal
1. Remove the glassmorphic card container - display text directly on screen
2. Make the "Absolutely not" button harder to catch (full-screen dodge) but not impossible

## Tasks

- [x] **1. Add Final Screen CSS Styles**
- [x] **2. Modify `renderCard()` in app.js**
- [x] **3. Add smooth cursor-aware dodge system**
- [x] **4. Update handlers and CSS transitions**
- [x] **5. Fix button disappearing issue**

---

## Review

### Problem Fixed
The No button was disappearing/jumping erratically because:
1. Initial position used `right: 60px` but dodge set `left`, causing instant jumps
2. Hover handler triggered repeatedly causing erratic behavior
3. CSS transition was too fast (0.15s) with bouncy easing

### Solution Implemented

**1. Cursor-Aware Smooth Dodge System** (`app.js`)
- New `setupCursorDodge()` function tracks mouse position continuously
- Button smoothly moves away when cursor gets within 150px
- Direction calculated to move away from cursor
- Throttled to 200ms between moves for smoothness
- Falls back to opposite side of screen if cornered

**2. Fixed Initial Positioning** (`app.js`)
- Changed from `right: 60px` to `left: (window.innerWidth - 220)px`
- Consistent left/top positioning for smooth CSS transitions

**3. Improved CSS Transitions** (`styles.css`)
- Changed from `transition: all 0.15s cubic-bezier(...)`
- To: `transition: left 0.25s ease-out, top 0.25s ease-out, transform 0.2s ease`
- Smooth, natural movement instead of bouncy jumps

**4. Disabled Conflicting Hover Handler**
- `handlePointerEnter` now skips `.final-no-btn`
- Prevents double-triggering with cursor tracking system

### Files Modified
| File | Change |
|------|--------|
| `quiz/app.js` | +100 lines (cursor dodge system) |
| `quiz/styles.css` | Updated transition timing |

### How It Works Now
1. When cursor enters within 150px of button → button smoothly glides away
2. Direction is always away from cursor
3. If cornered, button jumps to opposite side of screen
4. After 4+ attempts, button restricts to bottom half and trembles
5. Eventually disappears and second Yes button appears
