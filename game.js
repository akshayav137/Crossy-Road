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
// WORLD OBJECTS
// ======================================================

const rows = new Map();

const cars = [];
const logs = [];
const trainTracks = [];
const airfields = [];
const airplanes = [];


// ======================================================
// 2.5D PERSPECTIVE
// ======================================================

function getScale(screenY) {

  let amount =
    screenY / canvas.height;

  amount =
    Math.max(
      0,
      Math.min(
        1,
        amount
      )
    );

  return 0.68 + amount * 0.32;
}


function projectX(worldX, screenY) {

  const scale =
    getScale(screenY);

  return (
    canvas.width / 2 +
    (
      worldX -
      canvas.width / 2
    ) *
    scale
  );
}


// ======================================================
// COLOR HELPERS
// ======================================================

function adjustColor(color, amount) {

  let value =
    color.replace("#", "");

  if (value.length === 3) {

    value =
      value
        .split("")
        .map(
          c => c + c
        )
        .join("");
  }


  let number =
    parseInt(
      value,
      16
    );


  let r =
    (number >> 16) +
    amount;

  let g =
    (
      (
        number >> 8
      ) &
      255
    ) +
    amount;

  let b =
    (
      number &
      255
    ) +
    amount;


  r =
    Math.max(
      0,
      Math.min(
        255,
        r
      )
    );

  g =
    Math.max(
      0,
      Math.min(
        255,
        g
      )
    );

  b =
    Math.max(
      0,
      Math.min(
        255,
        b
      )
    );


  return (
    "#" +
    (
      (1 << 24) +
      (r << 16) +
      (g << 8) +
      b
    )
      .toString(16)
      .slice(1)
  );
}


// ======================================================
// CREATE VEHICLES
// ======================================================

function createCarsForRow(
  row,
  direction,
  speed
) {

  const types = [
    "car",
    "truck",
    "taxi",
    "van"
  ];


  const colors = [
    "#e53935",
    "#1e88e5",
    "#fdd835",
    "#8e24aa",
    "#fb8c00",
    "#43a047"
  ];


  function makeVehicle(x) {

    const type =
      types[
        Math.floor(
          Math.random() *
          types.length
        )
      ];


    const color =
      colors[
        Math.floor(
          Math.random() *
          colors.length
        )
      ];


    let width = 80;

    if (
      type === "truck"
    ) {
      width = 110;
    }

    if (
      type === "van"
    ) {
      width = 95;
    }


    cars.push({
      row,
      x,
      width,
      height: 35,
      direction,
      speed,
      type,
      color
    });
  }


  if (
    direction === 1
  ) {

    makeVehicle(-120);
    makeVehicle(240);

  } else {

    makeVehicle(650);
    makeVehicle(310);
  }
}


// ======================================================
// CREATE LOGS
// ======================================================

function createLogsForRow(
  row,
  direction,
  speed
) {

  const positions =
    direction === 1
      ? [-150, 180, 500]
      : [650, 330, 20];


  for (
    let x of positions
  ) {

    logs.push({
      row,
      x,
      width: 145,
      height: 35,
      direction,
      speed
    });
  }
}


// ======================================================
// CREATE TRAIN TRACK
// ======================================================

function createTrainTrack(row) {

  trainTracks.push({

    row,

    direction:
      Math.random() < 0.5
        ? 1
        : -1,

    cycleLength: 9000,

    warningTime: 2000,

    trainTime: 2600,

    timeOffset:
      Math.random() *
      5000,

    bellPlayed: false
  });


  rows.set(
    row,
    "track"
  );
}


// ======================================================
// CREATE AIRFIELD
// ======================================================

function createAirfield(
  bottomRow,
  length,
  difficulty
) {

  const topRow =
    bottomRow -
    length +
    1;


  for (
    let row = bottomRow;
    row >= topRow;
    row--
  ) {

    rows.set(
      row,
      "airfield"
    );
  }


  // Fence goes AFTER the field
  const fenceRow =
    topRow - 1;


  rows.set(
    fenceRow,
    "fence"
  );


  // Safe grass after fence
  rows.set(
    fenceRow - 1,
    "grass"
  );


  const field = {

    bottomRow,
    topRow,
    fenceRow,
    difficulty
  };


  airfields.push(field);


  // First field = manageable
  // Later fields = more planes
  const planeCount =
    difficulty === 1
      ? 2
      : Math.min(
          2 + difficulty,
          6
        );


  for (
    let i = 0;
    i < planeCount;
    i++
  ) {

    const spacing =
      canvas.width /
      planeCount;


    airplanes.push({

      field,

      x:
        30 +
        i *
        spacing +
        Math.random() *
        50,

      worldY:
        topRow *
        tileSize -
        i *
        100,

      width: 70,

      height: 48,

      speed:
        0.8 +
        difficulty *
        0.22 +
        Math.random() *
        0.22

    });
  }


  return fenceRow - 1;
}


