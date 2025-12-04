// ============================
// Offline Worlds - script.js (fixed + sprite animation)
// ============================

// Canvas Setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Camera
let cameraX = 0;
let cameraTargetX = 0;
const CAMERA_EASE = 0.08;

let exhibitAnimTimer = 0;
let exhibitAnimFrame = 0; // 0 = frame1, 1 = frame2

// ============================
// NPC SETUP (Supports Multiple NPCs)
// ============================
const npcs = [];

// Helper to create NPCs easily
function createNPC(startX, startY, spritePrefix) {
  const npc = {
    x: startX,
    y: startY,
    width: 70,
    height: 100,
    speed: 1.2,
    direction: 1,
    animFrame: 0,
    animTimer: 0,
    sprites: []
  };

  // Load sprites like npcwalk1, npcwalk2, npcwalk3
  for (let i = 1; i <= 3; i++) {
    const img = new Image();
    img.src = `images/${spritePrefix}${i}.png`;
    npc.sprites.push(img);
  }

  npcs.push(npc);
}

// NPC1 → uses npcwalk1.png, npcwalk2.png, npcwalk3.png
createNPC(700, 560 - 100, "npcwalk");

// NPC2 → npc2walk1.png, npc2walk2.png, npc2walk3.png
createNPC(900, 369 - 100, "npc2walk");

// NPC3 → npc3walk1.png, npc3walk2.png, npc3walk3.png
createNPC(100, 369 - 100, "npc3walk");

// NPC4 → npc4walk1.png, npc4walk2.png, npc4walk3.png
createNPC(1700, 180 - 100, "npc4walk");

// Player Setup
const player = {
  x: -50,
  y: 400,
  width: 70,
  height: 100,
  vx: 0,
  vy: 0,
  speed: 3,
  jumpPower: 19,
  onGround: false,
  direction: 1,    // 1 = right, -1 = left
  animFrame: 0,
  animTimer: 0,
  prevY: 500,
  dropThroughTimer: 0
};

const gravity = 0.7;
const MAX_FALL = 24;



// Platforms
const platforms = [
  { x: -500, y: 559, width: 3000, height: 60, isGround: true }, //bottom platform
  { x: -500, y: 369, width: 3000, height: 30, isGround: false }, //platform1 mid
  { x: -500, y: 178, width: 3000, height: 30, isGround: false }, //platform2 top
// wallborder1
  { x: -1000, y:0, width: 750, height: 750, isGround: false },
//wallborder2
  { x: 2000, y:0, width: 750, height: 750, isGround: false },

  
];

// Exhibit Images
const exhibitImages = {};
const imageNames = [

  "ChellPortal",
  "Coach_4D",
  "Concord",
  "DeadSpace",
  "HalfLife",
  "KalWardin",
  "PrototypeMercer",
  "ReginaDino",
  "Scout",
  "SplinterCell",
  "StarWarsArcann",
  "UnrealXan",
  
];

// ============================
// STATIC BARON CHARACTER DISPLAY
// ============================

// Load Baron Display Sprites
const baronDisplay = {
  x: 1600,      // adjust position anywhere you want
  y: 37,       // ground level
  width: 150,
  height: 150,
  animFrame: 0,
  animTimer: 0,
  sprites: [
    (() => { let img = new Image(); img.src = "images/BaronSprite1.png"; return img; })(),
    (() => { let img = new Image(); img.src = "images/BaronSprite2.png"; return img; })()
  ]
};

// Animate Baron (simple flip between 2 frames)
function updateBaronDisplay() {
  baronDisplay.animTimer++;
  if (baronDisplay.animTimer >= 45) {   // change every 45 frames
    baronDisplay.animTimer = 0;
    baronDisplay.animFrame = (baronDisplay.animFrame + 1) % 2;
  }
}

