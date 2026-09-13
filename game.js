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
    y: 410,
    width: 80,
    height: 35,
    speed: 3,
    direction: 1
  },

  {
    x: 220,
    y: 410,
    width: 80,
    height: 35,
    speed: 3,
    direction: 1
  },

  // Bottom lane - moving left
  {
    x: 650,
    y: 460,
    width: 80,
    height: 35,
    speed: 4,
    direction: -1
  },

  {
    x: 330,
    y: 460,
    width: 80,
    height: 35,
    speed: 4,
    direction: -1
  }
];

function drawBackground() {
  // Grass
  ctx.fillStyle = "#7ac943";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Two-lane road
  ctx.fillStyle = "#555";
  ctx.fillRect(0, 400, canvas.width, 100);

  // Middle dividing line
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.setLineDash([20, 20]);

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

  // Head
  ctx.beginPath();
  ctx.arc(x + 20, y + 10, 10, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();

  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Wing
  ctx.fillStyle = "#f2f2f2";
  ctx.fillRect(x + 10, y + 18, 10, 8);

  // Beak
  ctx.beginPath();
  ctx.moveTo(x + 28, y + 10);
  ctx.lineTo(x + 38, y + 7);
  ctx.lineTo(x + 38, y + 13);
  ctx.closePath();

  ctx.fillStyle = "orange";
  ctx.fill();
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
  ctx.lineTo(x + 15, y + 40);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + 25, y + 32);
  ctx.lineTo(x + 25, y + 40);
  ctx.stroke();

  // Feet
  ctx.beginPath();
  ctx.moveTo(x + 12, y + 40);
  ctx.lineTo(x + 18, y + 40);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + 22, y + 40);
  ctx.lineTo(x + 28, y + 40);
  ctx.stroke();

  // Body outline
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;

  ctx.strokeRect(
    x + 8,
    y + 12,
    24,
    20
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

    if (
      car.direction === 1 &&
      car.x > canvas.width
    ) {
      car.x = -car.width;
    }

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

  if (player.x < 0) {
    player.x = 0;
  }

  if (
    player.x >
    canvas.width - player.width
  ) {
    player.x =
      canvas.width - player.width;
  }

  if (player.y < 0) {
    player.y = 0;
  }

  if (
    player.y >
    canvas.height - player.height
  ) {
    player.y =
      canvas.height - player.height;
  }

  document.getElementById("score").textContent =
    "Score: " + score;
});

gameLoop();