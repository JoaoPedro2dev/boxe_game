const firstTime = JSON.parse(localStorage.getItem("firstTime"));
if (!firstTime?.firstTime) {
  window.location.href = "./onboarding/welcome.html";
}

const toContinue = JSON.parse(localStorage.getItem("dataSave"));

const cenarioBody = document.querySelector("#cenario");
const hitBox = document.querySelector("#hitBox");
const personagemImg = document.querySelector("#personagem img");
const punchBagImg = document.querySelector("#saco img");

const startBtn = document.querySelector("#start_btn");
const startBtnImg = document.querySelector("#start_btn img");
const remainingLivesHtml = document.querySelector("#remaining_lives");
const offensiveBox = document.querySelector("#points_suporte_icons");
const offensive = document.querySelector("#points_suporte_icons p");

const settingBtn = document.querySelector("#settings_btn");
const settingsView = document.querySelector("#settings_view");
const nextLevelLabel = document.querySelector("#settings_view p");
const nextLevelImg = document.querySelector("#settings_view img");
const deleteSaveGameBtn = document.querySelector("#delete-save-game");

const poinstViwer = document.querySelector("#points");
const hitsViwer = document.querySelector("#hits");
const wrongPunchesViwer = document.querySelector("#wrong_punches");

const redrawPunchBox = document.querySelector("#redraw-punch-box");

const screenWidth = window.innerWidth;

const playerImages = [
  "./images/player/base.webp",
  "./images/player/jab.webp",
  "./images/player/cross.webp",
  "./images/player/hook.webp",
  "./images/player/right-hook.webp",
  "./images/player/punched_1.webp",
  "./images/player/game_over_player.png",
];
const punchBagImages = [
  "./images/punchBag/punch_bag.webp",
  "./images/punchBag/punchBag_punched.webp",
  "./images/punchBag/bagAttack.webp",
];
const mobilePunchIndicator = [
  "./images/icons/mobile/left_arrow.png",
  "./images/icons/mobile/rigth_arrow.png",
  "./images/icons/mobile/up_arrow.png",
  "./images/icons/mobile/down_arrow.png",
];

const audioPunch = new Audio("./sounds/punch.mp3");
const punchGrunt = new Audio("../../sounds/punchGrunt_1.mp3");
const playerPunched = new Audio("../../sounds/punchedPlayer.mp3");
const punchBagPunche = new Audio("../../sounds/punch-bag-punch.mp3");
const gameOverPlayer = new Audio("../../sounds/game_over_grunt.mp3");
const morePoint = new Audio("../../sounds/more_point.mp3");
const losingCoin = new Audio("../../sounds/lose_coin.mp3");
const nextLevel = new Audio("../../sounds/next-level.mp3");

let isDisabled = false;
let isPaused = true;
let firstDraw = true;
let lucky = toContinue?.luckyStorage ?? false;
let PUNCH_SPEED = 500;
let correctPunchs = toContinue?.correctPunchsStorage ?? 0;
let wrongPunches = toContinue?.wrongPunchesStorage ?? 0;
let playerLife = toContinue?.playerLifeStorage ?? 5;
let points = toContinue?.pointsStorage ?? 0;
let scoreSupportCount = toContinue?.scoreSupportCountStorage ?? 0;
let nextCenario;

let luckyAttackHBox;
let luckyAttackHtml;
if (screenWidth < 1025) {
  luckyAttackHBox = document.querySelector("#punch_box_mobile");
  luckyAttackHtml = document.querySelector("#luckyAttack_mobile");
} else {
  luckyAttackHBox = document.querySelector("#punch_box");
  luckyAttackHtml = document.querySelector("#luckyAttack");
}

