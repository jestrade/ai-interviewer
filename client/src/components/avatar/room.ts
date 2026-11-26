import {
  BoxGeometry,
  CanvasTexture,
  Color,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  PointLight,
  RepeatWrapping,
  Scene,
  SphereGeometry,
  SpotLight,
  SRGBColorSpace,
  CylinderGeometry,
} from "three";

/**
 * An office with a window, a bookshelf and a desk lamp, drawn entirely in code
 * (no image files). Units are the avatar's: about 1 unit = 1.7 m. The back wall
 * is at z = BACK_WALL; the interviewer stands at the origin looking at +Z.
 */
export const BACK_WALL = -0.75;

/** Small seeded generator: the room looks the same on every load. */
const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

const makeCanvas = (width: number, height: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return { canvas, ctx: canvas.getContext("2d")! };
};

const toTexture = (canvas: HTMLCanvasElement, srgb = true) => {
  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.anisotropy = 8;
  if (srgb) texture.colorSpace = SRGBColorSpace;
  return texture;
};

/** Painted plaster: a warm base with soft mottling. Returns colour and bump maps. */
const plasterTextures = () => {
  const random = seeded(7);
  const color = makeCanvas(512, 512);
  color.ctx.fillStyle = "#cfc6b8";
  color.ctx.fillRect(0, 0, 512, 512);
  const bump = makeCanvas(512, 512);
  bump.ctx.fillStyle = "#808080";
  bump.ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 1400; i++) {
    const x = random() * 512;
    const y = random() * 512;
    const r = 6 + random() * 40;
    const shade = random() > 0.5 ? "255,250,240" : "120,105,90";
    const gradient = color.ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, `rgba(${shade},${0.035 + random() * 0.03})`);
    gradient.addColorStop(1, `rgba(${shade},0)`);
    color.ctx.fillStyle = gradient;
    color.ctx.fillRect(x - r, y - r, r * 2, r * 2);
    const level = Math.floor(random() * 255);
    const bumpGradient = bump.ctx.createRadialGradient(x, y, 0, x, y, r * 0.6);
    bumpGradient.addColorStop(0, `rgba(${level},${level},${level},0.18)`);
    bumpGradient.addColorStop(1, `rgba(${level},${level},${level},0)`);
    bump.ctx.fillStyle = bumpGradient;
    bump.ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  return { map: toTexture(color.canvas), bump: toTexture(bump.canvas, false) };
};

/** Wood with long grain, used for the shelves. */
const woodTexture = (base: string) => {
  const random = seeded(31);
  const { canvas, ctx } = makeCanvas(256, 256);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 260; i++) {
    const y = random() * 256;
    ctx.strokeStyle = `rgba(${random() > 0.5 ? "20,10,5" : "255,220,180"},${0.03 + random() * 0.07})`;
    ctx.lineWidth = 0.5 + random() * 1.8;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(80, y + random() * 6 - 3, 170, y + random() * 6 - 3, 256, y + random() * 4 - 2);
    ctx.stroke();
  }
  return toTexture(canvas);
};