// ======================================================
// STARTING WORLD
// ======================================================

rows.set(11, "grass");
rows.set(10, "grass");


// ------------------------------------------------------
// ONE ROAD LANE
// ------------------------------------------------------

rows.set(
  9,
  "road"
);

createCarsForRow(
  9,
  1,
  3
);


// Safe grass
rows.set(
  8,
  "grass"
);


// ------------------------------------------------------
// TWO ROAD LANES
// ------------------------------------------------------

rows.set(
  7,
  "road"
);

rows.set(
  6,
  "road"
);


createCarsForRow(
  7,
  -1,
  3.4
);

createCarsForRow(
  6,
  1,
  3
);


// Safe grass
rows.set(
  5,
  "grass"
);


// ------------------------------------------------------
// FIRST RIVER
// ------------------------------------------------------

rows.set(
  4,
  "water"
);

rows.set(
  3,
  "water"
);


createLogsForRow(
  4,
  1,
  1.8
);

createLogsForRow(
  3,
  -1,
  2
);


// Safe grass
rows.set(
  2,
  "grass"
);


// ------------------------------------------------------
// TWO ROAD LANES
// ------------------------------------------------------

rows.set(
  1,
  "road"
);

rows.set(
  0,
  "road"
);


createCarsForRow(
  1,
  1,
  3.2
);

createCarsForRow(
  0,
  -1,
  3.6
);


// Safe grass
rows.set(
  -1,
  "grass"
);


// ------------------------------------------------------
// ONE ROAD LANE
// ------------------------------------------------------

rows.set(
  -2,
  "road"
);


createCarsForRow(
  -2,
  1,
  3.5
);


// Safe grass
rows.set(
  -3,
  "grass"
);


// ------------------------------------------------------
// FIRST AIRPLANE FIELD
// ------------------------------------------------------

const firstFieldEnd =
  createAirfield(
    -4,
    5,
    1
  );


// firstFieldEnd is the safe grass after fence
let nextRowToGenerate =
  firstFieldEnd - 1;


// ======================================================
// GENERATION VARIABLES
// ======================================================

let roadLanesSinceRiver = 0;

let sectionsSinceAirfield = 0;

let airplaneFieldDifficulty = 2;


// ======================================================
// ENDLESS WORLD GENERATOR
// ======================================================

function generateMoreWorld(
  untilRow
) {

  while (
    nextRowToGenerate >=
    untilRow
  ) {

    // --------------------------------------------------
    // SECOND / FUTURE AIRPLANE FIELDS
    // --------------------------------------------------

    if (
      sectionsSinceAirfield >= 6
    ) {

      rows.set(
        nextRowToGenerate,
        "grass"
      );

      nextRowToGenerate--;


      const newSafeRow =
        createAirfield(
          nextRowToGenerate,
          5,
          airplaneFieldDifficulty
        );


      nextRowToGenerate =
        newSafeRow - 1;


      airplaneFieldDifficulty++;

      sectionsSinceAirfield = 0;

      roadLanesSinceRiver = 0;

      continue;
    }


    // --------------------------------------------------
    // RIVER
    // --------------------------------------------------

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

      createLogsForRow(
        nextRowToGenerate,
        1,
        1.8 +
        Math.random() *
        0.5
      );

      nextRowToGenerate--;


      rows.set(
        nextRowToGenerate,
        "water"
      );

      createLogsForRow(
        nextRowToGenerate,
        -1,
        1.8 +
        Math.random() *
        0.5
      );

      nextRowToGenerate--;


      rows.set(
        nextRowToGenerate,
        "grass"
      );

      nextRowToGenerate--;


      roadLanesSinceRiver = 0;

      sectionsSinceAirfield++;

      continue;
    }


    // --------------------------------------------------
    // TRAIN
    // --------------------------------------------------

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


      sectionsSinceAirfield++;

      continue;
    }


    // --------------------------------------------------
    // ROAD
    // --------------------------------------------------

    const roadLength =
      Math.random() < 0.55
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


      createCarsForRow(
        nextRowToGenerate,
        direction,
        2.8 +
        Math.random() *
        1.5
      );


      direction *= -1;

      nextRowToGenerate--;

      roadLanesSinceRiver++;
    }


    // Always safe grass
    rows.set(
      nextRowToGenerate,
      "grass"
    );

    nextRowToGenerate--;

    sectionsSinceAirfield++;
  }
}


