// ===== Dice Roller =====
// When you click "Roll": pick a random number (1–6) for each die, play a short
// shake animation, then show the final faces and update total, history and stats.

// ---------- 1. Get elements from the page (by their id) ----------
const diceArea = document.getElementById("dice-area");
const diceCountSelect = document.getElementById("dice-count");
const rollBtn = document.getElementById("roll-btn");
const totalEl = document.getElementById("total");
const historyList = document.getElementById("history-list");
const clearBtn = document.getElementById("clear-btn");
const rollCountEl = document.getElementById("roll-count");
const averageEl = document.getElementById("average");
const chartEl = document.getElementById("chart");
const themeBtn = document.getElementById("theme-btn");

// ---------- 2. Settings ----------
const MAX_HISTORY = 10;        // how many past rolls to keep
const ANIMATION_TIME = 600;    // roll animation length in milliseconds
const FACE_CHANGE_SPEED = 80;  // during animation, change faces every 80 ms

// Where the dots go on a 3x3 grid. Cells are numbered like this:
//   1 2 3
//   4 5 6
//   7 8 9
const PIP_POSITIONS = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
};

// ---------- 3. Data (the "state" of the app) ----------
let history = [];               // e.g. [{ values: [3, 5], total: 8 }, ...]
let counts = [0, 0, 0, 0, 0, 0]; // counts[0] = how many 1s, counts[5] = how many 6s
let isRolling = false;          // stops double-clicks during the animation

// ---------- 4. Randomness ----------
// Math.random() gives a decimal from 0 (included) to 1 (not included).
// Multiply by 6 -> 0 to 5.999..., Math.floor -> 0,1,2,3,4,5, then +1 -> 1 to 6.
// Every number has an equal 1/6 chance, so the dice are fair.
function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function randomValues(howMany) {
  const values = [];
  for (let i = 0; i < howMany; i++) {
    values.push(rollDie());
  }
  return values;
}

// ---------- 5. Drawing the dice ----------
// Builds one die element with the right number of dots.
function createDie(value) {
  const die = document.createElement("div");
  die.className = "die";
  die.setAttribute("aria-label", "Die showing " + value);

  for (const pos of PIP_POSITIONS[value]) {
    const pip = document.createElement("span");
    pip.className = "pip";
    pip.style.gridRow = Math.ceil(pos / 3);         // which row (1–3)
    pip.style.gridColumn = ((pos - 1) % 3) + 1;     // which column (1–3)
    die.appendChild(pip);
  }
  return die;
}

// Clears the dice area and draws one die for each value.
function showDice(values) {
  diceArea.innerHTML = "";
  for (const value of values) {
    diceArea.appendChild(createDie(value));
  }
}

// ---------- 6. Rolling ----------
function roll() {
  if (isRolling) return;   // ignore clicks while already rolling
  isRolling = true;
  rollBtn.disabled = true;

  const numberOfDice = Number(diceCountSelect.value);
  diceArea.classList.add("rolling");   // starts the CSS shake animation
  totalEl.textContent = "…";

  // Show random faces quickly so it looks like the dice are tumbling
  const timer = setInterval(() => {
    showDice(randomValues(numberOfDice));
  }, FACE_CHANGE_SPEED);

  // After the animation time, stop and show the real result
  setTimeout(() => {
    clearInterval(timer);
    diceArea.classList.remove("rolling");

    const finalValues = randomValues(numberOfDice);
    showDice(finalValues);
    saveResult(finalValues);

    isRolling = false;
    rollBtn.disabled = false;
  }, ANIMATION_TIME);
}

// Updates total, history and statistics with a finished roll.
function saveResult(values) {
  const total = values.reduce((sum, v) => sum + v, 0);
  totalEl.textContent = total;

  for (const v of values) {
    counts[v - 1]++;
  }

  history.unshift({ values: values, total: total }); // add to the start
  if (history.length > MAX_HISTORY) {
    history.pop();                                   // remove the oldest
  }

  saveData();
  renderHistory();
  renderStats();
}