// Draw Baron
function drawBaronDisplay() {
  const img = baronDisplay.sprites[baronDisplay.animFrame];
  ctx.drawImage(
    img,
    baronDisplay.x - cameraX,
    baronDisplay.y,
    baronDisplay.width,
    baronDisplay.height
  );
}


imageNames.forEach(name => {
  exhibitImages[name] = {
    frame1: new Image(),
    frame2: new Image()
  };

  exhibitImages[name].frame1.src = `images/${name}.png`;
  exhibitImages[name].frame2.src = `images/${name}Sprite2.png`;
});

// ===============================
// EXHIBIT INFORMATION DATABASE
// ===============================
const exhibitInfo = {
  ChellPortal: {
    title: "Portal — (2007–2011)",
    body: `
<b>Status:</b> <span style="color:#ff6666;">Dormant / Inactive</span><br><br>

<b>Shutdown Path:</b> Portal never “shut down,” but the franchise stalled after Portal 2.  

Valve’s flat structure discouraged sequels unless a major innovation existed.<br><br>

<b>Fandom Trajectory:</b> Extremely active from 2007–2014, later became a “heritage fandom.”  
Still produces memes, mods, and ARG speculation but no new canonical content.<br><br>

<b>Death Classification:</b> <b>Class 3 — Dormant Legend</b>
`
  },

  Coach_4D: {
    title: "Left 4 Dead — (2008–2012)",
    body: `
<b>Status:</b> <span style="color:#ffaa00;">Soft-Dead, Community-Alive</span><br><br>

<b>Synopsis: </b>Zombies. Also you're in a team of four and can choose who you wanna play as. These zombies are fast af.<br><br>

<b>Shutdown Path:</b> Active content ended after “The Last Stand” (fan update).  
Valve ceased official development.<br><br>

<b>Fandom Trajectory:</b> Still extremely active due to mods.  
Game is “Functionally Immortal” because of modding tools.<br><br>

<b>Death Classification:</b> <b>Class 2 — Zombie Game (Literally)</b>
`
  },

  Concord: {
    title: "Concord — (2024–2024)",
    body: `
<b>Status:</b> <span style="color:#ff0000;">Dead on Arrival</span><br><br>

<b>Shutdown Path:</b> Poor launch, low player base, shut down within months. An utter 'clusterf*ck' thanks to SONY.
The character designs were all bland and completely unattractive. Firewalk Studios had such a big issue with 'positive toxicity' which was that
nobody in the studio had balls to critique stuff, hence this low-lived Guardians of the Galaxy rip-off.<br><br>

<b>Fandom Trajectory:</b> Minimal. Tiny meme community mocking its short lifespan.<br><br>

<b>Death Classification:</b> <b>Class 1 — Immediate Collapse</b>
`
  },

  DeadSpace: {
    title: "Dead Space — (2008–2013, 2023 reboot)",
    body: `
<b>Status:</b> <span style="color:#ffaa00;">Dormant Again</span><br><br>

<b>Synopsis:</b> You're Isaac Clarke. A space engineer. You're fighting these dead thingies called 'necromorphs' who are reanimated corpses
of humans. Trust me, this game would've given you nightmares if you played this as a kid. It's kinda like HALO but you're not Master Chief.
You're Master Cheeks and you're a rookie. Your signature move is basically “Step on me.”<br><br>

<b>Shutdown Path:</b> The series died after DS3 because it didn't perform well compared to the previous ones, 
revived in 2023 with a remake of DS1, then died again due to layoffs.<br><br>

<b>Fandom Trajectory:</b> Hardcore fanbase stayed loyal. Franchise sees periodic revivals in interest.<br><br>

<b>Death Classification:</b> <b>Class 3 — Dormant Legend</b>
`
  },

  HalfLife: {
    title: "Half-Life — (1998–2007, 2020 VR revival)",
    body: `
<b>Status:</b> <span style="color:#ffaa00;">Perpetually Dormant</span><br><br>

<b>Synopsis: </b>Also a take on the zombie genre. You got facehuggers and a dude in an orange jumpsuit with a crowbar. 
Mondays amirite?<br><br>

<b>Shutdown Path:</b> No official HL3. Valve avoids continuation. Though there are recent rumors of Half-Life 3 being in the works.<br><br>

<b>Fandom Trajectory:</b> Still produces theories, mods, fan games. 
Community refuses to let it die. Don't even get me started on the Cinematic Mod.<br><br>

<b>Death Classification:</b> <b>Class 4 — Schrödinger’s Game</b>
`
  },

  KalWardin: {
    title: "N.O.V.A — (2009–2020)",
    body: `
<b>Status:</b> <span style="color:#ff6666;">Dead (Server-Dependent)</span><br><br>

<b>Synopsis: </b>Basically a mobile version of HALO. You're shooting aliens to save humanity and all that jazz. Loved playing it back in
the 2010's. Though the small issue was that it wasted my phone batter much faster.<br><br>

<b>Shutdown Path:</b> Mobile FPS series died as Gameloft pivoted to microtransaction-heavy titles and couldn't fulfill the new 64x rules.<br><br>

<b>Fandom Trajectory:</b> Small nostalgic community, mostly speedrunners.<br><br>

<b>Death Classification:</b> <b>Class 5 — Server-Dependent Casualty</b>
`
  },

  PrototypeMercer: {
    title: "[PROTOTYPE] — (2009–2012)",
    body: `
<b>Status:</b> <span style="color:#ffaa00;">Dead Franchise, Living Cult</span><br><br>

<b>Synopsis: </b>You play as Alex Mercer in the first game, and James Heller in the second. 
Think GTA but you/ve got supernatural abilities and can turn your body into weapons like Venom.<br><br>

<b>Shutdown Path:</b> Activision dissolved Radical Entertainment after P2 underperformed.<br><br>

<b>Fandom Trajectory:</b> Very strong cult fanbase.  
Memes and power-scaling debates keep it alive.<br><br>

<b>Death Classification:</b> <b>Class 2 — Zombie Game</b>
`
  },

  ReginaDino: {
    title: "Dino Crisis — (1999–2003)",
    body: `
<b>Status:</b> <span style="color:#ff6666;">Dead</span><br><br>

<b>Synopsis: </b>Dinosaurs. That's all I know about this game tbh.<br><br>

<b>Shutdown Path:</b> Capcom pivoted to Resident Evil and abandoned the franchise.<br><br>

<b>Fandom Trajectory:</b> Strong desperation community begging for a remake every year.<br><br>

<b>Death Classification:</b> <b>Class 3 — Dormant Legend</b>
`
  },

  Scout: {
    title: "Team Fortress 2 — (2007–Present)",
    body: `
<b>Status:</b> <span style="color:#ffaa00;">Community-Alive, Developer-Dead</span><br><br>

<b>Shutdown Path:</b> Valve stopped major updates; bot crisis nearly killed game.<br><br>

<b>Fandom Trajectory:</b> One of Steam’s most active modding communities. Along with the SFM animation community
that uses many assets from TF2 for various projects.<br><br>

<b>Death Classification:</b> <b>Class 2 — Zombie Game<br><br>

<b>Personal Comment by the Creator:</b> Shutup James.
`
  },

  SplinterCell: {
    title: "Splinter Cell — (2002–2013)",
    body: `
<b>Status:</b> <span style="color:#ffaa00;">Dormant / Awaiting Reboot</span><br><br>

<b>Shutdown Path:</b> Ubisoft stalled series after Blacklist underperformed.<br><br>

<b>Fandom Trajectory:</b> Hardcore stealth loyalists keep the name alive.<br><br>

<b>Death Classification:</b> <b>Class 3 — Dormant Legend</b>
`
  },

  StarWarsArcann: {
    title: "Star Wars: The Old Republic — (2011–2024 server transfer)",
    body: `
<b>Status:</b> <span style="color:#ffaa00;">Aging MMO, Not Dead</span><br><br>

<b>Shutdown Path:</b> Bioware transferred operations to Broadsword; active but shrinking.<br><br>

<b>Fandom Trajectory:</b> Tight-knit MMO community; roleplayers remain active.<br><br>

<b>Death Classification:</b> <b>Class 6 — Slow Fade MMO</b>
`
  },

  UnrealXan: {
    title: "Unreal Tournament — (1999–2017)",
    body: `
<b>Status:</b> <span style="color:#ff6666;">Dead</span><br><br>

<b>Shutdown Path:</b> Epic halted development to focus on Fortnite.<br><br>

<b>Fandom Trajectory:</b> Legacy arena shooter players maintain tiny servers. 
The game was given it's own episode in the animated series of Secret Level, featuring Xan Kriegor.<br><br>

<b>Death Classification:</b> <b>Class 4 — Schrödinger’s Game</b>
`
  }
};



