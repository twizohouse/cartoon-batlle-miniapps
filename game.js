const tg = window.Telegram.WebApp;
tg.expand();

const user = tg.initDataUnsafe?.user;

const logDiv = document.getElementById("log");

if (user) {
  document.getElementById("user").innerText =
    Игрок: ${user.first_name};
}

function startBattle() {
  logDiv.innerHTML = `
    <p>⚔️ Бой начался!</p>
    <p>🗡️ Твой герой атакует</p>
    <p>🔥 Враг получает урон</p>
    <p>🏆 Победа!</p>
  `;
}
