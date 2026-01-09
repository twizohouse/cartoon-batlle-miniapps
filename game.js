const tg = window.Telegram.WebApp;
tg.expand();

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const logDiv = document.getElementById("log");

const playerUnits = [
  { name: "Бобо", x: 100, y: 500, hp: 40, maxHp: 40, damage: 6, type: "warrior", color: "#00ff00", shake: 0 },
  { name: "Фаер", x: 200, y: 500, hp: 30, maxHp: 30, damage: 8, type: "mage", color: "#ff6600", shake: 0 },
  { name: "Док", x: 300, y: 500, hp: 35, maxHp: 35, damage: 3, type: "support", color: "#00ffff", shake: 0 }
];

const enemyUnits = [
  { name: "Буу", x: 100, y: 100, hp: 30, maxHp: 30, damage: 5, type: "chaos", color: "#ff00ff", shake: 0 },
  { name: "Лучник", x: 200, y: 100, hp: 28, maxHp: 28, damage: 7, type: "range", color: "#ffff00", shake: 0 },
  { name: "Фрости", x: 300, y: 100, hp: 30, maxHp: 30, damage: 6, type: "mage", color: "#ffffff", shake: 0 }
];

let projectiles = [];
let effects = [];
let particles = [];

// Синергии
function getSynergyBonus(units){
  const count = {};
  units.forEach(u=>count[u.type]=(count[u.type]||0)+1);
  const bonus = {};
  for(let t in count){
    if(count[t]>=2) bonus[t]=1.1;
    if(count[t]>=3) bonus[t]=1.2;
  }
  return bonus;
}

// Снаряд по дуге
function shoot(from,to,damage,color="#ffff00"){
  projectiles.push({
    x: from.x,
    y: from.y,
    startX: from.x,
    startY: from.y,
    target: to,
    damage: damage,
    t: 0,
    color: color,
    curve: Math.random()*50+30
  });
}

// Частицы (эффект полёта)
function spawnParticles(x,y,color){
  for(let i=0;i<5;i++){
    particles.push({
      x:x,
      y:y,
      vx:Math.random()*2-1,
      vy:Math.random()*2-1,
      radius:2+Math.random()*2,
      color:color,
      life:20
    });
  }
}

// Обновление снарядов
function updateProjectiles(){
  projectiles.forEach((p,i)=>{
    p.t+=0.03;
    const dx = p.target.x - p.startX;
    const dy = p.target.y - p.startY;
    p.x = p.startX + dx*p.t;
    p.y = p.startY + dy*p.t - p.curve*Math.sin(Math.PI*p.t);

    spawnParticles(p.x,p.y,p.color);

    if(p.t>=1){
      p.target.hp-=p.damage;
      logDiv.innerHTML += `<p style="color:${p.color}">${p.target.name} получил ${p.damage}</p>`;
      effects.push({x:p.target.x,y:p.target.y,radius:5,maxRadius:25});
      p.target.shake = 5;
      projectiles.splice(i,1);
    }
  });
}

// Обновление эффектов
function updateEffects(){
  effects.forEach((e,i)=>{
    e.radius+=2;
    if(e.radius>=e.maxRadius) effects.splice(i,1);
  });

  particles.forEach((p,i)=>{
    p.x+=p.vx;
    p.y+=p.vy;
    p.life--;
    if(p.life<=0) particles.splice(i,1);
  });
}

// Рисуем эффекты
function drawEffects(){
  effects.forEach(e=>{
    ctx.fillStyle = `rgba(255,165,0,${1-e.radius/e.maxRadius})`;
    ctx.beginPath();
    ctx.arc(e.x,e.y,e.radius,0,Math.PI*2);
    ctx.fill();
  });

  particles.forEach(p=>{
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.radius,0,Math.PI*2);
    ctx.fill();
  });
}

// Рисуем юнит
function drawUnit(u){
  if(u.hp<=0) return;
  const shakeOffset = Math.random()*u.shake*2 - u.shake;
  ctx.fillStyle = u.color;
  ctx.beginPath();
  ctx.arc(u.x+shakeOffset,u.y,20,0,Math.PI*2);
  ctx.fill();
  ctx.fillStyle="#ff0000";
  ctx.fillRect(u.x-20,u.y-30,40,5);
  ctx.fillStyle="#00ff00";
  ctx.fillRect(u.x-20,u.y-30,40*(Math.max(u.hp,0)/u.maxHp),5);
  if(u.shake>0) u.shake--;
}

// Рисуем снаряды
function drawProjectiles(){
  projectiles.forEach(p=>{
    ctx.fillStyle=p.color;
    ctx.beginPath();
    ctx.arc(p.x,p.y,5,0,Math.PI*2);
    ctx.fill();
  });
}

// Рисуем всё
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  playerUnits.forEach(drawUnit);
  enemyUnits.forEach(drawUnit);
  drawProjectiles();
  drawEffects();
}

// Автоход
function performTurn(){
  const playerBonus = getSynergyBonus(playerUnits);
  const enemyBonus = getSynergyBonus(enemyUnits);

  playerUnits.forEach(u=>{
    if(u.hp<=0) return;
    const target = enemyUnits.find(e=>e.hp>0);
    if(!target) return;
    let dmg = u.damage;
    if(playerBonus[u.type]) dmg = Math.floor(dmg*playerBonus[u.type]);
    shoot(u,target,dmg,u.color);
  });

  enemyUnits.forEach(u=>{
    if(u.hp<=0) return;
    const target = playerUnits.find(p=>p.hp>0);
    if(!target) return;
    let dmg = u.damage;
    if(enemyBonus[u.type]) dmg = Math.floor(dmg*enemyBonus[u.type]);
    shoot(u,target,dmg,u.color);
  });
}

// Главный цикл
function gameLoop(){
  updateProjectiles();
  updateEffects();
  draw();

  if(playerUnits.every(u=>u.hp<=0)){
    logDiv.innerHTML += "<p>❌ Поражение</p>";
    clearInterval(autoBattle);
    return;
  }
  if(enemyUnits.every(e=>e.hp<=0)){
    logDiv.innerHTML += "<p>🏆 Победа!</p>";
    clearInterval(autoBattle);
    return;
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
const autoBattle = setInterval(performTurn,1500);