// Exhibit Positions (3 rows × 4 columns)
const exhibits = [];
const startX = 200;
let index = 0;

for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 4; col++) {
    exhibits.push({
      x: startX + col * 300,
      y: 412 - row * 190,
      width: 150,
      height: 150,
      name: imageNames[index],
      scaleX: 1,
      scaleY: 1
    });
    index++;
  }
}

// Custom Scale Tweaks (examples)
exhibits[0].scaleX = 1.1; //chell
exhibits[1].scaleX = 1.15; //coach
exhibits[2].scaleX = 0.9; //concrd
exhibits[3].scaleX = 1.1; //deadspace
exhibits[5].scaleX = 1.1;
exhibits[5].scaleY = 1.05; //kalwardin
exhibits[6].scaleX = 1.1; //alexmercer
exhibits[7].scaleX = 0.95; 
exhibits[8].scaleX = 0.8; 
exhibits[9].scaleX = 1.0; //splintercell
exhibits[9].scaleY = 1.0;
exhibits[10].scaleX = 1.1; //arcann
exhibits[10].scaleY = 0.98;
//exhibits[10].scaleY =

// ----------------------
// Player Sprites (load early)
// ----------------------
const playerSprites = {
  walk: [],
  jump: new Image(),
  idle: new Image()
};

