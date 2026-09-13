const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 50;

let score = 0;
let gameStarted = false;


// ======================================================
// CAMERA
// ======================================================

let cameraOffset = 0;
let targetCameraOffset = 0;

const normalCameraSpeed = 0.20;
const fastCameraSpeed = 1.2;

const cameraAnchorY = 480;
const dangerZoneY = 140;
const minimumVisibleY = 70;


// ======================================================
// PLAYER
// ======================================================

const player = {
  x: 280,
  row: 10,
  width: 40,
  height: 40
};


// ======================================================
// WORLD
// ======================================================

const rows = new Map();

const cars = [];
const boats = [];
const trainTracks = [];


// ======================================================
// 2.5D PERSPECTIVE
// ======================================================

// Objects near the top look smaller.
// Objects near the bottom look larger.

function getScale(screenY) {
  let amount = screenY / canvas.height;

  if (amount < 0) {
    amount = 0;
  }

  if (amount > 1) {
    amount = 1;
  }

  return 0.68 + amount * 0.32;
}


function projectX(worldX, screenY) {
  const scale = getScale(screenY);

  return (
    canvas.width / 2 +
    (worldX - canvas.width / 2) * scale
  );
}


function projectWidth(width, screenY) {
  return width * getScale(screenY);
}


// Draw one perspective ground strip
function drawPerspectiveBand(y, height, color) {
  const center = canvas.width / 2;

  const topScale = getScale(y);
  const bottomScale = getScale(y + height);

  const topHalf =
    (canvas.width / 2) * topScale;

  const bottomHalf =
    (canvas.width / 2) * bottomScale;


  ctx.beginPath();

  ctx.moveTo(
    center - topHalf,
    y
  );

  ctx.lineTo(
    center + topHalf,
    y
  );

  ctx.lineTo(
    center + bottomHalf,
    y + height
  );

  ctx.lineTo(
    center - bottomHalf,
    y + height
  );

  ctx.closePath();

  ctx.fillStyle = color;
  ctx.fill();
}


// ======================================================
// VEHICLES
// ======================================================

function createCarsForRow(row, direction, speed) {
  const vehicleTypes = [
    "car",
    "truck",
    "taxi",
    "van"
  ];

  const vehicleColors = [
    "#e53935",
    "#1e88e5",
    "#fdd835",
    "#8e24aa",
    "#fb8c00",
    "#43a047"
  ];


  function makeVehicle(x) {
    const type =
      vehicleTypes[
        Math.floor(
          Math.random() * vehicleTypes.length
        )
      ];


    const color =
      vehicleColors[
        Math.floor(
          Math.random() * vehicleColors.length
        )
      ];


    let width = 80;

    if (type === "truck") {
      width = 110;
    }

    if (type === "van") {
      width = 95;
    }


    cars.push({
      row: row,
      x: x,
      width: width,
      height: 35,
      speed: speed,
      direction: direction,
      type: type,
      color: color
    });
  }


  if (direction === 1) {
    makeVehicle(-120);
    makeVehicle(230);
  } else {
    makeVehicle(650);
    makeVehicle(320);
  }
}


// ======================================================
// BOATS
// ======================================================

function createBoatsForRow(row, direction, speed) {
  const positions =
    direction === 1
      ? [-120, 220, 520]
      : [650, 320, 20];


  for (let position of positions) {
    boats.push({
      row: row,
      x: position,
      width: 120,
      height: 38,
      speed: speed,
      direction: direction
    });
  }
}


// ======================================================
// TRAIN TRACKS
// ======================================================

function createTrainTrack(row) {
  const direction =
    Math.random() < 0.5
      ? 1
      : -1;


  trainTracks.push({
    row: row,
    direction: direction,

    width: 900,
    height: 42,

    cycleLength: 9000,

    warningTime: 2000,

    trainTime: 2600,

    timeOffset:
      Math.random() * 5000,

    bellPlayed: false
  });


  rows.set(
    row,
    "track"
  );
}


// ======================================================
// STARTING WORLD
// ======================================================

rows.set(11, "grass");
rows.set(10, "grass");


// First 2-lane road
rows.set(9, "road");
rows.set(8, "road");

createCarsForRow(9, 1, 3);
createCarsForRow(8, -1, 4);


// Grass
rows.set(7, "grass");


// Single road
rows.set(6, "road");

createCarsForRow(6, 1, 4);


// Grass
rows.set(5, "grass");


// Two roads
rows.set(4, "road");
rows.set(3, "road");

createCarsForRow(4, -1, 3.5);
createCarsForRow(3, 1, 4.5);


// Grass
rows.set(2, "grass");


// More roads
rows.set(1, "road");
rows.set(0, "road");

createCarsForRow(1, 1, 3.5);
createCarsForRow(0, -1, 4);


// Grass
rows.set(-1, "grass");


// River
rows.set(-2, "water");
rows.set(-3, "water");