// ---------- 7. History list ----------
function renderHistory() {
  historyList.innerHTML = "";

  if (history.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "No rolls yet. Click Roll!";
    historyList.appendChild(li);
    return;
  }

  for (const entry of history) {
    const li = document.createElement("li");
    li.textContent = entry.values.length > 1
      ? entry.values.join(" + ") + " = " + entry.total
      : "Rolled " + entry.total;
    historyList.appendChild(li);
  }
}

// ---------- 8. Statistics + bar chart ----------
function renderStats() {
  const diceRolled = counts.reduce((a, b) => a + b, 0);
  const sumOfAll = counts.reduce((acc, count, i) => acc + count * (i + 1), 0);

  rollCountEl.textContent = diceRolled;
  averageEl.textContent = diceRolled > 0 ? (sumOfAll / diceRolled).toFixed(2) : "–";

  // The tallest bar = 100% height; the others are scaled relative to it
  const maxCount = Math.max(...counts, 1);
  chartEl.innerHTML = "";

  counts.forEach((count, i) => {
    const col = document.createElement("div");
    col.className = "bar-col";

    const countLabel = document.createElement("span");
    countLabel.className = "bar-count";
    countLabel.textContent = count;

    const track = document.createElement("div");
    track.className = "bar-track";
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = (count / maxCount) * 100 + "%";
    track.appendChild(bar);

    const faceLabel = document.createElement("span");
    faceLabel.className = "bar-label";
    faceLabel.textContent = i + 1;

    col.append(countLabel, track, faceLabel);
    chartEl.appendChild(col);
  });
}

// ---------- 9. Saving in the browser (localStorage) ----------
// localStorage keeps data even after you refresh or close the tab.
// It only stores text, so we convert our data with JSON.stringify / JSON.parse.
// try/catch is used because localStorage can be blocked in some browsers.
function saveData() {
  try {
    localStorage.setItem("diceData", JSON.stringify({ history, counts }));
  } catch (e) {
    // If saving fails, the app still works; data just won't be remembered.
  }
}

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem("diceData"));
    if (saved) {
      history = saved.history || [];
      counts = saved.counts || [0, 0, 0, 0, 0, 0];
    }
  } catch (e) {
    // Ignore bad or missing data and start fresh
  }
}

function clearAll() {
  history = [];
  counts = [0, 0, 0, 0, 0, 0];
  totalEl.textContent = "–";
  saveData();
  renderHistory();
  renderStats();
}

// ---------- 10. Dark / light theme ----------
function setTheme(theme) {
  document.body.dataset.theme = theme;   // sets <body data-theme="...">
  themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
  try {
    localStorage.setItem("diceTheme", theme);
  } catch (e) {}
}

// ---------- 11. Connect buttons to functions ----------
rollBtn.addEventListener("click", roll);
clearBtn.addEventListener("click", clearAll);

themeBtn.addEventListener("click", () => {
  const next = document.body.dataset.theme === "dark" ? "light" : "dark";
  setTheme(next);
});

// When the number of dice changes, show that many dice (all showing 1)
diceCountSelect.addEventListener("change", () => {
  showDice(new Array(Number(diceCountSelect.value)).fill(1));
  totalEl.textContent = "–";
});

// Space bar also rolls
document.addEventListener("keydown", (event) => {
  if (event.code === "Space" && document.activeElement !== diceCountSelect) {
    event.preventDefault();   // stop the page from scrolling
    roll();
  }
});

// ---------- 12. Start the app ----------
loadData();

let savedTheme = "light";
try {
  savedTheme = localStorage.getItem("diceTheme") || "light";
} catch (e) {}
setTheme(savedTheme);

showDice(new Array(Number(diceCountSelect.value)).fill(1));
renderHistory();
renderStats();
