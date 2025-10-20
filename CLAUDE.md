# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vimium is a browser extension that provides keyboard-based navigation and control for Chrome, Edge, and Firefox in the spirit of Vim. The extension uses JavaScript (ES2018) and is built with Deno.

## Development Commands

### Build & Package
- `./make.js package` - Build distributable zip files for Chrome and Firefox stores (output in `dist/`)
- `./make.js write-firefox-manifest` - Generate Firefox-compatible manifest.json for development

### Testing
- `./make.js test` - Run all tests (unit + DOM)
- `./make.js test-unit` - Run unit tests only
- `./make.js test-dom` - Run DOM tests using Puppeteer

Tests use shoulda.js and Puppeteer. Unit tests are in `tests/unit_tests/`, DOM tests in `tests/dom_tests/`.

### Code Formatting
- `deno fmt` - Format all code (100 character line width)

### Other
- `./make.js fetch-tlds` - Download and parse top-level domains list
- `./make.js write-command-listing` - Generate static command listing page

## Architecture

### Extension Structure

**Background Scripts** (`background_scripts/`)
- `main.js` - Service worker entry point; handles tab operations, commands, completions, and inter-frame messaging
- `commands.js` - Command registry and key mapping system
- `all_commands.js` - Defines all available Vimium commands
- `completion.js` & `completion_engines.js` - Omnibar completion (bookmarks, history, tabs, search engines)
- `tab_operations.js` - Tab creation, navigation, and management
- `marks.js` - Global marks implementation
- `exclusions.js` - Per-site enable/disable rules

**Content Scripts** (`content_scripts/`)
- Load order defined in `manifest.json`
- `vimium_frontend.js` - Main entry point; initializes modes, manages enabled state, handles focus
- `mode.js` - Base Mode class; implements event handler stack system
- `mode_normal.js` - Normal mode (default vim-like mode)
- `mode_insert.js` - Insert mode (when focused on input fields)
- `mode_find.js` - Find mode (in-page search)
- `mode_visual.js` - Visual mode (text selection)
- `link_hints.js` - Link hints implementation; coordinates across frames
- `scroller.js` - Smooth scrolling with customizable physics
- `hud.js` - Heads-up display for messages and mode indicators
- `ui_component.js` - Base class for iframe-based UI components
- `vomnibar.js` - Omnibar (URL/bookmark/history search bar)

**Pages** (`pages/`)
- HTML/CSS/JS for extension pages: options, help dialog, vomnibar, HUD, action popup
- Some pages load in iframes within content scripts

**Lib** (`lib/`)
- Shared utilities: DOM utils, keyboard utils, settings, URL utils, handler stack

### Key Concepts

**Mode System**
- Modes are stacks of event handlers
- Each mode pushes handlers onto `handlerStack` on activation, removes on exit
- Handlers can return: `continueBubbling`, `suppressEvent`, `passEventToPage`, `suppressPropagation`, `restartBubbling`
- Modes can be singletons (only one instance active)
- Mode options: `exitOnEscape`, `exitOnBlur`, `exitOnClick`, `exitOnFocus`, `exitOnScroll`

**Handler Stack**
- Central event routing system in `lib/handler_stack.js`
- Handlers installed in content scripts bubble events through stack
- Events: keydown, keypress, keyup, click, focus, blur, mousedown, scroll, DOMActivate

**Link Hints**
- Coordinates across all frames in a tab via background script
- `HintCoordinator` in `main.js` collects hint descriptors from all frames
- Each frame renders its own hints with globally unique labels
- Supports multiple modes: open link, open in new tab, copy URL, etc.

**Content Script Injection**
- Scripts in `manifest.json` auto-inject at `document_start` into all frames
- On extension install/update, existing tabs get scripts injected programmatically
- Firefox behavior differs slightly from Chrome

**Settings**
- Stored in `chrome.storage.sync` and `chrome.storage.local`
- Loaded before most operations via `Settings.onLoaded()`
- User-defined key mappings parsed and registered dynamically

**Frame Communication**
- Background script acts as message broker between frames
- Commands can be executed in specific frames via `chrome.tabs.sendMessage` with `frameId`
- Each frame learns its `frameId` from background during initialization

### Browser Compatibility

- Chrome/Chromium: manifest v3 with service worker
- Firefox: Uses scripts array in background (not service worker), requires modified manifest
- Firefox differences: hidden tabs support, clipboard permissions, SVG icons, different zoom levels

## Code Style & Conventions

- ES2018 language features only (to support older browsers)
- 100 character line width
- Uppercase first letter of comments, period at end
- Follow [Airbnb JavaScript style guide](https://github.com/airbnb/javascript)
- Run `deno fmt` before committing

## Testing Notes

- Unit tests run in Deno environment
- DOM tests run in Puppeteer-controlled Chrome
- Test files named `*_test.js`
- Use shoulda.js for test structure

## Common Debugging

- Enable `Mode.debug = true` in `mode.js` for mode activation traces
- Background page logging: check service worker console
- Content script logging: check page console
- `Utils.debugLog()` provides structured logging

## Installation from Source

**Chrome/Edge:**
1. Navigate to `chrome://extensions`
2. Enable Developer Mode
3. Load Unpacked Extension → select Vimium directory

**Firefox:**
1. Run `./make.js write-firefox-manifest`
2. Navigate to `about:debugging`
3. Load Temporary Add-on → select any file in Vimium directory
