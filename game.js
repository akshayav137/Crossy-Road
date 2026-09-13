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

function drawBackground() {
  ctx.fillStyle = "#7ac943";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Road
  ctx.fillStyle = "#555";
  ctx.fillRect(0, 250, canvas.width, 150);

  // Road lines
  ctx.strokeStyle = "white";
  ctx.lineWidth = 4;

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

  ctx.fillStyle = "orange";
  ctx.fillRect(
    player.x + 30,
    player.y + 15,
    15,
    10
  );
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();
  drawPlayer();
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

  drawGame();
});

drawGame();