createBoatsForRow(-2, 1, 2);
createBoatsForRow(-3, -1, 2.5);


// Grass
rows.set(-4, "grass");


// More roads
rows.set(-5, "road");

createCarsForRow(
  -5,
  1,
  3.5
);


rows.set(-6, "grass");


rows.set(-7, "road");
rows.set(-8, "road");

createCarsForRow(
  -7,
  -1,
  4
);

createCarsForRow(
  -8,
  1,
  3
);


rows.set(-9, "grass");


// Train
createTrainTrack(-10);


// Grass
rows.set(-11, "grass");


// Second river
rows.set(-12, "water");
rows.set(-13, "water");

createBoatsForRow(
  -12,
  -1,
  2.2
);

createBoatsForRow(
  -13,
  1,
  2.8
);


rows.set(-14, "grass");


let nextRowToGenerate = -15;

let roadLanesSinceRiver = 0;


// ======================================================
// ENDLESS WORLD
// ======================================================

function generateMoreWorld(untilRow) {

  while (
    nextRowToGenerate >= untilRow
  ) {

    // ----------------------------
    // RIVER
    // ----------------------------

    if (
      roadLanesSinceRiver >= 5
    ) {

      rows.set(
        nextRowToGenerate,
        "grass"
      );

      nextRowToGenerate--;


      rows.set(
        nextRowToGenerate,
        "water"
      );

      createBoatsForRow(
        nextRowToGenerate,
        1,
        2 + Math.random()
      );

      nextRowToGenerate--;


      rows.set(
        nextRowToGenerate,
        "water"
      );

      createBoatsForRow(
        nextRowToGenerate,
        -1,
        2 + Math.random()
      );

      nextRowToGenerate--;


      rows.set(
        nextRowToGenerate,
        "grass"
      );

      nextRowToGenerate--;


      roadLanesSinceRiver = 0;

      continue;
    }


    // ----------------------------
    // TRAIN
    // ----------------------------

    if (
      Math.random() < 0.16
    ) {

      rows.set(
        nextRowToGenerate,
        "grass"
      );

      nextRowToGenerate--;


      createTrainTrack(
        nextRowToGenerate
      );

      nextRowToGenerate--;


      rows.set(
        nextRowToGenerate,
        "grass"
      );

      nextRowToGenerate--;


      continue;
    }


    // ----------------------------
    // ROAD
    // ----------------------------

    const roadLength =
      Math.random() < 0.5
        ? 1
        : 2;


    let direction =
      Math.random() < 0.5
        ? 1
        : -1;


    for (
      let i = 0;
      i < roadLength;
      i++
    ) {

      rows.set(
        nextRowToGenerate,
        "road"
      );


      const speed =
        2.5 +
        Math.random() * 2;


      createCarsForRow(
        nextRowToGenerate,
        direction,
        speed
      );


      direction *= -1;

      nextRowToGenerate--;

      roadLanesSinceRiver++;
    }


    // Grass always after road
    rows.set(
      nextRowToGenerate,
      "grass"
    );

    nextRowToGenerate--;
  }
}


generateMoreWorld(-45);


// ======================================================
// BACKGROUND
// ======================================================

function drawBackground() {

  ctx.fillStyle = "#8fcf55";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  // Draw far rows first
  const orderedRows =
    Array.from(
      rows.entries()
    ).sort(
      (a, b) =>
        a[0] - b[0]
    );


  for (
    const [row, type]
    of orderedRows
  ) {

    const y =
      row *
      tileSize +
      cameraOffset;


    if (
      y < -tileSize ||
      y > canvas.height
    ) {
      continue;
    }


    // ----------------------------
    // GRASS
    // ----------------------------

    if (
      type === "grass"
    ) {

      drawPerspectiveBand(
        y,
        tileSize,
        "#7fc84a"
      );


      // Grass highlight
      drawPerspectiveBand(
        y,
        4,
        "#97db60"
      );
    }


    // ----------------------------
    // ROAD
    // ----------------------------

    if (
      type === "road"
    ) {

      drawPerspectiveBand(
        y,
        tileSize,
        "#484848"
      );


      // Road edge
      drawPerspectiveBand(
        y,
        3,
        "#656565"
      );
    }


    // ----------------------------
    // WATER
    // ----------------------------

    if (
      type === "water"
    ) {

      drawPerspectiveBand(
        y,
        tileSize,
        "#2496d6"
      );


      const scale =
        getScale(
          y + tileSize / 2
        );


      ctx.strokeStyle =
        "#78d2ef";

      ctx.lineWidth =
        2 * scale;


      for (
        let offset = 14;
        offset <= 34;
        offset += 20
      ) {

        const waterY =
          y + offset;


        const left =
          projectX(
            0,
            waterY
          );

        const right =
          projectX(
            canvas.width,
            waterY
          );


        ctx.beginPath();

        ctx.moveTo(
          left,
          waterY
        );

        ctx.lineTo(
          right,
          waterY
        );

        ctx.stroke();
      }
    }
  }


  // ----------------------------
  // ROAD DIVIDERS
  // ----------------------------

  ctx.setLineDash(
    [16, 16]
  );


  for (
    const [row, type]
    of rows
  ) {

    if (
      type !== "road"
    ) {
      continue;
    }


    if (
      rows.get(
        row - 1
      ) === "road"
    ) {

      const y =
        row *
        tileSize +
        cameraOffset;


      const left =
        projectX(
          0,
          y
        );

      const right =
        projectX(
          canvas.width,
          y
        );


      ctx.strokeStyle =
        "white";

      ctx.lineWidth =
        2 *
        getScale(y);


      ctx.beginPath();

      ctx.moveTo(
        left,
        y
      );

      ctx.lineTo(
        right,
        y
      );

      ctx.stroke();
    }
  }


  ctx.setLineDash([]);
}


