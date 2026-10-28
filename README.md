# 🎲 Dice Roller

An interactive dice rolling website built with HTML, CSS and JavaScript.
Submitted for the Programming Club (IIT Indore) Software Division Volunteer Induction — Problem Statement 1.

**Live demo:** https://YOUR-USERNAME.github.io/dice-roll/

## Features

- Roll 1 to 6 dice at once with one click (or the Space bar)
- Dice faces drawn with CSS (dots placed on a 3×3 grid), not just numbers
- Shake animation with tumbling faces before the result appears
- Total of all dice shown after each roll
- History of the last 10 rolls (latest highlighted)
- Statistics: number of dice rolled, average value, and a bar chart of how often each number appeared
- Dark / light theme toggle
- History, stats and theme are saved in localStorage, so they stay after refreshing
- Responsive design that works on mobile and desktop

## Tech Stack

- HTML5 – page structure
- CSS3 – styling, CSS Grid for dice dots, keyframe animation, CSS variables for theming
- JavaScript (vanilla) – logic, DOM updates, localStorage
- GitHub Pages – hosting

## How the randomness works

Each die uses:

```js
Math.floor(Math.random() * 6) + 1
```

`Math.random()` returns a decimal between 0 (included) and 1 (not included). Multiplying by 6 gives a value from 0 up to 5.999…, `Math.floor` rounds it down to 0–5, and adding 1 gives 1–6. Each number has an equal 1/6 chance, so the dice are unbiased. The statistics chart lets you check this: after many rolls, the bars become roughly equal.

## Setup / Run locally

1. Clone the repository:
   ```
   git clone https://github.com/YOUR-USERNAME/dice-roll.git
   ```
2. Open the folder and double-click `index.html`, or open it with the Live Server extension in VS Code.

No installation or build step is needed.

## Project Structure

```
dice-roll/
├── index.html   # page structure
├── style.css    # styling, dice design, animation, dark mode
├── script.js    # rolling logic, history, stats, saving
└── README.md
```

## Screenshots

![Light mode](screenshots/light.png)
![Dark mode](screenshots/dark.png)