generateMoreWorld(
  -55
);


// ======================================================
// BACKGROUND
// ======================================================

function drawBackground() {

  ctx.fillStyle =
    "#8fcf55";


  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  for (
    const [row, type]
    of rows
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


    // --------------------------------------------------
    // GRASS
    // --------------------------------------------------

    if (
      type === "grass"
    ) {

      ctx.fillStyle =
        "#7fc84a";


      ctx.fillRect(
        0,
        y,
        canvas.width,
        tileSize
      );


      ctx.fillStyle =
        "#97db60";


      ctx.fillRect(
        0,
        y,
        canvas.width,
        4
      );
    }


    // --------------------------------------------------
    // ROAD
    // --------------------------------------------------

    if (
      type === "road"
    ) {

      ctx.fillStyle =
        "#474747";


      ctx.fillRect(
        0,
        y,
        canvas.width,
        tileSize
      );


      ctx.fillStyle =
        "#5e5e5e";


      ctx.fillRect(
        0,
        y,
        canvas.width,
        3
      );
    }


    // --------------------------------------------------
    // WATER
    // --------------------------------------------------

    if (
      type === "water"
    ) {

      ctx.fillStyle =
        "#2499d8";


      ctx.fillRect(
        0,
        y,
        canvas.width,
        tileSize
      );


      ctx.strokeStyle =
        "#7bd6ef";

      ctx.lineWidth = 2;


      ctx.beginPath();

      ctx.moveTo(
        0,
        y + 15
      );

      ctx.lineTo(
        canvas.width,
        y + 15
      );

      ctx.stroke();


      ctx.beginPath();

      ctx.moveTo(
        0,
        y + 35
      );

      ctx.lineTo(
        canvas.width,
        y + 35
      );

      ctx.stroke();
    }


    // --------------------------------------------------
    // AIRPLANE FIELD
    // --------------------------------------------------

    if (
      type === "airfield"
    ) {

      ctx.fillStyle =
        "#62b447";


      ctx.fillRect(
        0,
        y,
        canvas.width,
        tileSize
      );


      // mowing / runway-like stripes
      ctx.fillStyle =
        "#6fc452";


      ctx.fillRect(
        0,
        y + 5,
        canvas.width,
        8
      );


      ctx.fillStyle =
        "#59a840";


      ctx.fillRect(
        0,
        y + 32,
        canvas.width,
        7
      );
    }


    // --------------------------------------------------
    // FENCE
    // --------------------------------------------------

    if (
      type === "fence"
    ) {

      ctx.fillStyle =
        "#7fc84a";


      ctx.fillRect(
        0,
        y,
        canvas.width,
        tileSize
      );


      drawFence(
        y
      );
    }
  }


  // Road divider
  ctx.strokeStyle =
    "white";

  ctx.lineWidth = 3;

  ctx.setLineDash(
    [20, 20]
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


      ctx.beginPath();

      ctx.moveTo(
        0,
        y
      );

      ctx.lineTo(
        canvas.width,
        y
      );

      ctx.stroke();
    }
  }


  ctx.setLineDash([]);
}


// ======================================================
// FENCE
// ======================================================