// WALK sprites
for (let i = 1; i <= 3; i++) {
  const img = new Image();
  img.src = `images/sprite${i}.png`;
  playerSprites.walk.push(img);
}

// JUMP
playerSprites.jump.src = "images/sprite4.png";

// IDLE (NEW)
playerSprites.idle.src = "images/idlesprite.png";

// Input
const keys = {};
let isMoving = false;

document.addEventListener("keydown", e => {
  keys[e.key] = true;

  // Movement detection (NEW)
  if (e.key === "a" || e.key === "ArrowLeft" || e.key === "d" || e.key === "ArrowRight") {
    isMoving = true;
  }
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;

  // Stop movement (NEW)
  if (e.key === "a" || e.key === "ArrowLeft" || e.key === "d" || e.key === "ArrowRight") {
    isMoving = false;
  }
});


// Sidebar
const sidebar = document.getElementById("sidebar");
const exTitle = document.getElementById("exTitle");
const exBody = document.getElementById("exBody");
const closeBtn = document.getElementById("closeBtn");
closeBtn.onclick = () => sidebar.classList.remove("open");

canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  // convert to canvas coordinates and account for cameraX
  const clickX = (e.clientX - rect.left) * (canvas.width / rect.width) + cameraX;
  const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

  // ----- Baron Display Click -----
