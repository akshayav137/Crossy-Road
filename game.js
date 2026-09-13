const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 50;

let score = 0;

const player = {
  x: 280,
  y: 530,
  width: 40,
  height: 40
};

const cars = [
  // =========================
  // FIRST TWO-LANE ROAD
  // y = 400 to 500
  // =========================

  // Lane 1 - moving right
  {
    x: -100,
    y: 407,
    width: 80,
    height: 35,
    speed: 3,
    direction: 1
  },

  {
    x: 220,
    y: 407,
    width: 80,
    height: 35,
    speed: 3,
    direction: 1
  },

  // Lane 2 - moving left
  {
    x: 650,
    y: 457,
    width: 80,
    height: 35,
    speed: 4,
    direction: -1
  },

  {
    x: 330,
    y: 457,
    width: 80,
    height: 35,
    speed: 4,
    direction: -1
  },


  // =========================
  // SINGLE-LANE ROAD
  // y = 300 to 350
  // =========================

  {
    x: -150,
    y: 307,
    width: 80,
    height: 35,
    speed: 5,
    direction: 1
  },

  {
    x: 180,
    y: 307,
    width: 80,
    height: 35,
    speed: 5,
    direction: 1
  },


  // =========================
  // SECOND TWO-LANE ROAD
  // y = 150 to 250
  // =========================

  // Lane 1 - moving left
  {
    x: 650,
    y: 157,
    width: 80,
    height: 35,
    speed: 3.5,
    direction: -1
  },

  {
    x: 300,
    y: 157,
    width: 80,
    height: 35,
    speed: 3.5,
    direction: -1
  },

  // Lane 2 - moving right
  {
    x: -100,
    y: 207,
    width: 80,
    height: 35,
    speed: 4.5,
    direction: 1
  },

  {
    x: 250,
    y: 207,
    width: 80,
    height: 35,
    speed: 4.5,
    direction: 1
  }
];

function drawBackground() {
  // Entire background = grass
  ctx.fillStyle = "#7ac943";
  ctx.fillRect(0, 0, canvas.width, canvas.height);


  // =========================
  // TOP TWO-LANE ROAD
  // =========================

  ctx.fillStyle = "#555";
  ctx.fillRect(0, 150, canvas.width, 100);

  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.setLineDash([20, 20]);

  ctx.beginPath();
  ctx.moveTo(0, 200);
  ctx.lineTo(canvas.width, 200);
  ctx.stroke();


  // =========================
  // MIDDLE SINGLE-LANE ROAD
  // =========================

  ctx.fillStyle = "#555";
  ctx.fillRect(0, 300, canvas.width, 50);


  // =========================
  // BOTTOM TWO-LANE ROAD
  // =========================

  ctx.fillStyle = "#555";
  ctx.fillRect(0, 400, canvas.width, 100);

  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(0, 450);
  ctx.lineTo(canvas.width, 450);
  ctx.stroke();

  ctx.setLineDash([]);
}


function drawPlayer() {
  const x = player.x;
  const y = player.y;

  // Body
  ctx.fillStyle = "white";
  ctx.fillRect(x + 8, y + 12, 24, 20);

  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 8, y + 12, 24, 20);


  // Head
  ctx.beginPath();
  ctx.arc(x + 20, y + 10, 10, 0, Math.PI * 2);

  ctx.fillStyle = "white";
  ctx.fill();

  ctx.strokeStyle = "black";
  ctx.stroke();


  // Wing
  ctx.fillStyle = "#eeeeee";
  ctx.fillRect(x + 10, y + 18, 10, 8);


  // Beak
  ctx.beginPath();
  ctx.moveTo(x + 28, y + 10);
  ctx.lineTo(x + 38, y + 7);
  ctx.lineTo(x + 38, y + 13);
  ctx.closePath();

  ctx.fillStyle = "orange";
  ctx.fill();

  ctx.strokeStyle = "black";
  ctx.stroke();


  // Comb
  ctx.fillStyle = "red";

  ctx.beginPath();
  ctx.arc(x + 14, y + 1, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x + 20, y - 1, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x + 26, y + 1, 3, 0, Math.PI * 2);
  ctx.fill();


  // Eye
  ctx.beginPath();
  ctx.arc(x + 23, y + 8, 1.5, 0, Math.PI * 2);

  ctx.fillStyle = "black";
  ctx.fill();


  // Legs
  ctx.strokeStyle = "orange";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(x + 15, y + 32);
  ctx.lineTo(x + 15, y + 39);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + 25, y + 32);
  ctx.lineTo(x + 25, y + 39);
  ctx.stroke();


  // Feet
  ctx.beginPath();
  ctx.moveTo(x + 11, y + 39);
  ctx.lineTo(x + 18, y + 39);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + 22, y + 39);
  ctx.lineTo(x + 29, y + 39);
  ctx.stroke();
}


