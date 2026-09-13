const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 50;

let score = 0;
let gameStarted = false;


// ========================================
// CAMERA
// ========================================

let cameraOffset = 0;
let targetCameraOffset = 0;

const normalCameraSpeed = 0.20;
const fastCameraSpeed = 1.2;

const cameraAnchorY = 480;
const dangerZoneY = 140;
const minimumVisibleY = 70;


// ========================================
// PLAYER
// ========================================

const player = {
  x: 280,
  row: 10,
  width: 40,
  height: 40
};


// ========================================
// WORLD
// ========================================

const rows = new Map();

const cars = [];
const boats = [];
const trainTracks = [];


// ========================================
// VEHICLES
// ========================================

function createCarsForRow(row, direction, speed) {

  const vehicleTypes = [
    "car",
    "truck",
    "taxi",
    "van"
  ];

  const vehicleColors = [
    "red",
    "blue",
    "yellow",
    "purple",
    "orange",
    "green"
  ];


  function makeVehicle(x) {

    const type =
      vehicleTypes[
        Math.floor(
          Math.random() *
          vehicleTypes.length
        )
      ];

    const color =
      vehicleColors[
        Math.floor(
          Math.random() *
          vehicleColors.length
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


// ========================================
// BOATS
// ========================================

function createBoatsForRow(row, direction, speed) {

  if (direction === 1) {

    boats.push({
      row: row,
      x: -120,
      width: 120,
      height: 38,
      speed: speed,
      direction: direction
    });

    boats.push({
      row: row,
      x: 220,
      width: 120,
      height: 38,
      speed: speed,
      direction: direction
    });

    boats.push({
      row: row,
      x: 520,
      width: 120,
      height: 38,
      speed: speed,
      direction: direction
    });

  } else {

    boats.push({
      row: row,
      x: 650,
      width: 120,
      height: 38,
      speed: speed,
      direction: direction
    });

    boats.push({
      row: row,
      x: 320,
      width: 120,
      height: 38,
      speed: speed,
      direction: direction
    });

    boats.push({
      row: row,
      x: 20,
      width: 120,
      height: 38,
      speed: speed,
      direction: direction
    });
  }
}


// ========================================
// TRAIN TRACKS
// ========================================

function createTrainTrack(row) {

  const direction =
    Math.random() < 0.5
      ? 1
      : -1;

  trainTracks.push({
    row: row,

    direction: direction,

    // Long train
    width: 900,
    height: 42,

    cycleLength: 9000,

    // Warning happens before train
    warningTime: 2000,

    // Long train moves across screen
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


// ========================================
// STARTING WORLD
// ========================================

// Starting grass
rows.set(11, "grass");
rows.set(10, "grass");


// First two-lane road
rows.set(9, "road");
rows.set(8, "road");

createCarsForRow(9, 1, 3);
createCarsForRow(8, -1, 4);


// Safe grass
rows.set(7, "grass");


// One-lane road
rows.set(6, "road");

createCarsForRow(6, 1, 4);


// Safe grass
rows.set(5, "grass");


// Two-lane road
rows.set(4, "road");
rows.set(3, "road");

createCarsForRow(4, -1, 3.5);
createCarsForRow(3, 1, 4.5);


// Safe grass
rows.set(2, "grass");


// More roads
rows.set(1, "road");
rows.set(0, "road");

createCarsForRow(1, 1, 3.5);
createCarsForRow(0, -1, 4);


// Grass
rows.set(-1, "grass");


// ========================================
// FIRST RIVER
// ========================================

rows.set(-2, "water");
rows.set(-3, "water");

createBoatsForRow(-2, 1, 2);
createBoatsForRow(-3, -1, 2.5);


// Grass
rows.set(-4, "grass");


// ========================================
// MORE ROADS
// ========================================

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


// ========================================
// FIRST TRAIN TRACK
// ========================================

createTrainTrack(-10);


// Safe grass after train
rows.set(-11, "grass");


// ========================================
// SECOND RIVER
// ========================================

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


// Endless generation starts here
let nextRowToGenerate = -15;

let roadLanesSinceRiver = 0;


// ========================================
// GENERATE MORE WORLD
// ========================================

function generateMoreWorld(untilRow) {

  while (
    nextRowToGenerate >= untilRow
  ) {

    // ====================================
    // RIVER
    // ====================================

    if (
      roadLanesSinceRiver >= 5
    ) {

      // Grass before river
      rows.set(
        nextRowToGenerate,
        "grass"
      );

      nextRowToGenerate--;


      // Water lane 1
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


      // Water lane 2
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


      // Grass after river
      rows.set(
        nextRowToGenerate,
        "grass"
      );

      nextRowToGenerate--;


      roadLanesSinceRiver = 0;

      continue;
    }


    // ====================================
    // RANDOM TRAIN TRACK
    // ====================================

    if (
      Math.random() < 0.18
    ) {

      // Grass before train
      rows.set(
        nextRowToGenerate,
        "grass"
      );

      nextRowToGenerate--;


      // Train track
      createTrainTrack(
        nextRowToGenerate
      );

      nextRowToGenerate--;


      // Grass after train
      rows.set(
        nextRowToGenerate,
        "grass"
      );

      nextRowToGenerate--;


      continue;
    }


    // ====================================
    // ROAD
    // ====================================

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


    // Grass safe area
    rows.set(
      nextRowToGenerate,
      "grass"
    );

    nextRowToGenerate--;
  }
}


// Generate plenty ahead
generateMoreWorld(-45);


// ========================================
// BACKGROUND
// ========================================

function drawBackground() {

  // Grass
  ctx.fillStyle = "#7ac943";

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


    // ROAD
    if (
      type === "road"
    ) {

      ctx.fillStyle = "#555";

      ctx.fillRect(
        0,
        y,
        canvas.width,
        tileSize
      );
    }


    // WATER
    if (
      type === "water"
    ) {

      ctx.fillStyle = "#3399dd";

      ctx.fillRect(
        0,
        y,
        canvas.width,
        tileSize
      );


      // Water lines
      ctx.strokeStyle = "#73c8f2";
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
  }


  // ====================================
  // ROAD LANE LINES
  // ====================================

  ctx.strokeStyle = "white";
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


// ========================================
// PLAYER SCREEN Y
// ========================================

function getPlayerScreenY() {

  return (
    player.row *
    tileSize +
    cameraOffset +
    5
  );
}


// ========================================
// DRAW CHICKEN
// ========================================

function drawPlayer() {

  const x =
    player.x;

  const y =
    getPlayerScreenY();


  // Body
  ctx.fillStyle = "white";

  ctx.fillRect(
    x + 8,
    y + 12,
    24,
    20
  );


  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;

  ctx.strokeRect(
    x + 8,
    y + 12,
    24,
    20
  );


  // Head
  ctx.beginPath();

  ctx.arc(
    x + 20,
    y + 10,
    10,
    0,
    Math.PI * 2
  );

  ctx.fillStyle = "white";
  ctx.fill();

  ctx.stroke();


  // Wing
  ctx.fillStyle = "#eeeeee";

  ctx.fillRect(
    x + 10,
    y + 18,
    10,
    8
  );


  // Beak
  ctx.beginPath();

  ctx.moveTo(
    x + 28,
    y + 10
  );

  ctx.lineTo(
    x + 38,
    y + 7
  );

  ctx.lineTo(
    x + 38,
    y + 13
  );

  ctx.closePath();

  ctx.fillStyle = "orange";

  ctx.fill();

  ctx.strokeStyle = "black";
  ctx.stroke();


  // Comb
  ctx.fillStyle = "red";


  ctx.beginPath();
  ctx.arc(
    x + 14,
    y + 1,
    3,
    0,
    Math.PI * 2
  );
  ctx.fill();


  ctx.beginPath();
  ctx.arc(
    x + 20,
    y - 1,
    3,
    0,
    Math.PI * 2
  );
  ctx.fill();


  ctx.beginPath();
  ctx.arc(
    x + 26,
    y + 1,
    3,
    0,
    Math.PI * 2
  );
  ctx.fill();


  // Eye
  ctx.beginPath();

  ctx.arc(
    x + 23,
    y + 8,
    1.5,
    0,
    Math.PI * 2
  );

  ctx.fillStyle = "black";

  ctx.fill();


  // Legs
  ctx.strokeStyle = "orange";
  ctx.lineWidth = 2;


  ctx.beginPath();

  ctx.moveTo(
    x + 15,
    y + 32
  );

  ctx.lineTo(
    x + 15,
    y + 39
  );

  ctx.stroke();


  ctx.beginPath();

  ctx.moveTo(
    x + 25,
    y + 32
  );

  ctx.lineTo(
    x + 25,
    y + 39
  );

  ctx.stroke();


  // Feet
  ctx.beginPath();

  ctx.moveTo(
    x + 11,
    y + 39
  );

  ctx.lineTo(
    x + 18,
    y + 39
  );

  ctx.stroke();


  ctx.beginPath();

  ctx.moveTo(
    x + 22,
    y + 39
  );

  ctx.lineTo(
    x + 29,
    y + 39
  );

  ctx.stroke();
}


// ========================================
// DRAW VEHICLES
// ========================================

function drawCars() {

  for (
    let car of cars
  ) {

    const y =
      car.row *
      tileSize +
      cameraOffset +
      7;


    if (
      y < -50 ||
      y > canvas.height + 50
    ) {
      continue;
    }


    // ==========================
    // CAR
    // ==========================

    if (
      car.type === "car"
    ) {

      ctx.fillStyle =
        car.color;

      ctx.fillRect(
        car.x,
        y + 7,
        car.width,
        25
      );


      ctx.fillRect(
        car.x + 20,
        y,
        car.width - 40,
        15
      );


      ctx.fillStyle =
        "lightblue";

      ctx.fillRect(
        car.x + 25,
        y + 3,
        15,
        10
      );

      ctx.fillRect(
        car.x + 45,
        y + 3,
        15,
        10
      );
    }


    // ==========================
    // TRUCK
    // ==========================

    if (
      car.type === "truck"
    ) {

      ctx.fillStyle =
        car.color;

      ctx.fillRect(
        car.x,
        y + 5,
        75,
        27
      );


      ctx.fillStyle =
        "#dddddd";

      ctx.fillRect(
        car.x + 75,
        y + 10,
        35,
        22
      );


      ctx.fillStyle =
        "lightblue";

      ctx.fillRect(
        car.x + 82,
        y + 13,
        18,
        10
      );
    }


    // ==========================
    // TAXI
    // ==========================

    if (
      car.type === "taxi"
    ) {

      ctx.fillStyle =
        "gold";

      ctx.fillRect(
        car.x,
        y + 7,
        car.width,
        25
      );


      ctx.fillRect(
        car.x + 20,
        y,
        car.width - 40,
        15
      );


      ctx.fillStyle =
        "lightblue";

      ctx.fillRect(
        car.x + 25,
        y + 3,
        15,
        10
      );

      ctx.fillRect(
        car.x + 45,
        y + 3,
        15,
        10
      );


      ctx.fillStyle =
        "white";

      ctx.fillRect(
        car.x + 32,
        y - 5,
        20,
        7
      );


      ctx.fillStyle =
        "black";

      ctx.font =
        "6px Arial";

      ctx.fillText(
        "TAXI",
        car.x + 34,
        y
      );
    }


    // ==========================
    // VAN
    // ==========================

    if (
      car.type === "van"
    ) {

      ctx.fillStyle =
        car.color;

      ctx.fillRect(
        car.x,
        y + 2,
        car.width,
        30
      );


      ctx.fillStyle =
        "lightblue";

      ctx.fillRect(
        car.x + 15,
        y + 7,
        25,
        12
      );


      ctx.fillRect(
        car.x +
        car.width -
        30,

        y + 7,

        20,
        12
      );
    }


    // Wheels
    ctx.fillStyle =
      "black";


    ctx.beginPath();

    ctx.arc(
      car.x + 18,
      y + 33,
      5,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
      car.x +
      car.width -
      18,

      y + 33,

      5,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }
}


// ========================================
// MOVE VEHICLES
// ========================================

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


// ========================================
// DRAW BOATS
// ========================================

function drawBoats() {

  for (
    let boat of boats
  ) {

    const y =
      boat.row *
      tileSize +
      cameraOffset +
      6;


    if (
      y < -50 ||
      y >
      canvas.height + 50
    ) {
      continue;
    }


    // Main boat
    ctx.fillStyle =
      "#8B4513";

    ctx.fillRect(
      boat.x,
      y + 10,
      boat.width,
      24
    );


    // Pointed front
    ctx.beginPath();


    if (
      boat.direction === 1
    ) {

      ctx.moveTo(
        boat.x +
        boat.width,
        y + 10
      );

      ctx.lineTo(
        boat.x +
        boat.width +
        15,
        y + 22
      );

      ctx.lineTo(
        boat.x +
        boat.width,
        y + 34
      );

    } else {

      ctx.moveTo(
        boat.x,
        y + 10
      );

      ctx.lineTo(
        boat.x - 15,
        y + 22
      );

      ctx.lineTo(
        boat.x,
        y + 34
      );
    }


    ctx.closePath();

    ctx.fill();


    // Interior
    ctx.fillStyle =
      "#c68642";

    ctx.fillRect(
      boat.x + 15,
      y + 14,
      boat.width - 30,
      14
    );


    // Outline
    ctx.strokeStyle =
      "#4a260b";

    ctx.lineWidth = 2;

    ctx.strokeRect(
      boat.x,
      y + 10,
      boat.width,
      24
    );
  }
}


// ========================================
// MOVE BOATS
// ========================================

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


// ========================================
// DRAW TRAIN TRACKS
// ========================================

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


    // Gravel base
    ctx.fillStyle =
      "#737373";

    ctx.fillRect(
      0,
      y,
      canvas.width,
      tileSize
    );


    // Gravel stones
    ctx.fillStyle =
      "#929292";

    for (
      let x = 0;
      x <
      canvas.width;
      x += 18
    ) {

      ctx.fillRect(
        x,
        y + 4,
        7,
        4
      );

      ctx.fillRect(
        x + 8,
        y + 41,
        7,
        4
      );
    }


    // Wooden railroad ties
    ctx.fillStyle =
      "#63401f";

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


    // Dark underside of rails
    ctx.fillStyle =
      "#444";

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


    // Silver rails
    ctx.fillStyle =
      "#d9d9d9";

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


    // ====================================
    // SIGNAL TIMING
    // ====================================

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


    // ====================================
    // CROSSING SIGNAL
    // ====================================

    // Pole
    ctx.fillStyle =
      "#333";

    ctx.fillRect(
      18,
      y - 42,
      6,
      48
    );


    // Signal housing
    ctx.fillStyle =
      "#111";

    ctx.fillRect(
      3,
      y - 43,
      36,
      22
    );


    const flashing =
      Math.floor(
        performance.now() /
        250
      ) %
      2 === 0;


    // Left red light
    ctx.beginPath();

    ctx.arc(
      13,
      y - 32,
      7,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      warning &&
      flashing
        ? "red"
        : "#520000";

    ctx.fill();


    // Right red light
    ctx.beginPath();

    ctx.arc(
      29,
      y - 32,
      7,
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
      "#d4af37";

    ctx.beginPath();

    ctx.arc(
      21,
      y - 52,
      9,
      0,
      Math.PI * 2
    );

    ctx.fill();


    // Bell bottom
    ctx.fillRect(
      17,
      y - 46,
      8,
      6
    );
  }
}


// ========================================
// TRAIN BELL
// ========================================

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


    gain.gain
      .setValueAtTime(
        0.12,
        audioContext.currentTime
      );


    gain.gain
      .exponentialRampToValueAtTime(
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

    // Ignore blocked browser audio
  }
}


// ========================================
// DRAW + MOVE TRAIN
// ========================================

function updateAndDrawTrains() {

  for (
    let track
    of trainTracks
  ) {

    const y =
      track.row *
      tileSize +
      cameraOffset +
      2;


    const cycleTime =
      (
        performance.now() +
        track.timeOffset
      ) %
      track.cycleLength;


    const warningStart =
      track.cycleLength -
      track.warningTime;


    // ====================================
    // WARNING
    // ====================================

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


    // ====================================
    // TRAIN PERIOD
    // ====================================

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


    // ====================================
    // ENGINE
    // ====================================

    const engineWidth =
      130;


    const engineX =
      track.direction === 1
        ? trainX +
          fullTrainWidth -
          engineWidth
        : trainX;


    // Engine body
    ctx.fillStyle =
      "#202020";

    ctx.fillRect(
      engineX,
      y + 5,
      engineWidth,
      36
    );


    // Engine roof
    ctx.fillStyle =
      "#383838";

    ctx.fillRect(
      engineX + 25,
      y,
      75,
      12
    );


    // Red stripe
    ctx.fillStyle =
      "#b22222";

    ctx.fillRect(
      engineX,
      y + 29,
      engineWidth,
      6
    );


    // Engine cab
    ctx.fillStyle =
      "#454545";


    if (
      track.direction === 1
    ) {

      ctx.fillRect(
        engineX + 90,
        y + 7,
        40,
        31
      );

    } else {

      ctx.fillRect(
        engineX,
        y + 7,
        40,
        31
      );
    }


    // Cab window
    ctx.fillStyle =
      "#8fd8ff";


    if (
      track.direction === 1
    ) {

      ctx.fillRect(
        engineX + 99,
        y + 12,
        20,
        12
      );

    } else {

      ctx.fillRect(
        engineX + 10,
        y + 12,
        20,
        12
      );
    }


    // Headlight
    ctx.fillStyle =
      "yellow";


    if (
      track.direction === 1
    ) {

      ctx.fillRect(
        engineX +
        engineWidth -
        5,

        y + 18,

        5,
        8
      );

    } else {

      ctx.fillRect(
        engineX,
        y + 18,
        5,
        8
      );
    }


    // Engine wheels
    ctx.fillStyle =
      "black";


    ctx.beginPath();

    ctx.arc(
      engineX + 24,
      y + 42,
      6,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
      engineX +
      engineWidth -
      24,

      y + 42,

      6,
      0,
      Math.PI * 2
    );

    ctx.fill();


    // ====================================
    // TRAIN CARS
    // ====================================

    const carWidth =
      120;

    const gap =
      8;

    const numberOfCars =
      6;


    for (
      let i = 0;
      i < numberOfCars;
      i++
    ) {

      let carX;


      if (
        track.direction === 1
      ) {

        carX =
          engineX -
          gap -
          carWidth -
          i *
          (
            carWidth +
            gap
          );

      } else {

        carX =
          engineX +
          engineWidth +
          gap +
          i *
          (
            carWidth +
            gap
          );
      }


      // Train car
      ctx.fillStyle =
        i % 2 === 0
          ? "#303030"
          : "#3b3b3b";


      ctx.fillRect(
        carX,
        y + 7,
        carWidth,
        34
      );


      // Red stripe
      ctx.fillStyle =
        "#8b0000";

      ctx.fillRect(
        carX,
        y + 30,
        carWidth,
        5
      );


      // Windows
      ctx.fillStyle =
        "#8fd8ff";


      for (
        let w = 12;
        w <
        carWidth - 15;
        w += 28
      ) {

        ctx.fillRect(
          carX + w,
          y + 13,
          18,
          10
        );
      }


      // Connector
      ctx.fillStyle =
        "#111";


      if (
        track.direction === 1
      ) {

        ctx.fillRect(
          carX +
          carWidth,

          y + 21,

          gap,

          5
        );

      } else {

        ctx.fillRect(
          carX - gap,
          y + 21,
          gap,
          5
        );
      }


      // Wheels
      ctx.fillStyle =
        "black";


      ctx.beginPath();

      ctx.arc(
        carX + 20,
        y + 42,
        5,
        0,
        Math.PI * 2
      );

      ctx.fill();


      ctx.beginPath();

      ctx.arc(
        carX +
        carWidth -
        20,

        y + 42,

        5,
        0,
        Math.PI * 2
      );

      ctx.fill();
    }


    // ====================================
    // COLLISION
    // ====================================

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


// ========================================
// CAMERA
// ========================================

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


  // Emergency catch up
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


// ========================================
// CAR COLLISION
// ========================================

function checkCarCollision() {

  if (
    rows.get(
      player.row
    ) !== "road"
  ) {

    return false;
  }


  for (
    let car
    of cars
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


// ========================================
// WATER COLLISION
// ========================================

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
    let boat
    of boats
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


  // Fell in water
  if (
    !standingOnBoat
  ) {

    restartGame();

    return;
  }


  // Boat carries player
  player.x +=
    standingOnBoat.speed *
    standingOnBoat.direction;


  // Boat carried chicken off screen
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


// ========================================
// RESTART
// ========================================

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


// ========================================
// GAME LOOP
// ========================================

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


// ========================================
// CONTROLS
// ========================================

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


    // MOVE UP
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


    // MOVE DOWN
    if (
      event.key ===
      "ArrowDown"
    ) {

      player.row++;
    }


    // MOVE LEFT
    if (
      event.key ===
      "ArrowLeft"
    ) {

      player.x -=
        tileSize;
    }


    // MOVE RIGHT
    if (
      event.key ===
      "ArrowRight"
    ) {

      player.x +=
        tileSize;
    }


    // Keep player in screen unless on water
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


    document
      .getElementById(
        "score"
      )
      .textContent =
      "Score: " +
      score;
  }
);


// ========================================
// START GAME
// ========================================

gameLoop();