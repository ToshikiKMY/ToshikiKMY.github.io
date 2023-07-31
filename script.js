// オーバーレイの開閉
const overlay = document.getElementById("overlay");
function overlayToggle() {
  overlay.classList.toggle("overlay-on");
}

// クリックイベントの設定
const clickArea = document.getElementsByClassName("overlay-event");
for (let i = 0; i < clickArea.length; i++) {
  clickArea[i].addEventListener("click", overlayToggle, false);
}

// バブリングの停止
function stopEvent(event) {
  event.stopPropagation();
}

const overlayInner = document.getElementById("overlay-inner");
overlayInner.addEventListener("click", stopEvent, false);