let landscapesImgaes = [];
if (screenWidth < 1025) {
  landscapesImgaes = [
    "./images/landscapes/mobile/cenario_1.webp",
    "./images/landscapes/mobile/cenario_2.webp",
    "./images/landscapes/mobile/cenario_3.webp",
    "./images/landscapes/mobile/cenario_4.webp",
    "./images/landscapes/mobile/cenario_5.webp",
  ];
} else {
  landscapesImgaes = [
    "./images/landscapes/cenario_1.webp",
    "./images/landscapes/cenario_2.webp",
    "./images/landscapes/cenario_3.webp",
    "./images/landscapes/cenario_4.webp",
    "./images/landscapes/cenario_5.webp",
  ];
}

let redrawTimer = null;
let REDRAW_TIMEOUT = 3000;

drawCenario();
drawRemainingLives();
drawOffensive();
poinstViwer.textContent = points;
hitsViwer.textContent = correctPunchs;
wrongPunchesViwer.textContent = wrongPunches;
window.addEventListener("beforeunload", saveGame);

startBtn.addEventListener("click", () => {
  pause();
});

settingBtn.addEventListener("click", () => {
  nextLevelLabel.textContent = nextCenario.label;
  nextLevelImg.src = nextCenario.img;

  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape") {
      settingsView.style.animation = "closeSettings 0.5s";

      setTimeout(() => {
        settingsView.style.animation = "0";
        settingsView.style.display = "none";
      }, 400);
    }
  });

  if (getComputedStyle(settingsView).display == "none") {
    settingsView.style.display = "flex";
    settingsView.style.animation = "openSettings 0.2s";
  } else {
    settingsView.style.animation = "closeSettings 0.5s";

    setTimeout(() => {
      settingsView.style.animation = "0";
      settingsView.style.display = "none";
    }, 400);
  }

  pause(true);
});

deleteSaveGameBtn.addEventListener("click", () => {
  if (window.confirm("Realmente deseja apagar seu histórico de jogo?")) {
    localStorage.removeItem("dataSave");
    localStorage.removeItem("firstTime");

    lucky = false;
    PUNCH_SPEED = 500;
    correctPunchs = 0;
    wrongPunches = 0;
    playerLife = 5;
    points = 0;
    scoreSupportCount = 0;

    drawCenario();
    drawRemainingLives();
    poinstViwer.textContent = points;
    hitsViwer.textContent = correctPunchs;
    wrongPunchesViwer.textContent = wrongPunches;
    drawOffensive();
    window.addEventListener("beforeunload", saveGame);
    window.location.href = "/onboarding/welcome.html";
  }
});

if (screenWidth > 1025) {
  document.addEventListener("keydown", function (evento) {
    if (!["1", "2", "3", "4"].includes(evento.key)) {
      return;
    }
    if (evento.repeat) return;

    if (isPaused) return;
    if (isDisabled) return;

    isDisabled = true;

    if (evento.key == lucky) {
      calcCorrectPunchMechanics(evento.key);
    } else {
      calcWrongPunchMechanics();
    }
  });
} else {
  let aplicadPunch;
  let startX, startY, endX, endY;

  hitBox.addEventListener(
    "touchstart",
    (e) => {
      if (isDisabled) e.preventDefault();
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
    },
    { passive: false },
  );

  hitBox.addEventListener(
    "touchend",
    (e) => {
      if (isPaused) return;
      if (isDisabled) return;

      isDisabled = true;

      const touch = e.changedTouches[0];
      endX = touch.clientX;
      endY = touch.clientY;

      const deltaX = startX - endX;
      const deltaY = startY - endY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          aplicadPunch = 1;
        } else {
          aplicadPunch = 2;
        }
      } else {
        if (deltaY > 0) {
          aplicadPunch = 3;
        } else {
          aplicadPunch = 4;
        }
      }

      if (aplicadPunch == lucky) {
        calcCorrectPunchMechanics(aplicadPunch);
      } else {
        calcWrongPunchMechanics();
      }
    },
    { passive: false },
  );
}

