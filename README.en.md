[한국어](./README.md) | **English**

# Kkamodoro

A pomodoro timer with **Kkami**, a black poodle.
Focus for 25 minutes, rest for 5, and repeat. After 4 focus sessions, you earn a Kkami certificate.

> There's no hosted site yet. For now, you can [run it on your computer](#getting-started).

<!--
Screenshots: put the images in docs/images/ and uncomment the lines below.
<p>
  <img src="./docs/images/timer.en.png" alt="Timer" width="640" />
  <img src="./docs/images/calendar.en.png" alt="Calendar and stats" width="640" />
  <img src="./docs/images/certificate.en.png" alt="Kkami certificate" width="240" />
</p>
-->

## Features

- **Timer**: focus, short break and long break. Change the durations and how often long breaks come in Settings. Auto-start (starts after 5 seconds, stops at the end of a cycle), a progress ring with paw stamps, and the time left in the browser tab title.
- **Tasks**: set how many focus sessions you expect a task to take with 🐾, and each finished session adds one. Reorder by dragging (mouse, touch or keyboard) and clear completed tasks.
- **Focus sounds**: 3 kinds of noise (white, pink, brown), 5 nature sounds (rain, rain on window, fireplace, forest, waves) and a place sound (airplane cabin). They play only while you focus, and "Random" picks a different one each session.
- **Calendar and stats**: daily focus count, time and finished tasks, plus your streak, the last 7 days, this month and all-time totals.
- **Kkami certificate**: finish a cycle and save or share that day's certificate as an image (1080×1920, Instagram story size).
- **Alerts**: a chime when a session ends, and a browser notification if you're in another tab.
- **Keyboard shortcuts**: `Space` start / pause, `R` reset, `N` next session, `S` settings.
- **Also**: dark mode, Korean / English, a first-visit intro and a guide page (`/guide`), keep screen on while the timer runs, and one shared timer across tabs.

### Where is my data saved?

Your tasks, history and settings are saved **only in this browser (localStorage)**. Nothing is sent to a server, and there's no sync between devices yet. Clearing your browser data also deletes your history.

The pet care prototype is available at `/pet` on the development server. Pet pixel Kkami to see a happy reaction before returning to idle. Pat counts aren't saved, and timer rewards aren't connected yet. [Implementation and asset guide (Korean)](./docs/07-pet-prototype.md)

## Getting started

You need [Node.js](https://nodejs.org) **22.12 or later**.

```bash
git clone https://github.com/WonTaeJang/pomodoro-routine.git
cd pomodoro-routine
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

| Command                      | What it does             |
| ---------------------------- | ------------------------ |
| `npm run dev`                | Development server       |
| `npm run build`, `npm start` | Production build and run |
| `npm run test:run`           | Tests (Vitest)           |
| `npm run lint`               | Lint (ESLint)            |
| `npm run format:check`       | Format check (Prettier)  |

During development, add `?test=5` to the address to make every session 5 seconds long (`?test=off` turns it off). See the [setup guide](./docs/05-setup.md) (in Korean) for more.

## Tech stack

| Area      | What's used                                                                                 |
| --------- | ------------------------------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router), React 19, TypeScript                                               |
| Styling   | SCSS Modules + design tokens, [Pretendard](https://github.com/orioncactus/pretendard) font  |
| State     | Zustand (saved to localStorage, synced across tabs)                                         |
| i18n      | use-intl (Korean, English)                                                                  |
| Other     | dnd-kit (drag to reorder), Web Audio API (alerts, focus sounds), Canvas (certificate image) |
| Tests     | Vitest                                                                                      |

## Docs

The docs are written in Korean.

- [Doc index](./docs/README.md): planning, decision log, setup, design system
- [Changelog](./CHANGELOG.md)
- [Bug and improvement backlog](./docs/backlog.md)
- [Commit and versioning rules](./docs/commit.md)

## Credits

- Nature sound recordings: [Pixabay](https://pixabay.com) ([Pixabay Content License](https://pixabay.com/service/terms/)). The source of each sound is listed under "집중 소리" (focus sounds) in the [decision log](./docs/03-decisions.md#집중-소리-2026-11-08).

## License

The code is under the [MIT License](./LICENSE). The following are not covered by it:

- **Photos of Kkami** (`src/assets/kkami/`), **mascot illustrations** (`src/assets/mascot/`) and screenshots that include them (`docs/images/`): may not be used, modified or distributed without permission.
- **Focus sound recordings** (`public/sounds/`): edited from Pixabay recordings, so they stay under the [Pixabay Content License](https://pixabay.com/service/terms/) and may not be redistributed as standalone files.
