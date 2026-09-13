const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 50;

let score = 0;

const player = {
  x: 275,
  y: 525,
  width: 40,
  height: 40
};

const cars = [
  // Top lane - moving right
  {
    x: -100,
    y: 260,
    width: 80,
    height: 35,
    speed: 3,
    direction: 1
  },

  {
    x: 200,
    y: 260,
    width: 80,
    height: 35,
    speed: 3,
    direction: 1
  },

  // Middle lane - moving left
  {
    x: 650,
    y: 310,
    width: 80,
    height: 35,
    speed: 4,
    direction: -1
  },

  {
    x: 350,
    y: 310,
    width: 80,
    height: 35,
    speed: 4,
    direction: -1
  },

  // Bottom lane - moving right
  {
    x: -200,
    y: 360,
    width: 80,
    height: 35,
    speed: 2.5,
    direction: 1
  },

  {
    x: 150,
    y: 360,
    width: 80,
    height: 35,
    speed: 2.5,
    direction: 1
  }
];

function drawBackground() {
  ctx.fillStyle = "#7ac943";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Road
  ctx.fillStyle = "#555";
  ctx.fillRect(0, 250, canvas.width, 150);

  // Lane lines
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.setLineDash([20, 20]);

  ctx.beginPath();
  ctx.moveTo(0, 300);
  ctx.lineTo(canvas.width, 300);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 350);
  ctx.lineTo(canvas.width, 350);
  ctx.stroke();

  ctx.setLineDash([]);
}

function drawPlayer() {
  ctx.fillStyle = "yellow";

  ctx.fillRect(
    player.x,
    player.y,
    player.width,
    player.height
  );

  // Beak
  ctx.fillStyle = "orange";

  ctx.fillRect(
    player.x + 30,
    player.y + 15,
    15,
    10
  );
}

function drawCars() {
  for (let car of cars) {
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
  }
}

function moveCars() {
  for (let car of cars) {
    car.x += car.speed * car.direction;

    // Car moving right
    if (car.direction === 1 && car.x > canvas.width) {
      car.x = -car.width;
    }

    // Car moving left
    if (car.direction === -1 && car.x + car.width < 0) {
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
    }
  }
}

function restartGame() {
  player.x = 275;
  player.y = 525;

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

  // Keep player inside canvas
  if (player.x < 0) {
    player.x = 0;
  }

  if (player.x > canvas.width - player.width) {
    player.x = canvas.width - player.width;
  }

  if (player.y < 0) {
    player.y = 0;
  }

  if (player.y > canvas.height - player.height) {
    player.y = canvas.height - player.height;
  }

  document.getElementById("score").textContent =
    "Score: " + score;
});

gameLoop();