function drawFence(y) {

  // Gate in the middle
  const gateStart = 250;
  const gateEnd = 350;


  ctx.fillStyle =
    "#80552d";


  for (
    let x = 0;
    x < canvas.width;
    x += 28
  ) {

    if (
      x > gateStart - 15 &&
      x < gateEnd
    ) {
      continue;
    }


    ctx.fillRect(
      x,
      y + 5,
      8,
      40
    );
  }


  // Horizontal boards
  ctx.fillStyle =
    "#9a6738";


  ctx.fillRect(
    0,
    y + 13,
    gateStart,
    7
  );


  ctx.fillRect(
    gateEnd,
    y + 13,
    canvas.width -
    gateEnd,
    7
  );


  ctx.fillRect(
    0,
    y + 32,
    gateStart,
    7
  );


  ctx.fillRect(
    gateEnd,
    y + 32,
    canvas.width -
    gateEnd,
    7
  );


  // Gate markers
  ctx.fillStyle =
    "#613d20";


  ctx.fillRect(
    gateStart - 5,
    y,
    10,
    48
  );


  ctx.fillRect(
    gateEnd - 5,
    y,
    10,
    48
  );
}


// ======================================================
// PLAYER SCREEN Y
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
// DRAW CHICKEN 2.5D
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


  const depth =
    7 * scale;


  // Shadow
  ctx.fillStyle =
    "rgba(0,0,0,0.20)";


  ctx.beginPath();


  ctx.ellipse(
    x +
    20 * scale,

    y +
    39 * scale,

    18 * scale,

    5 * scale,

    0,
    0,
    Math.PI * 2
  );


  ctx.fill();


  // Body
  const bodyX =
    x +
    7 * scale;


  const bodyY =
    y +
    13 * scale;


  const bodyWidth =
    28 * scale;


  const bodyHeight =
    23 * scale;


  ctx.fillStyle =
    "#f6f6f6";


  ctx.fillRect(
    bodyX,
    bodyY,
    bodyWidth,
    bodyHeight
  );


  // Top body face
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
    bodyX +
    bodyWidth,
    bodyY
  );

  ctx.closePath();

  ctx.fillStyle =
    "white";

  ctx.fill();


  // Side body face
  ctx.beginPath();

  ctx.moveTo(
    bodyX +
    bodyWidth,
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
    bodyX +
    bodyWidth,
    bodyY +
    bodyHeight
  );

  ctx.closePath();

  ctx.fillStyle =
    "#d4d4d4";

  ctx.fill();


  // Head
  const headX =
    x +
    11 * scale;


  const headY =
    y;


  const headSize =
    20 * scale;


  ctx.fillStyle =
    "white";


  ctx.fillRect(
    headX,
    headY,
    headSize,
    headSize
  );


  // Head side
  ctx.beginPath();

  ctx.moveTo(
    headX +
    headSize,
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
    headX +
    headSize,
    headY +
    headSize
  );

  ctx.closePath();

  ctx.fillStyle =
    "#dcdcdc";

  ctx.fill();


  // Eye
  ctx.fillStyle =
    "black";


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
    "#f5a623";


  ctx.beginPath();

  ctx.moveTo(
    headX +
    headSize,
    headY +
    7 * scale
  );

  ctx.lineTo(
    headX +
    headSize +
    14 * scale,
    headY +
    11 * scale
  );

  ctx.lineTo(
    headX +
    headSize,
    headY +
    15 * scale
  );

  ctx.closePath();

  ctx.fill();


  // Comb
  ctx.fillStyle =
    "#d92828";


  for (
    let i = 0;
    i < 3;
    i++
  ) {

    ctx.fillRect(
      headX +
      (
        3 +
        i * 6
      ) *
      scale,

      headY -
      6 * scale,

      5 * scale,

      7 * scale
    );
  }


  // Wing
  ctx.fillStyle =
    "#dedede";


  ctx.fillRect(
    bodyX +
    5 * scale,

    bodyY +
    6 * scale,

    11 * scale,

    9 * scale
  );


  // Legs
  ctx.fillStyle =
    "#e59018";


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
// VEHICLES
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


    const depth =
      8 * scale;


    // Shadow
    ctx.fillStyle =
      "rgba(0,0,0,0.22)";


    ctx.fillRect(
      x,
      y +
      27 * scale,
      width,
      6 * scale
    );


    // Main body
    ctx.fillStyle =
      car.color;


    ctx.fillRect(
      x,
      y +
      6 * scale,
      width,
      24 * scale
    );


    // Top face
    ctx.beginPath();

    ctx.moveTo(
      x,
      y +
      6 * scale
    );

    ctx.lineTo(
      x + depth,
      y -
      depth +
      6 * scale
    );

    ctx.lineTo(
      x +
      width +
      depth,
      y -
      depth +
      6 * scale
    );

    ctx.lineTo(
      x + width,
      y +
      6 * scale
    );

    ctx.closePath();

    ctx.fillStyle =
      adjustColor(
        car.color,
        25
      );

    ctx.fill();


    // Side face
    ctx.beginPath();

    ctx.moveTo(
      x + width,
      y +
      6 * scale
    );

    ctx.lineTo(
      x +
      width +
      depth,
      y -
      depth +
      6 * scale
    );

    ctx.lineTo(
      x +
      width +
      depth,
      y +
      22 * scale
    );

    ctx.lineTo(
      x + width,
      y +
      30 * scale
    );

    ctx.closePath();

    ctx.fillStyle =
      adjustColor(
        car.color,
        -35
      );

    ctx.fill();


    // Roof
    if (
      car.type !== "truck"
    ) {

      ctx.fillStyle =
        car.type === "taxi"
          ? "#f8d43b"
          : adjustColor(
              car.color,
              12
            );


      ctx.fillRect(
        x +
        18 * scale,

        y,

        Math.max(
          25 * scale,
          width -
          38 * scale
        ),

        12 * scale
      );


      // Windows
      ctx.fillStyle =
        "#91d8ea";


      ctx.fillRect(
        x +
        23 * scale,
        y +
        2 * scale,
        16 * scale,
        8 * scale
      );


      ctx.fillRect(
        x +
        width -
        38 * scale,
        y +
        2 * scale,
        16 * scale,
        8 * scale
      );
    }


    // Truck cab
    if (
      car.type === "truck"
    ) {

      ctx.fillStyle =
        "#dedede";


      ctx.fillRect(
        x +
        width -
        34 * scale,

        y +
        7 * scale,

        34 * scale,

        23 * scale
      );


      ctx.fillStyle =
        "#91d8ea";


      ctx.fillRect(
        x +
        width -
        27 * scale,

        y +
        10 * scale,

        17 * scale,

        9 * scale
      );
    }


    // Taxi light
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
      "#111";


    ctx.beginPath();

    ctx.arc(
      x +
      18 * scale,
      y +
      31 * scale,
      5 * scale,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
      x +
      width -
      18 * scale,
      y +
      31 * scale,
      5 * scale,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }
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
      car.width <
      0
    ) {

      car.x =
        canvas.width;
    }
  }
}