if (
  clickX >= baronDisplay.x &&
  clickX <= baronDisplay.x + baronDisplay.width &&
  clickY >= baronDisplay.y &&
  clickY <= baronDisplay.y + baronDisplay.height
) {
  const info = exhibitInfo["BaronScorch"];
  exTitle.innerHTML = info?.title || "Baron Scorch";
  exBody.innerHTML = info?.body || `

<b>"I'm not a statue dumbass."</b> <span style="color:#ff6666;"><br><br></span>

<b>Hobbies:</b> Sleeping, drinking coffee, playing Minecraft, making animations, and terrorizing James.<br><br>

<b>Fun Fact:</b> Baron is basically if Scorpion from Mortal Kombat and Kratos from God of War had a DragonballZ fusion. I know. 
It's not original. To be fair, it's really hard to be original nowadays.<br><br>

<b>Origins:</b> <b>Wrath of Reyath and DnD Campaigns.</b>

`;
  
  // Play sound
  if (typeof displayClickSound !== "undefined") {
    displayClickSound.currentTime = 0;
    displayClickSound.play().catch(()=>{});
  }

  sidebar.classList.add("open");
  return;
}


  // ---------- 1) Exhibit check (stop after first hit) ----------
  let handled = false;
  for (let i = 0; i < exhibits.length; i++) {
    const ex = exhibits[i];
    if (
      clickX >= ex.x &&
      clickX <= ex.x + ex.width &&
      clickY >= ex.y &&
      clickY <= ex.y + ex.height
    ) {
      const info = exhibitInfo[ex.name];
      if (info) {
        exTitle.innerHTML = info.title;
        exBody.innerHTML = info.body;
      } else {
        exTitle.textContent = ex.name;
        exBody.textContent = "No information available.";
      }

      // Play exhibit open sound
      if (typeof displayClickSound !== "undefined") {
        displayClickSound.currentTime = 0;
        displayClickSound.play().catch(()=>{/* play blocked until user gesture (ok) */});
      }

      sidebar.classList.add("open");
      handled = true;
      break; // stop checking other exhibits
    }
  }

  if (handled) return; // we already opened an exhibit — don't also open an NPC

  // ---------- 2) NPC check (single npc OR an array of npcs) ----------
  // check an array 'npcs' first (if you later add many NPCs)
  if (typeof npcs !== "undefined" && Array.isArray(npcs)) {
    for (let i = 0; i < npcs.length; i++) {
      const n = npcs[i];
      if (
        clickX >= n.x &&
        clickX <= n.x + n.width &&
        clickY >= n.y &&
        clickY <= n.y + n.height
      ) {
        exTitle.textContent = n.name || "Visitor";
        exBody.textContent = n.dialogue || "They don't have much to say.";
        if (typeof displayClickSound !== "undefined") {
          displayClickSound.currentTime = 0;
          displayClickSound.play().catch(()=>{});
        }
        sidebar.classList.add("open");
        handled = true;
        break;
      }
    }
    if (handled) return;
  }

  // If you only have the single 'npc' object (current state of your file), check that too:
  if (typeof npc !== "undefined") {
    const n = npc;
    if (
      clickX >= n.x &&
      clickX <= n.x + n.width &&
      clickY >= n.y &&
      clickY <= n.y + n.height
    ) {
      exTitle.textContent = n.name || "Visitor";
      exBody.textContent = n.dialogue || "They don't have much to say.";
      if (typeof displayClickSound !== "undefined") {
        displayClickSound.currentTime = 0;
        displayClickSound.play().catch(()=>{});
      }
      sidebar.classList.add("open");
      return;
    }
  }

  // ---------- 3) (optional) click on empty space: close the sidebar ----------
  // If you want clicks on empty space to close the sidebar, uncomment:
  // sidebar.classList.remove("open");
});


