const screenWidth = window.innerWidth;
const slides = document.querySelectorAll(".slide");
const nextBtns = document.querySelectorAll(".next-btn");
const prevBtn = document.querySelectorAll(".prev-btn");
const progressBar = document.querySelector(".progress-bar");
const finishBtn = document.querySelector("#finish-btn");
const canMobile = document.querySelectorAll(".can-mobile");

if (screenWidth < 768) {
  canMobile[0].textContent =
    "Utilize o botão ▶ localizado no canto superior esquerdo para iniciar ou pausar a partida quando desejar.";

  canMobile[1].textContent =
    "Durante o combate, uma seta ➡️ será exibido no centro da tela. Você deverá arrastar a tela na direção correspondente antes que o tempo termine.";

  canMobile[2].textContent = "Utilize o toque na tela para executar os golpes:";

  canMobile[3].innerHTML = `
      🥊 <strong>⬅️</strong> → Jab<br />
      🥊 <strong>➡️</strong> → Direto<br />
      🥊 <strong>⬆️</strong> → Cruzado de esquerda<br />
      🥊 <strong>⬇️</strong> → Cruzado de direita`;
}

let i = 0;
drawSlides();

nextBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    i++;
    drawSlides();
  });
});

prevBtn.forEach((prev) => {
  prev.addEventListener("click", () => {
    i--;
    drawSlides();
  });
});

finishBtn.addEventListener("click", () => {
  localStorage.setItem(
    "firstTime",
    JSON.stringify({
      firstTime: true,
    }),
  );

  window.location.href = "../index.html";
});

function drawSlides() {
  slides.forEach((slide) => slide.classList.remove("active"));
  slides[i].classList.add("active");

  const progress = ((i + 1) / slides.length) * 100;
  progressBar.style.width = `${progress}%`;
}
