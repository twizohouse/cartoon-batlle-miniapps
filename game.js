const tg = window.Telegram.WebApp;
tg.expand();

const user = tg.initDataUnsafe?.user;

if (user) {
  document.getElementById("user").innerText =
    Игрок: ${user.first_name};
} else {
  document.getElementById("user").innerText =
    "Открыто не из Telegram";
}

function startBattle() {
  alert("Бой начался! (заглушка)");
}