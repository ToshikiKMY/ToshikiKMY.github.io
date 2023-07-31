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
const xs = [];
for (let i = -20; i < 21; i++) {
  xs.push(i * 0.1);
} // xs = [-2.0, -1.9, -1.8, .... 2.0]  x:-2~2の範囲でプロットする
function calc_ys(xs, a, b, c) {
  // yの座標を計算するための関数
  return xs.map((x) => a * x * x + b * x + c);
}

const ctx = document.getElementById("myChart").getContext("2d");
let myChart = new Chart(ctx, {
  type: "line",
  field: {
    labels: xs, // x座標の配列
    datasets: [
      {
        label: "ax^2 + bx + c",
        field: calc_ys(xs, 0, 0, 0), // y座標の配列（初期化するときには、a=b=c=0と仮にしている）
      },
    ],
  },
  options: {
    scales: {
      yAxes: [
        {
          ticks: {
            min: -4,
            max: 4, // yについて[-4,4]の範囲で描画するように固定。これがないと、データの値に応じて表示領域が変わってしまう。
          },
        },
      ],
    },
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
    myChart.field.datasets[0].field = calc_ys(
      xs,
      Number(a),
      Number(b),
      Number(c)
    ); // プロットのy座標のデータを新しいもので置き換える。
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

// const seconderyClicked = function () {};

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
function seconderyClicked(e) {
  e.preventDefault();
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
}

// マスを開く
function open(y, x) {
  for (let i = y - 1; i <= y + 1; i++) {
    for (let j = x - 1; j <= x + 1; j++) {
      if (i >= 0 && i < vertical && j >= 0 && j < horizontal) {
        let aroundBombs = countBomb(i, j);
        if (
          board.rows[i].cells[j].className === "open" ||
          board.rows[i].cells[j].className === "flag"
        ) {
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
function countOpenCell() {
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
}