// Movement + Physics
function updatePlayer() {
  player.prevY = player.y;

  // Horizontal movement
  player.vx = 0;
  if (keys["a"] || keys["ArrowLeft"]) player.vx = -player.speed;
  if (keys["d"] || keys["ArrowRight"]) player.vx = player.speed;

// Jump
if ((keys["w"] || keys["ArrowUp"]) && player.onGround) {
    player.vy = -player.jumpPower;
    player.onGround = false;

    // Play jump SFX
    jumpSound.currentTime = 0; // allow rapid repeat jumps
    jumpSound.play();
}

  // Request platform drop-through (only when standing on a platform)
  if ((keys["s"] || keys["ArrowDown"]) && player.onGround) {
    const standingPlatform = platforms.find(p =>
      player.x + player.width > p.x &&
      player.x < p.x + p.width &&
      Math.abs(player.y + player.height - p.y) <= 6
    );

    if (standingPlatform && !standingPlatform.isGround) {
      player.dropThroughTimer = 10; // frames to ignore collision (~160ms at 60fps)
      player.onGround = false;
      player.vy = 4; // kick downward so the player passes through
    }
  }

  // If holding down mid-air and not currently in a drop-through window
  if ((keys["s"] || keys["ArrowDown"]) && !player.onGround && player.dropThroughTimer === 0) {
    player.vy += 1.2;
  }

  // gravity & clamp
  player.vy = Math.min(player.vy + gravity, MAX_FALL);

  player.x += player.vx;
  player.y += player.vy;

  if (player.dropThroughTimer > 0) player.dropThroughTimer--;

  handleCollisions();

  // direction for flipping
  if (player.vx > 0) player.direction = 1;
  else if (player.vx < 0) player.direction = -1;

  // Animation updates
  if (player.onGround) {
    if (player.vx !== 0) {
      player.animTimer++;
      if (player.animTimer > 10) {
        player.animFrame = (player.animFrame + 1) % playerSprites.walk.length;
        player.animTimer = 0;
      }
    } else {
      player.animFrame = 0; // idle frame
      player.animTimer = 0;
    }
  } else {
    player.animFrame = "jump";
  }
}

function updateNPCs() {
  npcs.forEach(npc => {

    // Move NPC
    npc.x += npc.speed * npc.direction;

    // Animate every 0.5 seconds
    npc.animTimer++;
    if (npc.animTimer >= 30) {
      npc.animTimer = 0;
      npc.animFrame = (npc.animFrame + 1) % npc.sprites.length;
    }

    // Wall detection
    const npcLeft = npc.x;
    const npcRight = npc.x + npc.width;
    const npcBottom = npc.y + npc.height;
    const npcTop = npc.y;

    platforms.forEach(p => {
      const isWall = p.width > 200 && p.height > 500;
      if (!isWall) return;

      const overlapsVertically =
        npcBottom > p.y &&
        npcTop < p.y + p.height;

      if (!overlapsVertically) return;

      const platLeft = p.x;
      const platRight = p.x + p.width;

      // Right-moving into wall
      if (npcRight > platLeft && npcLeft < platLeft && npc.direction === 1) {
        npc.direction = -1;
      }

      // Left-moving into wall
      if (npcLeft < platRight && npcRight > platRight && npc.direction === -1) {
        npc.direction = 1;
      }
    });
  });
}



// Collision Detection (one-way platforms)
function handleCollisions() {
  player.onGround = false;

  // -----------------------------
  // 1. Vertical Collision (same as before)
  // -----------------------------
  const ordered = platforms.slice().sort((a,b)=>a.y - b.y);

  for (const p of ordered) {
    // skip drop-through
    if (player.dropThroughTimer > 0 && !p.isGround) continue;

    const withinX = player.x < p.x + p.width && player.x + player.width > p.x;
    const fallingOnto =
      player.prevY + player.height <= p.y &&
      player.y + player.height >= p.y;

    if (withinX && fallingOnto && player.vy >= 0) {
      player.y = p.y - player.height;
      player.vy = 0;
      player.onGround = true;
      player.dropThroughTimer = 0;
      break;
    }
  }

  // -----------------------------
  // 2. Horizontal Wall Collision  (NEW)
  // -----------------------------
  platforms.forEach((p) => {
    // Identify wall structures by size
    const isWall = p.width > 200 && p.height > 500;

    if (!isWall) return;

    const playerRight = player.x + player.width;
    const playerLeft = player.x;
    const playerBottom = player.y + player.height;
    const playerTop = player.y;

    const platRight = p.x + p.width;
    const platLeft = p.x;
    const platTop = p.y;
    const platBottom = p.y + p.height;

    // Must overlap vertically to collide horizontally
    const overlapsVertically = playerBottom > platTop && playerTop < platBottom;
    if (!overlapsVertically) return;

    // ---- LEFT WALL COLLISION ----
    if (
      playerRight > platLeft &&
      playerLeft < platLeft &&
      player.vx > 0
    ) {
      player.x = platLeft - player.width; // push player left
    }

    // ---- RIGHT WALL COLLISION ----
    if (
      playerLeft < platRight &&
      playerRight > platRight &&
      player.vx < 0
    ) {
      player.x = platRight; // push player right
    }
  });

  // -----------------------------
  // 3. World Bounds (unchanged)
  // -----------------------------
  if (player.x < -1000) player.x = -1000;
  if (player.x > 5000) player.x = 5000;
}


