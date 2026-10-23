const STORAGE_KEY = "selbiges-used-indices";

const layoutEl = document.querySelector(".layout");
const line1El = document.getElementById("line1");
const line2El = document.getElementById("line2");
const nextBtn = document.getElementById("next-btn");
const endPanelEl = document.getElementById("end-panel");
const newGameBtn = document.getElementById("new-game-btn");

let lines = [];

function loadUsedIndices() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function saveUsedIndices(usedIndices) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(usedIndices));
}

// Returns a random pair of unused lines, or null when fewer than two
// unused lines remain (the deck is exhausted and needs a reset).
function pickRandomPair() {
	const used = new Set(loadUsedIndices());
	const available = lines.map((_, i) => i).filter((i) => !used.has(i));

	if (available.length < 2) {
		return null;
	}

	const first = available[Math.floor(Math.random() * available.length)];
	let second = first;
	while (second === first) {
		second = available[Math.floor(Math.random() * available.length)];
	}

	used.add(first);
	used.add(second);
	saveUsedIndices([...used]);

	return [lines[first], lines[second]];
}

function showGameOver() {
	nextBtn.disabled = true;
	endPanelEl.hidden = false;
}

function showNextPair() {
	if (lines.length < 2) {
		line1El.textContent = "Nicht genug Zeilen vorhanden.";
		line2El.textContent = "";
		nextBtn.disabled = true;
		return;
	}
	const pair = pickRandomPair();
	if (!pair) {
		showGameOver();
		return;
	}
	const [a, b] = pair;
	line1El.textContent = a;
	line2El.textContent = b;
	layoutEl.classList.toggle("flipped");
}

function startNewGame() {
	saveUsedIndices([]);
	endPanelEl.hidden = true;
	nextBtn.disabled = false;
	showNextPair();
}

async function init() {
	try {
		const response = await fetch("kategorien.txt");
		const text = await response.text();
		lines = text
			.split("\n")
			.map((l) => l.trim())
			.filter((l) => l.length > 0);
	} catch (err) {
		line1El.textContent = "Fehler beim Laden der Kategorien.";
		nextBtn.disabled = true;
		return;
	}
	showNextPair();
}

nextBtn.addEventListener("click", showNextPair);
newGameBtn.addEventListener("click", startNewGame);

init();

if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker.register("service-worker.js").catch(() => { });
	});
}