function drawCars() {
  for (let car of cars) {
    // Car body
    ctx.fillStyle = "red";

    ctx.fillRect(
      car.x,
      car.y,
      car.width,
      car.height
    );


    // Windows
    ctx.fillStyle = "lightblue";

    ctx.fillRect(
      car.x + 15,
      car.y + 5,
      20,
      12
    );

    ctx.fillRect(
      car.x + 45,
      car.y + 5,
      20,
      12
    );


    // Wheels
    ctx.fillStyle = "black";

    ctx.beginPath();
    ctx.arc(
      car.x + 15,
      car.y + 35,
      5,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
      car.x + 65,
      car.y + 35,
      5,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}


function moveCars() {
  for (let car of cars) {
    car.x += car.speed * car.direction;

    // Car moving right
    if (
      car.direction === 1 &&
      car.x > canvas.width
    ) {
      car.x = -car.width;
    }

    // Car moving left
    if (
      car.direction === -1 &&
      car.x + car.width < 0
    ) {
      car.x = canvas.width;
    }
  }
}


function checkCollision() {
  for (let car of cars) {
    const collision =
      player.x < car.x + car.width &&
      player.x + player.width > car.x &&
      player.y < car.y + car.height &&
      player.y + player.height > car.y;

    if (collision) {
      restartGame();
      return;
    }
  }
}


function restartGame() {
  player.x = 280;
  player.y = 530;

  score = 0;

  document.getElementById("score").textContent =
    "Score: 0";
}


function gameLoop() {
  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  drawBackground();
  moveCars();
  drawCars();
  drawPlayer();
  checkCollision();

  requestAnimationFrame(gameLoop);
}


document.addEventListener("keydown", function(event) {
  if (
    event.key === "ArrowUp" ||
    event.key === "ArrowDown" ||
    event.key === "ArrowLeft" ||
    event.key === "ArrowRight"
  ) {
    event.preventDefault();
  }

  if (event.key === "ArrowUp") {
    player.y -= tileSize;
    score++;
  }

  if (event.key === "ArrowDown") {
    player.y += tileSize;
  }

  if (event.key === "ArrowLeft") {
    player.x -= tileSize;
  }

  if (event.key === "ArrowRight") {
    player.x += tileSize;
  }


  // =========================
  // SNAP CHICKEN TO CENTER
  // OF EACH 50px TILE
  // =========================

  player.x =
    Math.round((player.x - 5) / tileSize) *
      tileSize +
    5;

  player.y =
    Math.round((player.y - 5) / tileSize) *
      tileSize +
    5;


  // Keep chicken inside canvas

  if (player.x < 5) {
    player.x = 5;
  }

  if (
    player.x >
    canvas.width - player.width - 5
  ) {
    player.x =
      canvas.width - player.width - 5;
  }

  if (player.y < 5) {
    player.y = 5;
  }

  if (
    player.y >
    canvas.height - player.height - 5
  ) {
    player.y =
      canvas.height - player.height - 5;
  }


  document.getElementById("score").textContent =
    "Score: " + score;
});


gameLoop();