function calcCorrectPunchMechanics(punch) {
  executePunch(punch);

  correctPunchs++;
  hitsViwer.textContent = correctPunchs;

  scoreSupportCount++;

  drawOffensive();

  if (scoreSupportCount == 10) {
    points++;
    drawCenario();
    poinstViwer.textContent = points;
    scoreSupportCount = 0;
    drawOffensive();

    if (playerLife < 5) {
      playerLife++;
      drawRemainingLives();
      const Herts = document.querySelectorAll("#remaining_lives li");
      Herts.forEach((hert) => (hert.style.animation = "reviver 0.7s steps(1)"));
    }

    const pointCoin = document.createElement("img");
    pointCoin.src = "./images/icons/points_coin.png";
    pointCoin.classList.add("point_coin");
    morePoint.play();
    cenarioBody.appendChild(pointCoin);

    setTimeout(() => {
      pointCoin.remove();
    }, PUNCH_SPEED);
  }

  drawBlow();
}

function calcWrongPunchMechanics() {
  wrongPunches++;
  wrongPunchesViwer.textContent = wrongPunches;

  punchedWrong();
}

function pause(pauseByMneu) {
  if (pauseByMneu == true && isPaused == true) {
    return;
  }

  if (isPaused == true) {
    if (firstDraw) {
      drawBlow();
      firstDraw = false;
    }

    isPaused = false;
    luckyAttackHBox.style.display = "flex";
    redrawPunchBox.style.display = "block";
    startBtnImg.src = "./images/icons/pause-icon.png";

    startRedrawTimer();
  } else {
    luckyAttackHBox.style.display = "none";
    redrawPunchBox.style.display = "none";
    isPaused = true;
    startBtnImg.src = "./images/icons/play-icon.png";

    startRedrawTimer();
  }
}

function drawCenario() {
  if (points <= 10) {
    cenarioBody.style.backgroundImage = `url("./.${landscapesImgaes[0]}")`;

    nextCenario = {
      label: "Academia de bairro - Você está evoluindo!",
      img: landscapesImgaes[1],
      atual: 1,
    };
  } else if (points > 10 && points <= 20) {
    if (nextCenario?.atual < 2) newLevel();
    moreDifficult(400, 2500);

    cenarioBody.style.backgroundImage = `url("../.${landscapesImgaes[1]}")`;
    nextCenario = {
      label: "Centro de treinamento Profissional - mais difícil",
      img: landscapesImgaes[2],
      atual: 2,
    };
  } else if (points > 20 && points <= 30) {
    if (nextCenario?.atual < 3) newLevel();

    moreDifficult(300, 2000);

    cenarioBody.style.backgroundImage = `url("../.${landscapesImgaes[2]}")`;
    nextCenario = {
      label: "Elite GYM - Mais alto nível",
      img: landscapesImgaes[2],
      atual: 3,
    };
  } else if (points > 30 && points <= 40) {
    if (nextCenario?.atual < 4) newLevel();
    moreDifficult(200, 1500);

    cenarioBody.style.backgroundImage = `url("../.${landscapesImgaes[3]}")`;
    nextCenario = {
      label: "Arena de campeonato - Foco máximo!",
      img: landscapesImgaes[3],
      atual: 4,
    };
  } else if (points > 40) {
    if (nextCenario?.atual < 5) newLevel();
    moreDifficult(100, 1000);

    cenarioBody.style.backgroundImage = `url("../.${landscapesImgaes[4]}")`;
    nextCenario = {
      label: "Você alcançou a Arena de Campeonato!",
      img: "./images/icons/first-place.webp",
      atual: 5,
    };
  }
}

function moreDifficult(punch = 500, redraw = 3000) {
  PUNCH_SPEED = punch;
  REDRAW_TIMEOUT = redraw;
}

function newLevel() {
  nextLevel.currentTime = 0;
  nextLevel.play();
}

function executePunch(key) {
  audioPunch.currentTime = 0;
  audioPunch.play();

  punchGrunt.currentTime = 0;
  punchGrunt.play();

  personagemImg.src = playerImages[Number(key)];
  punchBagImg.src = punchBagImages[1];

  setTimeout(() => {
    defaultPlayer();
  }, PUNCH_SPEED);
}