// ======================================================
// LOGS
// ======================================================

function drawLogs() {

  for (
    let log of logs
  ) {

    const y =
      log.row *
      tileSize +
      cameraOffset +
      9;


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
        log.x,
        y
      );


    const width =
      log.width *
      scale;


    // Shadow
    ctx.fillStyle =
      "rgba(0,0,0,0.15)";


    ctx.fillRect(
      x,
      y +
      26 * scale,
      width,
      5 * scale
    );


    // Log body
    ctx.fillStyle =
      "#7b421f";


    ctx.fillRect(
      x,
      y +
      7 * scale,
      width,
      23 * scale
    );


    // Top
    ctx.fillStyle =
      "#a96332";


    ctx.fillRect(
      x +
      5 * scale,
      y +
      4 * scale,
      width -
      10 * scale,
      8 * scale
    );


    // Rings
    ctx.strokeStyle =
      "#4e2914";

    ctx.lineWidth =
      2 * scale;


    ctx.beginPath();

    ctx.arc(
      x +
      10 * scale,
      y +
      18 * scale,
      7 * scale,
      0,
      Math.PI * 2
    );

    ctx.stroke();


    // Bark lines
    ctx.fillStyle =
      "#5b3018";


    for (
      let bx =
        35 * scale;
      bx <
      width -
      10 * scale;
      bx +=
        35 * scale
    ) {

      ctx.fillRect(
        x + bx,
        y +
        12 * scale,
        3 * scale,
        13 * scale
      );
    }
  }
}


// ======================================================
// MOVE LOGS
// ======================================================

function moveLogs() {

  for (
    let log of logs
  ) {

    log.x +=
      log.speed *
      log.direction;


    if (
      log.direction === 1 &&
      log.x >
      canvas.width + 30
    ) {

      log.x =
        -log.width -
        30;
    }


    if (
      log.direction === -1 &&
      log.x +
      log.width <
      -30
    ) {

      log.x =
        canvas.width +
        30;
    }
  }
}