// Camera Follow
function updateCamera() {
  cameraTargetX = player.x - canvas.width / 2 + player.width / 2;
  cameraX += (cameraTargetX - cameraX) * CAMERA_EASE;
}

// Draw Everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  // camera transform
  ctx.translate(-cameraX, 0);

  // ============================
// DRAW BACKGROUND PROPS
// ============================
bgProps.forEach(p => {
  if (p.img.complete && p.img.naturalWidth !== 0) {
    ctx.imageSmoothingEnabled = false;

    const drawW = p.img.naturalWidth * p.scaleX;
    const drawH = p.img.naturalHeight * p.scaleY;

    ctx.drawImage(
      p.img,
      p.x,
      p.y,
      drawW,
      drawH
    );
  }
});

  // Platforms
  ctx.fillStyle = "#000000ff";
  platforms.forEach(p => {
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });

// ============================
// DRAW NPCs
// ============================
npcs.forEach(npc => {
  const sprite = npc.sprites[npc.animFrame];
  if (sprite.complete && sprite.naturalWidth !== 0) {
    ctx.save();
    ctx.translate(npc.x + npc.width / 2, npc.y + npc.height / 2);
    ctx.scale(npc.direction, 1);
    ctx.drawImage(
      sprite,
      -npc.width / 2,
      -npc.height / 2,
      npc.width,
      npc.height
    );
    ctx.restore();
  }
});


  // Exhibits (scaled)
  exhibits.forEach(ex => {
    const imgs = exhibitImages[ex.name];
if (imgs) {
    const currentImg = exhibitAnimFrame === 0 ? imgs.frame1 : imgs.frame2;

    if (currentImg.complete && currentImg.naturalWidth !== 0) {
        ctx.imageSmoothingEnabled = false;

        const drawW = ex.width * ex.scaleX;
        const drawH = ex.height * ex.scaleY;

        ctx.drawImage(
          currentImg,
          ex.x + (ex.width - drawW) / 2,
          ex.y + (ex.height - drawH) / 2,
          drawW,
          drawH
        );
    } else {
        ctx.fillStyle = "#666";
        ctx.fillRect(ex.x, ex.y, ex.width, ex.height);
    }
}

  });

  // PLAYER SPRITE RENDERING
  ctx.imageSmoothingEnabled = false;

  // choose sprite (guard against not loaded)
let spriteImg = null;

// 1. JUMPING takes priority
if (player.animFrame === "jump") {
    if (playerSprites.jump.complete) {
        spriteImg = playerSprites.jump;
    }
}
// 2. IDLE when not moving + on ground
else if (!isMoving && player.onGround) {
    if (playerSprites.idle.complete) {
        spriteImg = playerSprites.idle;
    }
}
// 3. WALKING
else {
    const idx = Number(player.animFrame) || 0;
    if (playerSprites.walk[idx] && playerSprites.walk[idx].complete) {
        spriteImg = playerSprites.walk[idx];
    }
}


  if (spriteImg) {
    // Draw centered on player's rectangle top-left (we center on player's rect center)
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;

    ctx.save();
    // translate to world -> centered point
    ctx.translate(centerX, centerY);
    // flip if facing left
    ctx.scale(player.direction, 1);
    // draw image centered
    ctx.drawImage(spriteImg, -player.width / 2, -player.height / 2, player.width, player.height);
    ctx.restore();
  } else {
    // fallback: draw a rectangle if sprite not ready
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }

  ctx.restore(); // restore camera transform
}

