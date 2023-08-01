"use strict";
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

// グラフ作成-------------------------------------------------
let red = document.getElementById("slider_a").value; // sliderの値を取得
let green = document.getElementById("slider_b").value;
let blue = document.getElementById("slider_c").value;

const ctx = document.getElementById("myChart");
let myChart = new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: ["Red", "Green", "Blue"],
    datasets: [
      {
        data: [red, green, blue],
        backgroundColor: ["#f88", "#484", "#48f"],
        weight: 100,
      },
    ],
  },
});

let sliders = document.getElementById("sliders");
sliders.addEventListener(
  "input",
  function () {
    let a = document.getElementById("slider_a").value; // sliderの値を取得
    let b = document.getElementById("slider_b").value;
    let c = document.getElementById("slider_c").value;
    document.getElementById("val_a").textContent = a; // 取得した値を"#val_a"のテキストに表示
    document.getElementById("val_b").textContent = b;
    document.getElementById("val_c").textContent = c;
    console.log(myChart);
    myChart.data.datasets[0].data = [Number(a), Number(b), Number(c)]; // プロットのy座標のデータを新しいもので置き換える。
    myChart.update(); // 新しいデータを反映させる
  },
  false
);

//minesweeper--------------------------------------------
let field = []; //マス
let vertical, horizontal, settedBombs, remainingBombs;

// 爆弾をランダムに設置
const putBomb = function () {
  for (let i = 0; i < settedBombs; i++) {
    while (true) {
      const y = Math.floor(Math.random() * vertical);
      const x = Math.floor(Math.random() * horizontal);
      if (field[y][x] === 0) {
        field[y][x] = 1;
        break;
      }
    }
  }
};

// マスの周りの爆弾の数を数える
function countBomb(y, x) {
  let aroundBombs = 0;
  for (let i = y - 1; i <= y + 1; i++) {
    for (let j = x - 1; j <= x + 1; j++) {
      if (i >= 0 && i < vertical && j >= 0 && j < horizontal) {
        if (field[i][j] === 1) {
          aroundBombs++;
        }
      }
    }
  }
  return aroundBombs;
}

// 左クリック マスを空ける
const primaryClicked = function () {
  const y = this.parentNode.rowIndex;
  const x = this.cellIndex;
  // 空いているマス、旗のマスは何もしない
  if (this.className === "open" || this.className === "flag") {
    return;
  }

  // 一手目か確認
  if (!field.length) {
    for (let i = 0; i < vertical; i++) {
      field[i] = Array(horizontal).fill(0); // 0埋めして箱を作る
    }
    putBomb();
  }

  // 爆弾を踏んだか判定
  if (field[y][x] === 1) {
    for (let i = 0; i < vertical; i++) {
      for (let j = 0; j < horizontal; j++) {
        if (field[i][j] === 1) {
          board.rows[i].cells[j].classList.add("bomb");
        }
      }
    }
    board.style.pointerEvents = "none";
    result.textContent = "GAME OVER";
    return;
  }

  let aroundBombs = countBomb(y, x);
  if (aroundBombs === 0) {
    open(y, x);
  } else {
    this.textContent = aroundBombs;
    this.classList.add("open");
  }

  // クリア判定
  if (countOpenCell()) {
    for (let i = 0; i < vertical; i++) {
      for (let j = 0; j < horizontal; j++) {
        if (field[i][j] === 1) {
          board.rows[i].cells[j].classList.add("clear");
        }
      }
    }
    board.style.pointerEvents = "none";
    result.textContent = "CLEAR!!";
    return;
  }
};

// startボタン押したときの初期化関数
const init = function () {
  vertical = Number(document.getElementById("vertical").value); //縦マス
  horizontal = Number(document.getElementById("horizontal").value); // 横のマスの数
  settedBombs = Number(document.getElementById("setted-bombs").value);

  if (vertical * horizontal < settedBombs) {
    message.testContent = "爆弾の数が多すぎます";
    return;
  }

  field = [];
  remainingBombs = settedBombs;
  board.innerHTML = "";
  board.style.pointerEvents = "auto";
  messageNumBombs.textContent = `残り: ${settedBombs}個`;
  button.textContent = "reset";
  result.textContent = "";

  // 配列を表で吐き出し
  for (let i = 0; i < vertical; i++) {
    const tr = document.createElement("tr");
    for (let j = 0; j < horizontal; j++) {
      const td = document.createElement("td");
      td.addEventListener("click", primaryClicked);
      td.addEventListener("contextmenu", seconderyClicked);
      tr.appendChild(td);
    }
    board.appendChild(tr);
  }
};

const button = document.getElementById("start-button");
button.addEventListener("click", init);
const board = document.getElementById("board");
const messageNumBombs = document.getElementById("remaining-bombs");
const result = document.getElementById("result");

// 右クリック 旗を置く
const seconderyClicked = function (event) {
  event.preventDefault();
  if (this.className === "open") {
    return;
  }
  this.classList.toggle("flag");
  if (this.className === "flag") {
    remainingBombs--;
  } else {
    remainingBombs++;
  }
  messageNumBombs.textContent = `残り: ${remainingBombs}個`;
};

// マスを開く
function open(y, x) {
  for (let i = y - 1; i <= y + 1; i++) {
    for (let j = x - 1; j <= x + 1; j++) {
      if (i >= 0 && i < vertical && j >= 0 && j < horizontal) {
        let aroundBombs = countBomb(i, j);
        if (board.rows[i].cells[j].className === "open") {
          continue;
        }
        if (aroundBombs === 0) {
          board.rows[i].cells[j].classList.add("open");
          open(i, j);
        } else {
          board.rows[i].cells[j].textContent = aroundBombs;
          board.rows[i].cells[j].classList.add("open");
        }
      }
    }
  }
}

// 空いているマスを数える
const countOpenCell = function () {
  let openCell = 0;
  for (let i = 0; i < vertical; i++) {
    for (let j = 0; j < horizontal; j++) {
      if (board.rows[i].cells[j].className === "open") {
        openCell++;
      }
    }
  }
  if (vertical * horizontal - openCell === settedBombs) {
    return true;
  }
};