/** A view through the window: bright sky and out-of-focus trees. */
const skyTexture = () => {
  const random = seeded(99);
  const { canvas, ctx } = makeCanvas(256, 384);
  const sky = ctx.createLinearGradient(0, 0, 0, 384);
  sky.addColorStop(0, "#9ec3ea");
  sky.addColorStop(0.55, "#d8e8f5");
  sky.addColorStop(1, "#f6efe0");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 256, 384);
  for (let i = 0; i < 90; i++) {
    const x = random() * 256;
    const y = 230 + random() * 154;
    const r = 18 + random() * 34;
    ctx.fillStyle = `rgba(${70 + random() * 40},${110 + random() * 60},${60 + random() * 30},0.55)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  return toTexture(canvas);
};

const BOOK_COLORS = ["#5b2a2a", "#2e4a5c", "#3f5b3a", "#a8884f", "#d9cfbf", "#4a3b5c", "#8a5a3c", "#c9a94e", "#23313f"];

const addBooks = (shelf: Group, random: () => number, width: number, depth: number) => {
  let x = -width / 2 + 0.004;
  while (x < width / 2 - 0.03) {
    if (random() < 0.1) {
      x += 0.02 + random() * 0.03; // a gap
      continue;
    }
    const w = 0.011 + random() * 0.012;
    const h = 0.07 + random() * 0.05;
    const color = new Color(BOOK_COLORS[Math.floor(random() * BOOK_COLORS.length)]);
    const book = new Mesh(
      new BoxGeometry(w, h, depth * (0.7 + random() * 0.25)),
      new MeshStandardMaterial({ color, roughness: 0.65 + random() * 0.25 })
    );
    book.position.set(x + w / 2, h / 2, 0);
    book.rotation.z = random() < 0.06 ? (random() - 0.5) * 0.2 : 0;
    shelf.add(book);
    x += w + 0.001;
  }
};

/** Builds the room and the lights that belong to it. */
export const buildRoom = (): Scene => {
  const scene = new Scene();
  const room = new Group();
  scene.add(room);
  const random = seeded(2024);

  const plaster = plasterTextures();
  plaster.map.repeat.set(2, 2);
  plaster.bump.repeat.set(2, 2);
  const wallMaterial = new MeshStandardMaterial({
    map: plaster.map,
    bumpMap: plaster.bump,
    bumpScale: 0.6,
    roughness: 0.92,
  });

  // Walls, floor and ceiling close the room so reflections and bounce light make sense.
  const slab = (w: number, h: number, x: number, y: number, z: number, ry: number, rx = 0, material = wallMaterial) => {
    const mesh = new Mesh(new PlaneGeometry(w, h), material);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, 0);
    room.add(mesh);
  };
  slab(3, 2, 0, 0.45, BACK_WALL, 0);
  slab(3, 2, -1.1, 0.45, 0, Math.PI / 2);
  slab(3, 2, 1.1, 0.45, 0, -Math.PI / 2);
  slab(3, 2, 0, 0.45, 1.5, Math.PI);
  slab(3, 3, 0, 1.2, 0, 0, Math.PI / 2, new MeshStandardMaterial({ color: "#e8e2d8", roughness: 1 }));
  slab(3, 3, 0, -0.5, 0, 0, -Math.PI / 2, new MeshStandardMaterial({ map: woodTexture("#8a6a4a"), roughness: 0.55 }));

  // Window with a bright view; it is the main source of light in the room.
  const windowGroup = new Group();
  windowGroup.position.set(-0.28, 0.5, BACK_WALL + 0.003);
  const glass = new Mesh(
    new PlaneGeometry(0.4, 0.64),
    new MeshBasicMaterial({ map: skyTexture(), color: new Color(2.6, 2.6, 2.6), toneMapped: false })
  );
  windowGroup.add(glass);
  const frameMaterial = new MeshStandardMaterial({ color: "#f1ede6", roughness: 0.5 });
  const bar = (w: number, h: number, x: number, y: number) => {
    const mesh = new Mesh(new BoxGeometry(w, h, 0.02), frameMaterial);
    mesh.position.set(x, y, 0.008);
    windowGroup.add(mesh);
  };
  bar(0.44, 0.022, 0, 0.331);
  bar(0.44, 0.022, 0, -0.331);
  bar(0.022, 0.68, -0.211, 0);
  bar(0.022, 0.68, 0.211, 0);
  bar(0.012, 0.64, 0, 0);
  bar(0.4, 0.012, 0, 0.06);
  room.add(windowGroup);

  // Bookshelf on the right side of the wall.
  const shelfWood = new MeshStandardMaterial({ map: woodTexture("#4a3324"), roughness: 0.5 });
  const shelfWidth = 0.5;
  const shelfDepth = 0.12;
  const shelfGroup = new Group();
  shelfGroup.position.set(0.3, 0, BACK_WALL + shelfDepth / 2);
  const board = (w: number, h: number, d: number, x: number, y: number) => {
    const mesh = new Mesh(new BoxGeometry(w, h, d), shelfWood);
    mesh.position.set(x, y, 0);
    shelfGroup.add(mesh);
  };
  board(0.016, 1.2, shelfDepth, -shelfWidth / 2, 0.4);
  board(0.016, 1.2, shelfDepth, shelfWidth / 2, 0.4);
  // Back panel: darkens the gaps between books.
  const backPanel = new Mesh(new BoxGeometry(shelfWidth, 1.2, 0.01), shelfWood);
  backPanel.position.set(0, 0.4, -shelfDepth / 2 + 0.005);
  shelfGroup.add(backPanel);
  const levels = [-0.2, 0.0, 0.2, 0.4, 0.6, 0.8];
  for (const y of levels) board(shelfWidth, 0.014, shelfDepth, 0, y);

  levels.slice(0, -1).forEach((y, index) => {
    const row = new Group();
    row.position.set(0, y + 0.007, 0);
    addBooks(row, random, shelfWidth - 0.04, shelfDepth);
    shelfGroup.add(row);
    if (index === 3) {
      // A small plant in a pot on the fourth shelf.
      const pot = new Mesh(new CylinderGeometry(0.02, 0.016, 0.03, 20), new MeshStandardMaterial({ color: "#b5694a", roughness: 0.8 }));
      pot.position.set(0.15, y + 0.022, 0);
      shelfGroup.add(pot);
      for (let i = 0; i < 9; i++) {
        const leaf = new Mesh(new SphereGeometry(0.014 + random() * 0.01, 10, 8), new MeshStandardMaterial({ color: new Color().setHSL(0.27 + random() * 0.05, 0.5, 0.25 + random() * 0.12), roughness: 0.7 }));
        leaf.position.set(0.15 + (random() - 0.5) * 0.045, y + 0.05 + random() * 0.04, (random() - 0.5) * 0.03);
        shelfGroup.add(leaf);
      }
    }
  });
  room.add(shelfGroup);

  // Desk lamp glowing warm on the lower shelf: a bright point that blurs into bokeh.
  const lampBulb = new Mesh(new SphereGeometry(0.012, 16, 12), new MeshBasicMaterial({ color: new Color(9, 6, 3.2), toneMapped: false }));
  lampBulb.position.set(0.33, 0.3, BACK_WALL + 0.07);
  room.add(lampBulb);
  const lamp = new PointLight("#ffb866", 0.6, 0, 2);
  lamp.position.set(lampBulb.position.x, lampBulb.position.y + 0.01, lampBulb.position.z + 0.03);
  room.add(lamp);

  // Light that makes the room itself readable: daylight from the window, soft fill.
  const sun = new SpotLight("#dbe9ff", 14, 0, 0.9, 1, 2);
  sun.position.set(-0.4, 0.5, BACK_WALL + 0.1);
  sun.target.position.set(0.1, 0.1, 0.8);
  room.add(sun, sun.target);
  // Ceiling light washing the bookshelf so the spines read through the blur.
  const shelfLight = new SpotLight("#ffe2bd", 9, 0, 0.7, 0.8, 2);
  shelfLight.position.set(0.3, 1.0, BACK_WALL + 0.8);
  shelfLight.target.position.set(0.3, 0.4, BACK_WALL);
  room.add(shelfLight, shelfLight.target);
  scene.add(new HemisphereLight("#f4efe6", "#7a6a58", 1.5));
  return scene;
};