// ======================================================
// TRAIN TRACKS
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
    ctx.fillStyle =
      "#747474";


    ctx.fillRect(
      0,
      y,
      canvas.width,
      tileSize
    );


    // Wooden ties
    ctx.fillStyle =
      "#60401f";


    for (
      let x = -5;
      x <
      canvas.width;
      x += 27
    ) {

      ctx.fillRect(
        x,
        y + 6,
        13,
        38
      );
    }


    // Rail shadows
    ctx.fillStyle =
      "#404040";


    ctx.fillRect(
      0,
      y + 13,
      canvas.width,
      7
    );


    ctx.fillRect(
      0,
      y + 32,
      canvas.width,
      7
    );


    // Rails
    ctx.fillStyle =
      "#dddddd";


    ctx.fillRect(
      0,
      y + 12,
      canvas.width,
      4
    );


    ctx.fillRect(
      0,
      y + 31,
      canvas.width,
      4
    );


    drawTrainSignal(
      track,
      y
    );
  }
}


// ======================================================
// TRAIN SIGNAL
// ======================================================

function drawTrainSignal(
  track,
  y
) {

  const cycleTime =
    (
      performance.now() +
      track.timeOffset
    ) %
    track.cycleLength;


  const warning =
    cycleTime >=
    track.cycleLength -
    track.warningTime;


  const flashing =
    Math.floor(
      performance.now() /
      250
    ) %
    2 === 0;


  // Pole
  ctx.fillStyle =
    "#333";


  ctx.fillRect(
    25,
    y - 40,
    6,
    45
  );


  // Signal box
  ctx.fillStyle =
    "#111";


  ctx.fillRect(
    10,
    y - 43,
    36,
    22
  );


  // Red lights
  ctx.beginPath();

  ctx.arc(
    19,
    y - 32,
    6,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    warning &&
    flashing
      ? "red"
      : "#520000";

  ctx.fill();


  ctx.beginPath();

  ctx.arc(
    37,
    y - 32,
    6,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    warning &&
    !flashing
      ? "red"
      : "#520000";

  ctx.fill();


  // Bell
  ctx.fillStyle =
    "#d6af3b";


  ctx.beginPath();

  ctx.arc(
    28,
    y - 52,
    8,
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

    const AC =
      window.AudioContext ||
      window.webkitAudioContext;


    const audio =
      new AC();


    const oscillator =
      audio.createOscillator();


    const gain =
      audio.createGain();


    oscillator.connect(
      gain
    );


    gain.connect(
      audio.destination
    );


    oscillator.frequency.value =
      680;


    oscillator.type =
      "sine";


    gain.gain.setValueAtTime(
      0.10,
      audio.currentTime
    );


    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audio.currentTime +
      0.3
    );


    oscillator.start();


    oscillator.stop(
      audio.currentTime +
      0.3
    );

  } catch (error) {

  }
}


// ======================================================
// TRAIN
// ======================================================

function updateAndDrawTrains() {

  for (
    let track of trainTracks
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


    const fullWidth =
      900;


    let trainX;


    if (
      track.direction === 1
    ) {

      trainX =
        -fullWidth +
        (
          cycleTime /
          track.trainTime
        ) *
        (
          canvas.width +
          fullWidth
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
          fullWidth
        );
    }


    drawTrain(
      trainX,
      y,
      track.direction
    );


    if (
      player.row ===
      track.row
    ) {

      if (
        player.x <
        trainX +
        fullWidth &&

        player.x +
        player.width >
        trainX
      ) {

        restartGame();

        return;
      }
    }
  }
}


// ======================================================
// DRAW LONG TRAIN
// ======================================================

function drawTrain(
  trainX,
  y,
  direction
) {

  const scale =
    getScale(y);


  const engineWidth =
    130;


  const totalWidth =
    900;


  const engineWorldX =
    direction === 1
      ? trainX +
        totalWidth -
        engineWidth
      : trainX;


  drawTrainPiece(
    engineWorldX,
    y,
    engineWidth,
    "#272727",
    true
  );


  for (
    let i = 0;
    i < 6;
    i++
  ) {

    const carWidth =
      120;


    let carX;


    if (
      direction === 1
    ) {

      carX =
        engineWorldX -
        128 *
        (i + 1);

    } else {

      carX =
        engineWorldX +
        engineWidth +
        8 +
        128 *
        i;
    }


    drawTrainPiece(
      carX,
      y,
      carWidth,
      i % 2 === 0
        ? "#363636"
        : "#454545",
      false
    );
  }
}


// ======================================================
// DRAW TRAIN PIECE
// ======================================================

function drawTrainPiece(
  worldX,
  y,
  worldWidth,
  color,
  engine
) {

  const scale =
    getScale(y);


  const x =
    projectX(
      worldX,
      y
    );


  const width =
    worldWidth *
    scale;


  ctx.fillStyle =
    color;


  ctx.fillRect(
    x,
    y +
    6 * scale,
    width,
    35 * scale
  );


  // Roof
  ctx.fillStyle =
    "#555";


  ctx.fillRect(
    x +
    4 * scale,
    y,
    width -
    8 * scale,
    8 * scale
  );


  // Stripe
  ctx.fillStyle =
    "#9e1b24";


  ctx.fillRect(
    x,
    y +
    30 * scale,
    width,
    5 * scale
  );


  // Windows
  ctx.fillStyle =
    "#88d7ee";


  for (
    let wx =
      15 * scale;
    wx <
      width -
      18 * scale;
    wx +=
      30 * scale
  ) {

    ctx.fillRect(
      x + wx,
      y +
      13 * scale,
      18 * scale,
      10 * scale
    );
  }


  if (
    engine
  ) {

    ctx.fillStyle =
      "#ffe65c";


    ctx.fillRect(
      x +
      width -
      5 * scale,
      y +
      18 * scale,
      5 * scale,
      8 * scale
    );
  }
}


// ======================================================
// AIRPLANES
// ======================================================

function updateAirplanes() {

  for (
    let plane of airplanes
  ) {

    plane.worldY +=
      plane.speed;


    const field =
      plane.field;


    const bottomLimit =
      (
        field.bottomRow +
        1
      ) *
      tileSize;


    // Plane passed player side
    // reset back to far end
    if (
      plane.worldY >
      bottomLimit +
      70
    ) {

      plane.worldY =
        field.topRow *
        tileSize -
        80 -
        Math.random() *
        150;


      plane.x =
        40 +
        Math.random() *
        (
          canvas.width -
          120
        );
    }
  }
}


// ======================================================
// DRAW AIRPLANES
// ======================================================

function drawAirplanes() {

  for (
    let plane of airplanes
  ) {

    const y =
      plane.worldY +
      cameraOffset;


    if (
      y < -100 ||
      y >
      canvas.height + 100
    ) {
      continue;
    }


    const scale =
      getScale(y);


    const x =
      projectX(
        plane.x,
        y
      );


    const width =
      plane.width *
      scale;


    // Shadow
    ctx.fillStyle =
      "rgba(0,0,0,0.18)";


    ctx.beginPath();

    ctx.ellipse(
      x +
      width / 2,
      y +
      38 * scale,
      30 * scale,
      7 * scale,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();


    // Main fuselage
    ctx.fillStyle =
      "#eeeeee";


    ctx.fillRect(
      x +
      25 * scale,
      y,
      20 * scale,
      47 * scale
    );


    // Nose
    ctx.beginPath();

    ctx.moveTo(
      x +
      25 * scale,
      y
    );

    ctx.lineTo(
      x +
      35 * scale,
      y -
      14 * scale
    );

    ctx.lineTo(
      x +
      45 * scale,
      y
    );

    ctx.closePath();

    ctx.fillStyle =
      "#f8f8f8";

    ctx.fill();


    // Main wings
    ctx.fillStyle =
      "#d7d7d7";


    ctx.beginPath();

    ctx.moveTo(
      x +
      28 * scale,
      y +
      15 * scale
    );

    ctx.lineTo(
      x,
      y +
      31 * scale
    );

    ctx.lineTo(
      x +
      28 * scale,
      y +
      27 * scale
    );

    ctx.closePath();

    ctx.fill();


    ctx.beginPath();

    ctx.moveTo(
      x +
      42 * scale,
      y +
      15 * scale
    );

    ctx.lineTo(
      x +
      70 * scale,
      y +
      31 * scale
    );

    ctx.lineTo(
      x +
      42 * scale,
      y +
      27 * scale
    );

    ctx.closePath();

    ctx.fill();


    // Tail wings
    ctx.fillStyle =
      "#c5c5c5";


    ctx.fillRect(
      x +
      15 * scale,
      y +
      39 * scale,
      40 * scale,
      7 * scale
    );


    // Cockpit
    ctx.fillStyle =
      "#7fc8e8";


    ctx.fillRect(
      x +
      29 * scale,
      y +
      3 * scale,
      12 * scale,
      8 * scale
    );


    // Red nose light
    ctx.fillStyle =
      "#e53935";


    ctx.fillRect(
      x +
      32 * scale,
      y -
      12 * scale,
      6 * scale,
      5 * scale
    );
  }
}


// ======================================================
// AIRPLANE COLLISION
// ======================================================

function checkAirplaneCollision() {

  if (
    rows.get(
      player.row
    ) !== "airfield"
  ) {
    return false;
  }


  const playerYWorld =
    player.row *
    tileSize +
    5;


  for (
    let plane of airplanes
  ) {

    const field =
      plane.field;


    if (
      player.row >
      field.bottomRow ||
      player.row <
      field.topRow
    ) {
      continue;
    }


    const planeLeft =
      plane.x;


    const planeRight =
      plane.x +
      plane.width;


    const planeTop =
      plane.worldY;


    const planeBottom =
      plane.worldY +
      plane.height;


    const playerLeft =
      player.x;


    const playerRight =
      player.x +
      player.width;


    const playerTop =
      playerYWorld;


    const playerBottom =
      playerYWorld +
      player.height;


    const collision =
      playerLeft <
      planeRight &&

      playerRight >
      planeLeft &&

      playerTop <
      planeBottom &&

      playerBottom >
      planeTop;


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
// FENCE COLLISION
// ======================================================

function checkFenceCollision() {

  if (
    rows.get(
      player.row
    ) !== "fence"
  ) {
    return false;
  }


  // Gate is between x 250 and 350
  const gateLeft =
    250;


  const gateRight =
    350;


  if (
    player.x <
    gateLeft ||

    player.x +
    player.width >
    gateRight
  ) {

    // Push player back instead
    // of restarting entire game
    player.row++;

    return true;
  }


  return false;
}


// ======================================================
// ROAD COLLISION
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


    if (
      player.x <
      car.x +
      car.width &&

      player.x +
      player.width >
      car.x
    ) {

      restartGame();

      return true;
    }
  }


  return false;
}


// ======================================================
// WATER / LOG COLLISION
// ======================================================

function checkWaterCollision() {

  if (
    rows.get(
      player.row
    ) !== "water"
  ) {
    return false;
  }


  let standingOnLog =
    null;


  for (
    let log of logs
  ) {

    if (
      log.row !==
      player.row
    ) {
      continue;
    }


    if (
      player.x +
      player.width >
      log.x &&

      player.x <
      log.x +
      log.width
    ) {

      standingOnLog =
        log;

      break;
    }
  }


  if (
    !standingOnLog
  ) {

    restartGame();

    return true;
  }


  // Log carries chicken sideways
  player.x +=
    standingOnLog.speed *
    standingOnLog.direction;


  if (
    player.x +
    player.width <
    0 ||

    player.x >
    canvas.width
  ) {

    restartGame();

    return true;
  }


  return false;
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


  let speed =
    normalCameraSpeed;


  if (
    playerScreenY <
    dangerZoneY
  ) {

    speed =
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
      speed;


    if (
      cameraOffset >
      targetCameraOffset
    ) {

      cameraOffset =
        targetCameraOffset;
    }
  }


  generateMoreWorld(
    player.row - 55
  );
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

  moveLogs();

  updateAirplanes();


  drawBackground();

  drawTrainTracks();

  drawCars();

  drawLogs();

  drawAirplanes();

  updateAndDrawTrains();

  drawPlayer();


  const hitCar =
    checkCarCollision();


  if (
    !hitCar
  ) {

    const hitWater =
      checkWaterCollision();


    if (
      !hitWater
    ) {

      checkAirplaneCollision();

      checkFenceCollision();
    }
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
      !movementKeys.includes(
        event.key
      )
    ) {

      return;
    }


    event.preventDefault();

    gameStarted =
      true;


    // UP
    if (
      event.key ===
      "ArrowUp"
    ) {

      player.row--;

      score++;
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


    // Keep player inside canvas
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


    // Immediately check fence
    // so chicken cannot jump through it
    checkFenceCollision();


    // Camera emergency protection
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


    generateMoreWorld(
      player.row - 55
    );


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