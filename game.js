const tg = window.Telegram.WebApp;
tg.expand();

const logDiv = document.getElementById("log");
const playerHpDiv = document.getElementById("player-hp");
const enemyHpDiv = document.getElementById("enemy-hp");

const playerUnits = [
  { name: "Бобо-Воин", hp: 40, damage: 6, type: "warrior" },
  { name: "Фаер-Имп", hp: 30, damage: 8, type: "mage" },
  { name: "Док-Слайм", hp: 35, damage: 3, type: "support" }
];

const enemyUnits = [
  { name: "Призрак Буу", hp: 30, damage: 5, type: "chaos" },
  { name: "Плюш-Лучник", hp: 28, damage: 7, type: "range" },
  { name: "Фрости", hp: 30, damage: 6, type: "mage" }
];

// Функция для подсчета бонуса синергии
function getSynergyBonus(units) {
  const count = {};
  units.forEach(u => {
    count[u.type] = (count[u.type] || 0) + 1;
  });

  const bonus = {};
  for (let type in count) {
    if (count[type] >= 2) bonus[type] = 1.1;
    if (count[type] >= 3) bonus[type] = 1.2;
  }
  return bonus;
}

function updateUI() {
  playerHpDiv.innerHTML = playerUnits.map(u =>
    `${u.name}: ${Math.max(u.hp,0)} HP`
  ).join("<br>");

  enemyHpDiv.innerHTML = enemyUnits.map(u =>
    `${u.name}: ${Math.max(u.hp,0)} HP`
  ).join("<br>");
}

// Функция одного хода
function performTurn() {
  if (playerUnits.every(u => u.hp <= 0) || enemyUnits.every(u => e.hp <= 0)) return;

  const playerBonus = getSynergyBonus(playerUnits);
  const enemyBonus = getSynergyBonus(enemyUnits);

  // Ход игрока
  playerUnits.forEach(u => {
    if (u.hp <= 0) return;
    const target = enemyUnits.find(e => e.hp > 0);
    if (!target) return;

    let dmg = u.damage;
    if (playerBonus[u.type]) dmg = Math.floor(dmg * playerBonus[u.type]);
    target.hp -= dmg;
    logDiv.innerHTML += `<p>🟢 ${u.name} ударил ${target.name} на ${dmg}</p>`;
  });

  if (enemyUnits.every(e => e.hp <= 0)) {
    logDiv.innerHTML += `<p>🏆 Победа!</p>`;
    clearInterval(autoBattle);
    updateUI();
    return;
  }

  // Ход врага
  enemyUnits.forEach(u => {
    if (u.hp <= 0) return;
    const target = playerUnits.find(p => p.hp > 0);
    if (!target) return;

    let dmg = u.damage;
    if (enemyBonus[u.type]) dmg = Math.floor(dmg * enemyBonus[u.type]);
    target.hp -= dmg;
    logDiv.innerHTML += `<p>🔴 ${u.name} ударил ${target.name} на ${dmg}</p>`;
  });

  if (playerUnits.every(p => p.hp <= 0)) {
    logDiv.innerHTML += `<p>❌ Поражение</p>`;
    clearInterval(autoBattle);
  }

  updateUI();
}

updateUI();

// Запускаем автоход каждые 1.2 секунды
const autoBattle = setInterval(performTurn, 1200);