// ======================================================
// PLAYER POSITION
// ======================================================

function getPlayerScreenY() {

  return (
    player.row *
    tileSize +
    cameraOffset +
    5
  );
}


// ======================================================
// 2.5D CHICKEN
// ======================================================

function drawPlayer() {

  const y =
    getPlayerScreenY();


  const scale =
    getScale(
      y + 20
    );


  const x =
    projectX(
      player.x,
      y
    );


  const bodyWidth =
    29 * scale;

  const bodyHeight =
    24 * scale;

  const depth =
    7 * scale;


  // ----------------------------
  // SHADOW
  // ----------------------------

  ctx.fillStyle =
    "rgba(0, 0, 0, 0.20)";


  ctx.beginPath();

  ctx.ellipse(
    x + 20 * scale,
    y + 39 * scale,
    19 * scale,
    6 * scale,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();


  // ----------------------------
  // BODY FRONT
  // ----------------------------

  const bodyX =
    x + 6 * scale;

  const bodyY =
    y + 13 * scale;


  ctx.fillStyle =
    "#f7f7f7";

  ctx.fillRect(
    bodyX,
    bodyY,
    bodyWidth,
    bodyHeight
  );


  // Body side face
  ctx.beginPath();

  ctx.moveTo(
    bodyX + bodyWidth,
    bodyY
  );

  ctx.lineTo(
    bodyX +
    bodyWidth +
    depth,
    bodyY -
    depth
  );

  ctx.lineTo(
    bodyX +
    bodyWidth +
    depth,
    bodyY +
    bodyHeight -
    depth
  );

  ctx.lineTo(
    bodyX + bodyWidth,
    bodyY + bodyHeight
  );

  ctx.closePath();

  ctx.fillStyle =
    "#d8d8d8";

  ctx.fill();


  // Body top face
  ctx.beginPath();

  ctx.moveTo(
    bodyX,
    bodyY
  );

  ctx.lineTo(
    bodyX + depth,
    bodyY - depth
  );

  ctx.lineTo(
    bodyX +
    bodyWidth +
    depth,
    bodyY - depth
  );

  ctx.lineTo(
    bodyX + bodyWidth,
    bodyY
  );

  ctx.closePath();

  ctx.fillStyle =
    "#ffffff";

  ctx.fill();


  // ----------------------------
  // HEAD
  // ----------------------------

  const headSize =
    20 * scale;

  const headX =
    x + 11 * scale;

  const headY =
    y;


  ctx.fillStyle =
    "#fafafa";

  ctx.fillRect(
    headX,
    headY,
    headSize,
    headSize
  );


  // Head side
  ctx.beginPath();

  ctx.moveTo(
    headX + headSize,
    headY
  );

  ctx.lineTo(
    headX +
    headSize +
    depth,
    headY -
    depth
  );

  ctx.lineTo(
    headX +
    headSize +
    depth,
    headY +
    headSize -
    depth
  );

  ctx.lineTo(
    headX + headSize,
    headY + headSize
  );

  ctx.closePath();

  ctx.fillStyle =
    "#dddddd";

  ctx.fill();


  // Head top
  ctx.beginPath();

  ctx.moveTo(
    headX,
    headY
  );

  ctx.lineTo(
    headX + depth,
    headY - depth
  );

  ctx.lineTo(
    headX +
    headSize +
    depth,
    headY - depth
  );

  ctx.lineTo(
    headX + headSize,
    headY
  );

  ctx.closePath();

  ctx.fillStyle =
    "#ffffff";

  ctx.fill();


  // Eye
  ctx.fillStyle =
    "#111";

  ctx.fillRect(
    headX +
    13 * scale,
    headY +
    6 * scale,
    3 * scale,
    3 * scale
  );


  // Beak
  ctx.fillStyle =
    "#f4a020";

  ctx.beginPath();

  ctx.moveTo(
    headX +
    headSize +
    depth,
    headY +
    8 * scale
  );

  ctx.lineTo(
    headX +
    headSize +
    15 * scale,
    headY +
    11 * scale
  );

  ctx.lineTo(
    headX +
    headSize +
    depth,
    headY +
    14 * scale
  );

  ctx.closePath();

  ctx.fill();


  // Comb
  ctx.fillStyle =
    "#d92727";

  for (
    let i = 0;
    i < 3;
    i++
  ) {

    ctx.fillRect(
      headX +
      (3 + i * 6) *
      scale,

      headY -
      (6 + i % 2 * 2) *
      scale,

      5 * scale,
      7 * scale
    );
  }


  // Wing
  ctx.fillStyle =
    "#e1e1e1";

  ctx.fillRect(
    bodyX +
    5 * scale,
    bodyY +
    6 * scale,
    12 * scale,
    10 * scale
  );


  // Legs
  ctx.fillStyle =
    "#e79019";

  ctx.fillRect(
    bodyX +
    7 * scale,
    bodyY +
    bodyHeight,
    3 * scale,
    7 * scale
  );

  ctx.fillRect(
    bodyX +
    20 * scale,
    bodyY +
    bodyHeight,
    3 * scale,
    7 * scale
  );
}


// ======================================================
// 2.5D VEHICLES
// ======================================================

function drawCars() {

  for (
    let car of cars
  ) {

    const y =
      car.row *
      tileSize +
      cameraOffset +
      8;


    if (
      y < -60 ||
      y >
      canvas.height + 60
    ) {
      continue;
    }


    const scale =
      getScale(y);


    const x =
      projectX(
        car.x,
        y
      );


    const width =
      car.width *
      scale;


    const height =
      24 * scale;


    const depth =
      8 * scale;


    // Shadow
    ctx.fillStyle =
      "rgba(0,0,0,0.22)";

    ctx.fillRect(
      x + 4 * scale,
      y + 23 * scale,
      width,
      7 * scale
    );


    // Main front body
    ctx.fillStyle =
      car.color;

    ctx.fillRect(
      x,
      y + 6 * scale,
      width,
      height
    );


    // Top face
    ctx.beginPath();

    ctx.moveTo(
      x,
      y + 6 * scale
    );

    ctx.lineTo(
      x + depth,
      y - depth + 6 * scale
    );

    ctx.lineTo(
      x + width + depth,
      y - depth + 6 * scale
    );

    ctx.lineTo(
      x + width,
      y + 6 * scale
    );

    ctx.closePath();

    ctx.fillStyle =
      lightenColor(
        car.color,
        25
      );

    ctx.fill();


    // Side face
    ctx.beginPath();

    ctx.moveTo(
      x + width,
      y + 6 * scale
    );

    ctx.lineTo(
      x + width + depth,
      y - depth + 6 * scale
    );

    ctx.lineTo(
      x + width + depth,
      y + height -
      depth +
      6 * scale
    );

    ctx.lineTo(
      x + width,
      y + height +
      6 * scale
    );

    ctx.closePath();

    ctx.fillStyle =
      darkenColor(
        car.color,
        35
      );

    ctx.fill();


    // Roof / cab
    if (
      car.type !== "truck"
    ) {

      ctx.fillStyle =
        car.type === "taxi"
          ? "#f8cf29"
          : lightenColor(
              car.color,
              10
            );


      ctx.fillRect(
        x + 18 * scale,
        y,
        Math.max(
          25 * scale,
          width - 38 * scale
        ),
        12 * scale
      );


      // Windows
      ctx.fillStyle =
        "#8fd5e8";

      ctx.fillRect(
        x + 23 * scale,
        y + 2 * scale,
        17 * scale,
        8 * scale
      );


      ctx.fillRect(
        x +
        width -
        38 * scale,
        y + 2 * scale,
        17 * scale,
        8 * scale
      );
    }


    // Truck
    if (
      car.type === "truck"
    ) {

      ctx.fillStyle =
        "#d9d9d9";

      ctx.fillRect(
        x +
        width -
        33 * scale,
        y + 7 * scale,
        33 * scale,
        23 * scale
      );


      ctx.fillStyle =
        "#8fd5e8";

      ctx.fillRect(
        x +
        width -
        27 * scale,
        y + 10 * scale,
        17 * scale,
        9 * scale
      );
    }


    // Taxi sign
    if (
      car.type === "taxi"
    ) {

      ctx.fillStyle =
        "white";

      ctx.fillRect(
        x +
        width / 2 -
        10 * scale,
        y -
        5 * scale,
        20 * scale,
        6 * scale
      );
    }


    // Wheels
    ctx.fillStyle =
      "#181818";


    ctx.beginPath();

    ctx.arc(
      x + 17 * scale,
      y + 31 * scale,
      5 * scale,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
      x +
      width -
      17 * scale,
      y + 31 * scale,
      5 * scale,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }
}


// ======================================================
// COLOR HELPERS
// ======================================================

function lightenColor(color, amount) {
  return adjustColor(
    color,
    amount
  );
}


function darkenColor(color, amount) {
  return adjustColor(
    color,
    -amount
  );
}


function adjustColor(color, amount) {

  if (
    !color.startsWith("#")
  ) {
    return color;
  }


  let value =
    color.substring(1);


  if (
    value.length === 3
  ) {

    value =
      value
        .split("")
        .map(
          letter =>
            letter + letter
        )
        .join("");
  }


  let number =
    parseInt(
      value,
      16
    );


  let red =
    (number >> 16) +
    amount;


  let green =
    ((number >> 8) & 0x00ff) +
    amount;


  let blue =
    (number & 0x0000ff) +
    amount;


  red =
    Math.max(
      0,
      Math.min(
        255,
        red
      )
    );


  green =
    Math.max(
      0,
      Math.min(
        255,
        green
      )
    );


  blue =
    Math.max(
      0,
      Math.min(
        255,
        blue
      )
    );


  return (
    "#" +
    (
      (1 << 24) +
      (red << 16) +
      (green << 8) +
      blue
    )
      .toString(16)
      .slice(1)
  );
}


// ======================================================
// MOVE CARS
// ======================================================

function moveCars() {

  for (
    let car of cars
  ) {

    car.x +=
      car.speed *
      car.direction;


    if (
      car.direction === 1 &&
      car.x >
      canvas.width
    ) {

      car.x =
        -car.width;
    }


    if (
      car.direction === -1 &&
      car.x +
      car.width < 0
    ) {

      car.x =
        canvas.width;
    }
  }
}


// ======================================================
// 2.5D BOATS
// ======================================================

function drawBoats() {

  for (
    let boat of boats
  ) {

    const y =
      boat.row *
      tileSize +
      cameraOffset +
      8;


    if (
      y < -60 ||
      y >
      canvas.height + 60
    ) {
      continue;
    }


    const scale =
      getScale(y);


    const x =
      projectX(
        boat.x,
        y
      );


    const width =
      boat.width *
      scale;


    const height =
      22 * scale;


    const depth =
      7 * scale;


    // Shadow
    ctx.fillStyle =
      "rgba(0,0,0,0.15)";

    ctx.fillRect(
      x,
      y + 27 * scale,
      width,
      5 * scale
    );


    // Boat front
    ctx.fillStyle =
      "#7a421e";

    ctx.fillRect(
      x,
      y + 8 * scale,
      width,
      height
    );


    // Top face
    ctx.beginPath();

    ctx.moveTo(
      x,
      y + 8 * scale
    );

    ctx.lineTo(
      x + depth,
      y
    );

    ctx.lineTo(
      x + width + depth,
      y
    );

    ctx.lineTo(
      x + width,
      y + 8 * scale
    );

    ctx.closePath();

    ctx.fillStyle =
      "#b96f34";

    ctx.fill();


    // Side
    ctx.beginPath();

    ctx.moveTo(
      x + width,
      y + 8 * scale
    );

    ctx.lineTo(
      x + width + depth,
      y
    );

    ctx.lineTo(
      x + width + depth,
      y + 18 * scale
    );

    ctx.lineTo(
      x + width,
      y + 30 * scale
    );

    ctx.closePath();

    ctx.fillStyle =
      "#542a11";

    ctx.fill();


    // Inside
    ctx.fillStyle =
      "#d99a58";

    ctx.fillRect(
      x + 15 * scale,
      y + 9 * scale,
      width -
      30 * scale,
      10 * scale
    );
  }
}


// ======================================================
// MOVE BOATS
// ======================================================

function moveBoats() {

  for (
    let boat of boats
  ) {

    boat.x +=
      boat.speed *
      boat.direction;


    if (
      boat.direction === 1 &&
      boat.x >
      canvas.width + 20
    ) {

      boat.x =
        -boat.width - 20;
    }


    if (
      boat.direction === -1 &&
      boat.x +
      boat.width <
      -20
    ) {

      boat.x =
        canvas.width + 20;
    }
  }
}


// ======================================================
// 2.5D TRAIN TRACKS
// ======================================================

function drawTrainTracks() {

  for (
    let track
    of trainTracks
  ) {

    const y =
      track.row *
      tileSize +
      cameraOffset;


    if (
      y < -tileSize ||
      y > canvas.height
    ) {
      continue;
    }


    // Gravel
    drawPerspectiveBand(
      y,
      tileSize,
      "#747474"
    );


    // Wooden ties
    for (
      let worldX = 0;
      worldX <
      canvas.width;
      worldX += 28
    ) {

      const scale =
        getScale(
          y + 25
        );


      const x =
        projectX(
          worldX,
          y + 25
        );


      ctx.fillStyle =
        "#62401f";


      ctx.fillRect(
        x,
        y + 7 * scale,
        11 * scale,
        35 * scale
      );
    }


    // Rails
    const railY1 =
      y + 14;

    const railY2 =
      y + 34;


    ctx.strokeStyle =
      "#d6d6d6";

    ctx.lineWidth =
      5 *
      getScale(y);


    ctx.beginPath();

    ctx.moveTo(
      projectX(
        0,
        railY1
      ),
      railY1
    );

    ctx.lineTo(
      projectX(
        canvas.width,
        railY1
      ),
      railY1
    );

    ctx.stroke();


    ctx.beginPath();

    ctx.moveTo(
      projectX(
        0,
        railY2
      ),
      railY2
    );

    ctx.lineTo(
      projectX(
        canvas.width,
        railY2
      ),
      railY2
    );

    ctx.stroke();


    drawTrainSignal(
      track,
      y
    );
  }
}


// ======================================================
// TRAIN SIGNAL
// ======================================================

function drawTrainSignal(track, y) {

  const scale =
    getScale(y);


  const x =
    projectX(
      38,
      y
    );


  const cycleTime =
    (
      performance.now() +
      track.timeOffset
    ) %
    track.cycleLength;


  const warningStart =
    track.cycleLength -
    track.warningTime;


  const warning =
    cycleTime >=
    warningStart;


  // Pole
  ctx.fillStyle =
    "#333";

  ctx.fillRect(
    x,
    y -
    42 * scale,
    6 * scale,
    47 * scale
  );


  // Signal box
  ctx.fillStyle =
    "#171717";

  ctx.fillRect(
    x -
    14 * scale,
    y -
    43 * scale,
    36 * scale,
    21 * scale
  );


  const flashing =
    Math.floor(
      performance.now() /
      250
    ) %
    2 === 0;


  // Light 1
  ctx.beginPath();

  ctx.arc(
    x -
    5 * scale,
    y -
    32 * scale,
    6 * scale,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    warning &&
    flashing
      ? "#ff1e1e"
      : "#520000";

  ctx.fill();


  // Light 2
  ctx.beginPath();

  ctx.arc(
    x +
    12 * scale,
    y -
    32 * scale,
    6 * scale,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    warning &&
    !flashing
      ? "#ff1e1e"
      : "#520000";

  ctx.fill();


  // Bell
  ctx.fillStyle =
    "#d6af3b";

  ctx.beginPath();

  ctx.arc(
    x + 3 * scale,
    y -
    52 * scale,
    8 * scale,
    0,
    Math.PI * 2
  );

  ctx.fill();
}


// ======================================================
// TRAIN BELL
// ======================================================

function playTrainBell() {

  try {

    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;


    const audioContext =
      new AudioContextClass();


    const oscillator =
      audioContext
        .createOscillator();


    const gain =
      audioContext
        .createGain();


    oscillator.connect(
      gain
    );


    gain.connect(
      audioContext.destination
    );


    oscillator.frequency.value =
      700;


    oscillator.type =
      "sine";


    gain.gain.setValueAtTime(
      0.12,
      audioContext.currentTime
    );


    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime +
      0.25
    );


    oscillator.start();


    oscillator.stop(
      audioContext.currentTime +
      0.25
    );

  } catch (error) {

    // Game continues
  }
}


// ======================================================
// 2.5D TRAIN
// ======================================================

function updateAndDrawTrains() {

  for (
    let track
    of trainTracks
  ) {

    const y =
      track.row *
      tileSize +
      cameraOffset +
      3;


    const cycleTime =
      (
        performance.now() +
        track.timeOffset
      ) %
      track.cycleLength;


    const warningStart =
      track.cycleLength -
      track.warningTime;


    // Warning
    if (
      cycleTime >=
      warningStart
    ) {

      if (
        !track.bellPlayed &&
        gameStarted
      ) {

        playTrainBell();

        track.bellPlayed =
          true;
      }

      continue;
    }


    track.bellPlayed =
      false;


    if (
      cycleTime >
      track.trainTime
    ) {

      continue;
    }


    const fullTrainWidth =
      900;


    let trainX;


    if (
      track.direction === 1
    ) {

      trainX =
        -fullTrainWidth +
        (
          cycleTime /
          track.trainTime
        ) *
        (
          canvas.width +
          fullTrainWidth
        );

    } else {

      trainX =
        canvas.width -
        (
          cycleTime /
          track.trainTime
        ) *
        (
          canvas.width +
          fullTrainWidth
        );
    }


    drawLongTrain(
      trainX,
      y,
      track.direction
    );


    // Collision stays logical
    if (
      player.row ===
      track.row
    ) {

      const collision =
        player.x <
        trainX +
        fullTrainWidth &&

        player.x +
        player.width >
        trainX;


      if (
        collision
      ) {

        restartGame();

        return;
      }
    }
  }
}


// ======================================================
// DRAW LONG 2.5D TRAIN
// ======================================================

function drawLongTrain(
  worldTrainX,
  y,
  direction
) {

  const scale =
    getScale(y);


  const engineWidth =
    130;


  const fullTrainWidth =
    900;


  const engineWorldX =
    direction === 1
      ? worldTrainX +
        fullTrainWidth -
        engineWidth
      : worldTrainX;


  drawTrainEngine(
    engineWorldX,
    y,
    direction,
    scale
  );


  const trainCarWidth =
    120;

  const gap =
    8;


  for (
    let i = 0;
    i < 6;
    i++
  ) {

    let carWorldX;


    if (
      direction === 1
    ) {

      carWorldX =
        engineWorldX -
        gap -
        trainCarWidth -
        i *
        (
          trainCarWidth +
          gap
        );

    } else {

      carWorldX =
        engineWorldX +
        engineWidth +
        gap +
        i *
        (
          trainCarWidth +
          gap
        );
    }


    drawTrainCar(
      carWorldX,
      y,
      trainCarWidth,
      scale,
      i
    );
  }
}


// ======================================================
// TRAIN ENGINE
// ======================================================

function drawTrainEngine(
  worldX,
  y,
  direction,
  scale
) {

  const x =
    projectX(
      worldX,
      y
    );


  const width =
    130 * scale;


  const height =
    35 * scale;


  const depth =
    9 * scale;


  // Shadow
  ctx.fillStyle =
    "rgba(0,0,0,0.25)";

  ctx.fillRect(
    x,
    y + 35 * scale,
    width,
    6 * scale
  );


  // Body
  ctx.fillStyle =
    "#252525";

  ctx.fillRect(
    x,
    y + 6 * scale,
    width,
    height
  );


  // Top
  ctx.beginPath();

  ctx.moveTo(
    x,
    y + 6 * scale
  );

  ctx.lineTo(
    x + depth,
    y - depth +
    6 * scale
  );

  ctx.lineTo(
    x + width + depth,
    y - depth +
    6 * scale
  );

  ctx.lineTo(
    x + width,
    y + 6 * scale
  );

  ctx.closePath();

  ctx.fillStyle =
    "#4a4a4a";

  ctx.fill();


  // Side
  ctx.beginPath();

  ctx.moveTo(
    x + width,
    y + 6 * scale
  );

  ctx.lineTo(
    x + width + depth,
    y - depth +
    6 * scale
  );

  ctx.lineTo(
    x + width + depth,
    y + 29 * scale
  );

  ctx.lineTo(
    x + width,
    y + 41 * scale
  );

  ctx.closePath();

  ctx.fillStyle =
    "#131313";

  ctx.fill();


  // Red stripe
  ctx.fillStyle =
    "#b21f28";

  ctx.fillRect(
    x,
    y + 29 * scale,
    width,
    6 * scale
  );


  // Window
  ctx.fillStyle =
    "#87d8ef";

  const windowX =
    direction === 1
      ? x +
        95 * scale
      : x +
        12 * scale;


  ctx.fillRect(
    windowX,
    y + 12 * scale,
    21 * scale,
    12 * scale
  );


  // Headlight
  ctx.fillStyle =
    "#ffe95c";


  if (
    direction === 1
  ) {

    ctx.fillRect(
      x +
      width -
      4 * scale,
      y + 18 * scale,
      5 * scale,
      8 * scale
    );

  } else {

    ctx.fillRect(
      x,
      y + 18 * scale,
      5 * scale,
      8 * scale
    );
  }
}


// ======================================================
// TRAIN CAR
// ======================================================

function drawTrainCar(
  worldX,
  y,
  worldWidth,
  scale,
  index
) {

  const x =
    projectX(
      worldX,
      y
    );


  const width =
    worldWidth *
    scale;


  const depth =
    8 * scale;


  // Main body
  ctx.fillStyle =
    index % 2 === 0
      ? "#343434"
      : "#424242";


  ctx.fillRect(
    x,
    y + 8 * scale,
    width,
    32 * scale
  );


  // Top
  ctx.beginPath();

  ctx.moveTo(
    x,
    y + 8 * scale
  );

  ctx.lineTo(
    x + depth,
    y
  );

  ctx.lineTo(
    x + width + depth,
    y
  );

  ctx.lineTo(
    x + width,
    y + 8 * scale
  );

  ctx.closePath();

  ctx.fillStyle =
    "#555";

  ctx.fill();


  // Side face
  ctx.beginPath();

  ctx.moveTo(
    x + width,
    y + 8 * scale
  );

  ctx.lineTo(
    x + width + depth,
    y
  );

  ctx.lineTo(
    x + width + depth,
    y + 30 * scale
  );

  ctx.lineTo(
    x + width,
    y + 40 * scale
  );

  ctx.closePath();

  ctx.fillStyle =
    "#222";

  ctx.fill();


  // Stripe
  ctx.fillStyle =
    "#8e151d";

  ctx.fillRect(
    x,
    y + 30 * scale,
    width,
    5 * scale
  );


  // Windows
  ctx.fillStyle =
    "#8fd8ef";


  for (
    let w = 13;
    w <
    worldWidth - 15;
    w += 29
  ) {

    ctx.fillRect(
      x + w * scale,
      y + 14 * scale,
      18 * scale,
      10 * scale
    );
  }
}


// ======================================================
// CAMERA
// ======================================================

function updateCamera() {

  if (
    !gameStarted
  ) {
    return;
  }


  const playerWorldY =
    player.row *
    tileSize +
    5;


  targetCameraOffset =
    cameraAnchorY -
    playerWorldY;


  if (
    targetCameraOffset <
    0
  ) {

    targetCameraOffset =
      0;
  }


  const playerScreenY =
    getPlayerScreenY();


  let currentSpeed =
    normalCameraSpeed;


  if (
    playerScreenY <
    dangerZoneY
  ) {

    currentSpeed =
      fastCameraSpeed;
  }


  if (
    playerScreenY <
    minimumVisibleY
  ) {

    cameraOffset +=
      minimumVisibleY -
      playerScreenY;
  }


  if (
    cameraOffset <
    targetCameraOffset
  ) {

    cameraOffset +=
      currentSpeed;


    if (
      cameraOffset >
      targetCameraOffset
    ) {

      cameraOffset =
        targetCameraOffset;
    }
  }


  generateMoreWorld(
    player.row - 45
  );
}


// ======================================================
// CAR COLLISION
// ======================================================

function checkCarCollision() {

  if (
    rows.get(
      player.row
    ) !== "road"
  ) {

    return false;
  }


  for (
    let car of cars
  ) {

    if (
      car.row !==
      player.row
    ) {
      continue;
    }


    const collision =
      player.x <
      car.x +
      car.width &&

      player.x +
      player.width >
      car.x;


    if (
      collision
    ) {

      restartGame();

      return true;
    }
  }


  return false;
}


// ======================================================
// WATER COLLISION
// ======================================================

function checkWaterCollision() {

  if (
    rows.get(
      player.row
    ) !== "water"
  ) {
    return;
  }


  let standingOnBoat =
    null;


  for (
    let boat of boats
  ) {

    if (
      boat.row !==
      player.row
    ) {
      continue;
    }


    const touchingBoat =
      player.x +
      player.width >
      boat.x &&

      player.x <
      boat.x +
      boat.width;


    if (
      touchingBoat
    ) {

      standingOnBoat =
        boat;

      break;
    }
  }


  if (
    !standingOnBoat
  ) {

    restartGame();

    return;
  }


  // Boat carries chicken
  player.x +=
    standingOnBoat.speed *
    standingOnBoat.direction;


  if (
    player.x +
    player.width <
    0 ||

    player.x >
    canvas.width
  ) {

    restartGame();
  }
}


// ======================================================
// RESTART
// ======================================================

function restartGame() {

  player.x =
    280;

  player.row =
    10;

  score =
    0;

  gameStarted =
    false;

  cameraOffset =
    0;

  targetCameraOffset =
    0;


  document
    .getElementById(
      "score"
    )
    .textContent =
    "Score: 0";
}


// ======================================================
// GAME LOOP
// ======================================================

function gameLoop() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  updateCamera();


  moveCars();

  moveBoats();


  drawBackground();

  drawTrainTracks();

  drawCars();

  drawBoats();

  updateAndDrawTrains();

  drawPlayer();


  const hitCar =
    checkCarCollision();


  if (
    !hitCar
  ) {

    checkWaterCollision();
  }


  requestAnimationFrame(
    gameLoop
  );
}


// ======================================================
// CONTROLS
// ======================================================

document.addEventListener(
  "keydown",
  function(event) {

    const movementKeys = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight"
    ];


    if (
      movementKeys.includes(
        event.key
      )
    ) {

      event.preventDefault();

      gameStarted =
        true;
    }


    // UP
    if (
      event.key ===
      "ArrowUp"
    ) {

      player.row--;

      score++;


      generateMoreWorld(
        player.row - 45
      );
    }


    // DOWN
    if (
      event.key ===
      "ArrowDown"
    ) {

      player.row++;
    }


    // LEFT
    if (
      event.key ===
      "ArrowLeft"
    ) {

      player.x -=
        tileSize;
    }


    // RIGHT
    if (
      event.key ===
      "ArrowRight"
    ) {

      player.x +=
        tileSize;
    }


    // Keep player inside horizontally
    if (
      rows.get(
        player.row
      ) !== "water"
    ) {

      if (
        player.x < 5
      ) {

        player.x =
          5;
      }


      if (
        player.x >
        canvas.width -
        player.width -
        5
      ) {

        player.x =
          canvas.width -
          player.width -
          5;
      }
    }


    // Prevent player going off top
    const playerScreenY =
      getPlayerScreenY();


    if (
      playerScreenY <
      minimumVisibleY
    ) {

      cameraOffset +=
        minimumVisibleY -
        playerScreenY;
    }


    document
      .getElementById(
        "score"
      )
      .textContent =
      "Score: " +
      score;
  }
);


// ======================================================
// START
// ======================================================

gameLoop();