// Game Loop
function loop() {
  //update player and npcs
  updatePlayer();
  updateNPCs();
  updateCamera();
  updateBaronDisplay();


  // ----------- EXHIBIT ANIMATION UPDATE ------------
  exhibitAnimTimer++;
  if (exhibitAnimTimer >= 60) {   // 60 frames ≈ 1 second
    exhibitAnimTimer = 0;
    exhibitAnimFrame = exhibitAnimFrame === 0 ? 1 : 0;
  }
  // --------------------------------------------------

  draw();
  requestAnimationFrame(loop);
  drawBaronDisplay();

}

// =========================
// Background Music
// =========================
const bgMusic = new Audio("backgroundmusic.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.35; // <-- Adjust volume HERE (0.0 to 1.0)
bgMusic.preload = "auto";

// Start music on first key press (required by Chrome/Firefox)
let musicStarted = false;
document.addEventListener("keydown", () => {
  if (!musicStarted) {
    bgMusic.play().catch(e => console.warn("Music failed:", e));
    musicStarted = true;
  }
});

function setMusicVolume(v) {
  bgMusic.volume = Math.max(0, Math.min(1, v)); // clamps 0–1
}

// ===============================
// UI SOUND EFFECTS
// ===============================
const displayClickSound = new Audio("displayclick.mp3");
displayClickSound.volume = 0.6; // adjust volume as needed

// ===============================
// SOUND EFFECTS
// ===============================
const jumpSound = new Audio("pixeljump.mp3");
jumpSound.volume = 0.7; // adjust volume as needed

// ============================
// BACKGROUND PROPS
// ============================
const bgProps = [
  // Tables near the entrance
  {
    name: "tables",
    img: new Image(),
    x: -200,
    y: 198,
    scaleX: 1,
    scaleY: 1
  },

  {
    name: "tables",
    img: new Image(),
    x: -200,
    y: 6,
    scaleX: 1,
    scaleY: 1
  },

  //Tables near the exit
  {
    name: "tables",
    img: new Image(),
    x: 1275,
    y: 198,
    scaleX: 1,
    scaleY: 1
  },

  {
    name: "tables",
    img: new Image(),
    x: 1275,
    y: 6,
    scaleX: 1,
    scaleY: 1
  },

    {
    name: "tables",
    img: new Image(),
    x: 1275,
    y: 387,
    scaleX: 1,
    scaleY: 1
  },

    {
    name: "tables",
    img: new Image(),
    x: 1700,
    y: 198,
    scaleX: 1,
    scaleY: 1
  },

  {
    name: "tables",
    img: new Image(),
    x: 1700,
    y: 6,
    scaleX: 1,
    scaleY: 1
  },

    {
    name: "tables",
    img: new Image(),
    x: 1700,
    y: 387,
    scaleX: 1,
    scaleY: 1
  },

  //

  {
    name: "frontdesk",
    img: new Image(),
    x: -50,
    y: 350,
    scaleX: 1.25,
    scaleY: 1.25
  },
  {
    name: "entrance",
    img: new Image(),
    x: -230,
    y: 380,
    scaleX: 1.1,
    scaleY: 1.1,
  },
  {
    name: "exit",
    img: new Image(),
    x: 1500,
    y: 377,
    scaleX: 1.25,
    scaleY: 1.25,
  }
];

// Load all bg images
bgProps.forEach(p => {
  p.img.src = `images/${p.name}.png`;
});



// Start the loop
requestAnimationFrame(loop);