const tg = window.Telegram.WebApp;
tg.expand();

let playerHP = 50;
let enemyHP = 50;

const logDiv = document.getElementById("log");
const playerHpDiv = document.getElementById("player-hp");
const enemyHpDiv = document.getElementById("enemy-hp");

function updateUI() {
  playerHpDiv.innerText = `HP: ${playerHP}`;
  enemyHpDiv.innerText = `HP: ${enemyHP}`;
}

function nextTurn() {
  if (playerHP <= 0 || enemyHP <= 0) return;

  const playerDamage = random(5, 10);
  enemyHP -= playerDamage;

  logDiv.innerHTML += `<p>🟢 Ты ударил на ${playerDamage}</p>`;

  if (enemyHP <= 0) {
    enemyHP = 0;
    updateUI();
    logDiv.innerHTML += `<p>🏆 Победа!</p>`;
    return;
  }

  const enemyDamage = random(4, 8);
  playerHP -= enemyDamage;

  logDiv.innerHTML += `<p>🔴 Враг ударил на ${enemyDamage}</p>`;

  if (playerHP <= 0) {
    playerHP = 0;
    logDiv.innerHTML += `<p>❌ Поражение</p>`;
  }

  updateUI();
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

updateUI();