function punchedWrong() {
  playerPunched.play();
  punchBagPunche.play();

  personagemImg.src = playerImages[5];
  punchBagImg.src = punchBagImages[2];

  scoreSupportCount = 0;
  drawOffensive();

  if (playerLife > 0) {
    playerLife--;
    const lastHert = document.querySelector("#remaining_lives li:last-child");
    lastHert.style.animation = "reviver 0.7s steps(1)";

    setTimeout(() => {
      drawRemainingLives();
    }, 1000);
  }

  if (playerLife < 1) {
    gameOver();
    return;
  }

  setTimeout(() => {
    defaultPlayer();
    startRedrawTimer();
  }, 1000);
}

function drawBlow() {
  lucky = Math.floor(Math.random() * 4) + 1;

  if (screenWidth > 1024) {
    luckyAttackHtml.textContent = lucky;
  } else {
    luckyAttackHtml.src = mobilePunchIndicator[lucky - 1];
  }

  luckyAttackHtml.style.animation = "spawn 0.2s";

  setTimeout(() => {
    luckyAttackHtml.style.animation = "none";
  }, 200);

  startRedrawTimer();
}

function startRedrawTimer() {
  clearTimeout(redrawTimer);
  restartTimerBar();

  redrawTimer = setTimeout(() => {
    if (!isPaused && !isDisabled) {
      drawBlow();
    }
  }, REDRAW_TIMEOUT);
}

function stopRedrawTimer() {
  clearTimeout(redrawTimer);
  redrawTimer = null;

  const redrawBar = document.querySelector("#timer-redraw-punch");
  redrawBar.style.animation = "none";
}

function restartTimerBar() {
  const redrawBar = document.querySelector("#timer-redraw-punch");

  redrawBar.style.animation = "none";
  redrawBar.offsetWidth;
  redrawBar.style.animation = `redraw ${REDRAW_TIMEOUT}ms linear forwards`;
}

function drawOffensive() {
  if (scoreSupportCount < 1) {
    offensiveBox.style.display = "none";
  } else {
    offensiveBox.style.display = "flex";
  }

  offensive.textContent = scoreSupportCount;
}

function drawRemainingLives() {
  remainingLivesHtml.innerHTML = "";

  for (let i = 0; i < playerLife; i++) {
    const li = document.createElement("li");
    const img = document.createElement("img");
    img.src = "./images/icons/hert_icon.png";
    li.appendChild(img);
    remainingLivesHtml.appendChild(li);
  }
}

function defaultPlayer(revive) {
  personagemImg.src = playerImages[0];
  punchBagImg.src = punchBagImages[0];

  personagemImg.style.animation = "none";
  isDisabled = false;
}

function gameOver() {
  if (points > 0) {
    points--;
    poinstViwer.textContent = points;
    drawCenario();

    const pointCoin = document.createElement("img");
    pointCoin.src = "./images/icons/points_coin.png";
    pointCoin.classList.add("lose_point_coin");
    losingCoin.play();
    cenarioBody.appendChild(pointCoin);
  }

  gameOverPlayer.play();
  personagemImg.src = playerImages[6];
  punchBagImg.src = punchBagImages[2];

  personagemImg.style.animation = "reviver 0.30s steps(1)";

  setTimeout(() => {
    isDisabled = false;
    defaultPlayer();
    drawRemainingLives();
  }, 2000);

  playerLife = 5;
}

function saveGame() {
  const savedGame = {
    luckyStorage: lucky,
    correctPunchsStorage: correctPunchs,
    wrongPunchesStorage: wrongPunches,
    playerLifeStorage: playerLife,
    pointsStorage: points,
    scoreSupportCountStorage: scoreSupportCount,
    noFirstTime: true,
  };

  localStorage.setItem("dataSave", JSON.stringify(savedGame));
}
