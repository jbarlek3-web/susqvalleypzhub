import * as THREE from "three";
import type { HouseDesignSpec } from "@/lib/subdivision/types";

export interface StudioTextures {
  brick: { diff: THREE.Texture; nor: THREE.Texture; rough: THREE.Texture };
  siding: { diff: THREE.Texture; nor: THREE.Texture; rough: THREE.Texture };
  roof: { diff: THREE.Texture; nor: THREE.Texture; rough: THREE.Texture };
  grass: { diff: THREE.Texture; nor: THREE.Texture; rough: THREE.Texture };
  concrete: { diff: THREE.Texture; nor: THREE.Texture; rough: THREE.Texture };
}

export function buildHouseStudioModel(
  spec: HouseDesignSpec,
  textures?: StudioTextures
): THREE.Group {
  const root = new THREE.Group();
  root.name = "HouseStudioRoot";

  // --- Material Library ---
  const whiteTrimMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(spec.trimColor || 0xf8fafc),
    roughness: 0.35,
    metalness: 0.05,
  });

  const darkTrimMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(spec.shutterColor || 0x1e293b),
    roughness: 0.4,
    metalness: 0.1,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x93c5fd,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.8,
    transparent: true,
    opacity: 0.85,
    reflectivity: 0.9,
  });

  const interiorGlowMat = new THREE.MeshBasicMaterial({
    color: 0xffe8b8,
    transparent: true,
    opacity: 0.85,
  });

  // Facade Material based on user selection
  let facadeMat: THREE.Material;
  if (textures && (spec.facadeMaterial === "brick" || spec.facadeMaterial === "stone")) {
    facadeMat = new THREE.MeshStandardMaterial({
      map: textures.brick.diff,
      normalMap: textures.brick.nor,
      roughnessMap: textures.brick.rough,
      roughness: 0.85,
      metalness: 0.05,
      color: spec.facadeMaterial === "stone" ? 0x948e85 : 0xb56345,
    });
  } else if (textures && spec.facadeMaterial === "siding") {
    facadeMat = new THREE.MeshStandardMaterial({
      map: textures.siding.diff,
      normalMap: textures.siding.nor,
      roughnessMap: textures.siding.rough,
      roughness: 0.65,
      metalness: 0.02,
      color: 0xf1ebe1,
    });
  } else if (spec.facadeMaterial === "boardAndBatten") {
    facadeMat = new THREE.MeshStandardMaterial({
      color: 0xf3f4f6,
      roughness: 0.5,
      metalness: 0.05,
    });
  } else if (spec.facadeMaterial === "stucco") {
    facadeMat = new THREE.MeshStandardMaterial({
      color: 0xe5e5e5,
      roughness: 0.9,
      metalness: 0.02,
    });
  } else {
    facadeMat = new THREE.MeshStandardMaterial({
      color: 0xb56345,
      roughness: 0.8,
    });
  }

  // Roof Material
  let roofMat: THREE.Material;
  if (textures && spec.roofMaterial === "shingle") {
    roofMat = new THREE.MeshStandardMaterial({
      map: textures.roof.diff,
      normalMap: textures.roof.nor,
      roughnessMap: textures.roof.rough,
      roughness: 0.8,
      metalness: 0.1,
      color: 0x334155,
    });
  } else if (spec.roofMaterial === "slate") {
    roofMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.45,
      metalness: 0.15,
    });
  } else if (spec.roofMaterial === "standingSeam") {
    roofMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.3,
      metalness: 0.5,
    });
  } else {
    roofMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
  }

  // Interior Flooring Material
  let floorColor = 0xca8a04; // oak
  if (spec.flooring === "walnut") floorColor = 0x451a03;
  else if (spec.flooring === "herringbone") floorColor = 0xb45309;
  else if (spec.flooring === "tile") floorColor = 0xd1d5db;
  else if (spec.flooring === "lvp") floorColor = 0x78716c;

  const interiorFloorMat = new THREE.MeshStandardMaterial({
    color: floorColor,
    roughness: 0.4,
    metalness: 0.1,
  });

  // Interior Wall Material
  let wallColorHex = 0xfef08a; // warm alabaster
  if (spec.wallColor === "greige") wallColorHex = 0xe7e5e4;
  else if (spec.wallColor === "navy") wallColorHex = 0x1e3a5f;
  else if (spec.wallColor === "sage") wallColorHex = 0x3f6212;

  const interiorWallMat = new THREE.MeshStandardMaterial({
    color: wallColorHex,
    roughness: 0.85,
  });

  const concreteMat = textures
    ? new THREE.MeshStandardMaterial({
        map: textures.concrete.diff,
        normalMap: textures.concrete.nor,
        roughnessMap: textures.concrete.rough,
        roughness: 0.8,
        color: 0xcccccc,
      })
    : new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.8 });

  // Dimensions
  const storyHeight = 3.0; // 3 meters (~10 ft) per story
  const width = 14.0;
  const depth = 8.0;
  const isCutaway = spec.viewLevel !== "exterior";

  // Helper: Window
  const createWindow = (w: number, h: number, withShutters = false) => {
    const winGroup = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.12), whiteTrimMat);
    frame.castShadow = true;
    winGroup.add(frame);

    const glass = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.14, h - 0.14), glassMat);
    glass.position.z = 0.04;
    winGroup.add(glass);

    const glow = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.14, h - 0.14), interiorGlowMat);
    glow.position.z = -0.02;
    glow.name = "interiorGlow";
    glow.visible = false;
    winGroup.add(glow);

    if (withShutters) {
      const sw = w * 0.35;
      const shL = new THREE.Mesh(new THREE.BoxGeometry(sw, h * 0.96, 0.04), darkTrimMat);
      shL.position.set(-w / 2 - sw / 2 - 0.02, 0, 0.02);
      winGroup.add(shL);

      const shR = new THREE.Mesh(new THREE.BoxGeometry(sw, h * 0.96, 0.04), darkTrimMat);
      shR.position.set(w / 2 + sw / 2 + 0.02, 0, 0.02);
      winGroup.add(shR);
    }
    return winGroup;
  };

  // Helper: Furniture Pieces
  const buildLivingRoomFurniture = () => {
    const group = new THREE.Group();
    // Sectional Sofa
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const sofaMain = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.65, 0.9), sofaMat);
    sofaMain.position.set(-2.5, 0.35, -1.0);
    group.add(sofaMain);

    const sofaL = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.65, 1.4), sofaMat);
    sofaL.position.set(-3.25, 0.35, -2.1);
    group.add(sofaL);

    // Coffee Table
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 });
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 0.7), tableMat);
    table.position.set(-2.2, 0.2, -1.9);
    group.add(table);

    // Area Rug
    const rug = new THREE.Mesh(
      new THREE.PlaneGeometry(3.0, 2.6),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 })
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(-2.5, 0.02, -1.9);
    group.add(rug);

    // Fireplace & Mantle
    const fpMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
    const fp = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 0.5), fpMat);
    fp.position.set(-6.5, 1.1, -1.8);
    group.add(fp);

    const fireOpening = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.8, 0.2),
      new THREE.MeshBasicMaterial({ color: 0xf97316 })
    );
    fireOpening.position.set(-6.3, 0.5, -1.8);
    group.add(fireOpening);

    return group;
  };

  const buildKitchenFurniture = () => {
    const group = new THREE.Group();
    const cabinetMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    const counterMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });

    // L-Shaped Kitchen Perimeter Counters
    const counter1 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.9, 0.7), cabinetMat);
    counter1.position.set(4.4, 0.45, -3.2);
    group.add(counter1);

    const top1 = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.08, 0.75), counterMat);
    top1.position.set(4.4, 0.92, -3.2);
    group.add(top1);

    // Kitchen Island with Waterfall Countertop
    const islandBase = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 1.1), cabinetMat);
    islandBase.position.set(3.8, 0.45, -1.2);
    group.add(islandBase);

    const islandTop = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.08, 1.2), counterMat);
    islandTop.position.set(3.8, 0.92, -1.2);
    group.add(islandTop);

    // Barstools (3 stools)
    const stoolMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 });
    for (let i = -0.7; i <= 0.7; i += 0.7) {
      const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.65, 12), stoolMat);
      stool.position.set(3.8 + i, 0.35, -0.4);
      group.add(stool);
    }

    return group;
  };

  const buildBedroomFurniture = () => {
    const group = new THREE.Group();
    // King Bed
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.6 });
    const sheetMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
    const pillowMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 });

    const headboard = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, 0.15), frameMat);
    headboard.position.set(-3.8, 0.6, -3.4);
    group.add(headboard);

    const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.45, 2.2), sheetMat);
    mattress.position.set(-3.8, 0.35, -2.2);
    group.add(mattress);

    // Pillows
    [-0.5, 0.5].forEach((ox) => {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.15, 0.4), pillowMat);
      p.position.set(-3.8 + ox, 0.65, -3.1);
      group.add(p);
    });

    // Nightstands
    [-1.5, 1.5].forEach((ox) => {
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.45), frameMat);
      stand.position.set(-3.8 + ox, 0.3, -3.3);
      group.add(stand);
    });

    return group;
  };

  const buildOfficeFurniture = () => {
    const group = new THREE.Group();
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 });
    const desk = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.75, 0.8), deskMat);
    desk.position.set(0, 0.4, -2.0);
    group.add(desk);

    const chairMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 0.6), chairMat);
    chair.position.set(0, 0.5, -2.7);
    group.add(chair);

    const bookcase = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 0.35), deskMat);
    bookcase.position.set(-4.5, 0.9, -3.3);
    group.add(bookcase);

    return group;
  };

  // Helper: Staircase connecting stories
  const buildStaircase = (height: number) => {
    const stairGroup = new THREE.Group();
    const stepCount = 12;
    const stepDepth = 0.24;
    const stepHeight = height / stepCount;
    const stepWidth = 1.0;
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 });

    for (let i = 0; i < stepCount; i++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth),
        woodMat
      );
      step.position.set(0, (i + 0.5) * stepHeight, (i - stepCount / 2) * stepDepth);
      stairGroup.add(step);
    }
    return stairGroup;
  };

  // --- Story Construction Loop (1 to N stories) ---
  for (let s = 1; s <= spec.stories; s++) {
    const storyGroup = new THREE.Group();
    storyGroup.name = `Story_${s}`;
    const baseElevation = (s - 1) * storyHeight;

    // Determine visibility based on Studio View Level
    let isStoryVisible = true;
    let isStoryCutaway = false;

    if (spec.viewLevel === "story1" && s !== 1) isStoryVisible = false;
    else if (spec.viewLevel === "story2" && s !== 2) isStoryVisible = false;
    else if (spec.viewLevel === "story3" && s !== 3) isStoryVisible = false;
    else if (spec.viewLevel === "story4" && s !== 4) isStoryVisible = false;
    else if (spec.viewLevel === "dollhouse" && s > 1) {
      isStoryCutaway = true;
    }

    if (!isStoryVisible) continue;

    // Floor Slab (with selected interior flooring)
    const floorSlab = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.15, depth),
      interiorFloorMat
    );
    floorSlab.position.set(0, baseElevation + 0.08, 0);
    floorSlab.receiveShadow = true;
    storyGroup.add(floorSlab);

    // Exterior Walls
    // If cutaway mode or specific story interior view, make front and top open
    const showFrontWall = !isCutaway && spec.viewLevel === "exterior";

    if (showFrontWall) {
      // Front Wall with Windows
      const frontWall = new THREE.Mesh(
        new THREE.BoxGeometry(width, storyHeight, 0.2),
        facadeMat
      );
      frontWall.position.set(0, baseElevation + storyHeight / 2, depth / 2);
      frontWall.castShadow = true;
      frontWall.receiveShadow = true;
      storyGroup.add(frontWall);

      // Windows along front wall
      [-4.5, -2.0, 2.0, 4.5].forEach((wx) => {
        const win = createWindow(1.1, 1.5, true);
        win.position.set(wx, baseElevation + 1.6, depth / 2 + 0.08);
        storyGroup.add(win);
      });
    } else {
      // Interior Cutaway Mode: Render perimeter cut walls
      // Back Wall
      const backWall = new THREE.Mesh(
        new THREE.BoxGeometry(width, storyHeight, 0.2),
        interiorWallMat
      );
      backWall.position.set(0, baseElevation + storyHeight / 2, -depth / 2);
      storyGroup.add(backWall);

      // Left Wall
      const leftWall = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, storyHeight, depth),
        interiorWallMat
      );
      leftWall.position.set(-width / 2, baseElevation + storyHeight / 2, 0);
      storyGroup.add(leftWall);

      // Right Wall
      const rightWall = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, storyHeight, depth),
        interiorWallMat
      );
      rightWall.position.set(width / 2, baseElevation + storyHeight / 2, 0);
      storyGroup.add(rightWall);

      // Interior Dividing Partition Walls
      const divider = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, storyHeight * 0.95, depth * 0.6),
        interiorWallMat
      );
      divider.position.set(1.0, baseElevation + (storyHeight * 0.95) / 2, -1.5);
      storyGroup.add(divider);

      // Furniture inside depending on story
      if (spec.furnished) {
        if (s === 1) {
          const living = buildLivingRoomFurniture();
          living.position.set(0, baseElevation, 0);
          storyGroup.add(living);

          const kitchen = buildKitchenFurniture();
          kitchen.position.set(0, baseElevation, 0);
          storyGroup.add(kitchen);
        } else if (s === 2) {
          const bedroom = buildBedroomFurniture();
          bedroom.position.set(0, baseElevation, 0);
          storyGroup.add(bedroom);
        } else if (s >= 3) {
          const office = buildOfficeFurniture();
          office.position.set(0, baseElevation, 0);
          storyGroup.add(office);
        }
      }

      // Interior Staircase
      if (s < spec.stories) {
        const stairs = buildStaircase(storyHeight);
        stairs.position.set(0.4, baseElevation, 1.2);
        storyGroup.add(stairs);
      }
    }

    // Story Division Trim Beltline
    const beltline = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.2, 0.15, depth + 0.2),
      whiteTrimMat
    );
    beltline.position.set(0, baseElevation + storyHeight, 0);
    storyGroup.add(beltline);

    root.add(storyGroup);
  }

  // --- Roof Structure (Placed on top of highest story) ---
  const roofBaseY = spec.stories * storyHeight;
  const showRoof = spec.viewLevel === "exterior";

  if (showRoof) {
    const roofHeight = 3.2;
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-width / 2 - 0.4, 0);
    roofShape.lineTo(width / 2 + 0.4, 0);
    roofShape.lineTo(width / 2 - 2.5, roofHeight);
    roofShape.lineTo(-width / 2 + 2.5, roofHeight);
    roofShape.closePath();

    const roofGeo = new THREE.ExtrudeGeometry(roofShape, {
      depth: depth + 0.8,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.25,
      bevelThickness: 0.15,
    });
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.set(0, roofBaseY, -depth / 2 - 0.4);
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    root.add(roofMesh);

    // Brick Chimney
    const chimney = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, roofHeight + 1.8, 1.2),
      facadeMat
    );
    chimney.position.set(2.2, roofBaseY + (roofHeight + 1.8) / 2, -1.0);
    chimney.castShadow = true;
    root.add(chimney);

    // Dormer on front of roof
    const dormer = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.4, 1.8),
      facadeMat
    );
    dormer.position.set(-2.5, roofBaseY + 1.0, depth / 2 - 0.2);
    dormer.castShadow = true;
    root.add(dormer);

    const dormerWin = createWindow(1.0, 1.0, false);
    dormerWin.position.set(-2.5, roofBaseY + 1.0, depth / 2 + 0.7);
    root.add(dormerWin);
  }

  // Check if ground-level exterior additions should be rendered
  const showGroundExterior =
    spec.viewLevel === "exterior" || spec.viewLevel === "dollhouse" || spec.viewLevel === "story1";

  if (showGroundExterior) {
    // --- Ground-Floor Garage Wing ---
    const garageWidth = spec.garageBays === 3 ? 6.5 : spec.garageBays === 2 ? 5.2 : 3.8;
    const garageDepth = 5.6;
    const garageHeight = 3.1;
    const garageMesh = new THREE.Mesh(
      new THREE.BoxGeometry(garageWidth, garageHeight, garageDepth),
      facadeMat
    );
    garageMesh.position.set(
      -width / 2 - garageWidth / 2 + 2.0,
      garageHeight / 2,
      depth / 2 + garageDepth / 2 - 2.0
    );
    garageMesh.castShadow = true;
    garageMesh.receiveShadow = true;
    root.add(garageMesh);

    // Garage Door
    const garageDoor = new THREE.Mesh(
      new THREE.BoxGeometry(garageWidth - 0.8, 2.3, 0.08),
      whiteTrimMat
    );
    garageDoor.position.set(
      -width / 2 - garageWidth / 2 + 2.0,
      1.2,
      depth / 2 + garageDepth - 2.0 + 0.04
    );
    garageDoor.castShadow = true;
    root.add(garageDoor);

    // --- Front Porch with Architectural Style Styling ---
    if (spec.hasPorch) {
      const porchW = 4.8;
      const porchD = 2.4;
      const porchFloor = new THREE.Mesh(
        new THREE.BoxGeometry(porchW, 0.35, porchD),
        concreteMat
      );
      porchFloor.position.set(2.8, 0.18, depth / 2 + porchD / 2);
      porchFloor.castShadow = true;
      porchFloor.receiveShadow = true;
      root.add(porchFloor);

      // Columns based on selected architectural style
      [-porchW / 2 + 0.3, 0, porchW / 2 - 0.3].forEach((cx) => {
        if (spec.style === "craftsman") {
          // Craftsman: Stone pedestal base with tapered column post
          const stoneBase = new THREE.Mesh(
            new THREE.BoxGeometry(0.45, 0.9, 0.45),
            facadeMat
          );
          stoneBase.position.set(2.8 + cx, 0.65, depth / 2 + porchD - 0.3);
          stoneBase.castShadow = true;
          root.add(stoneBase);

          const taperedCol = new THREE.Mesh(
            new THREE.CylinderGeometry(0.09, 0.14, 1.7, 4),
            whiteTrimMat
          );
          taperedCol.position.set(2.8 + cx, 1.95, depth / 2 + porchD - 0.3);
          taperedCol.rotation.y = Math.PI / 4;
          taperedCol.castShadow = true;
          root.add(taperedCol);
        } else if (spec.style === "modernFarmhouse") {
          // Clean square timber post
          const post = new THREE.Mesh(
            new THREE.BoxGeometry(0.18, 2.6, 0.18),
            whiteTrimMat
          );
          post.position.set(2.8 + cx, 1.5, depth / 2 + porchD - 0.3);
          post.castShadow = true;
          root.add(post);
        } else {
          // Classical round fluted column
          const col = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.12, 2.6, 16),
            whiteTrimMat
          );
          col.position.set(2.8 + cx, 1.5, depth / 2 + porchD - 0.3);
          col.castShadow = true;
          root.add(col);
        }
      });

      // Porch Roof
      const porchRoof = new THREE.Mesh(
        new THREE.BoxGeometry(porchW + 0.3, 0.25, porchD + 0.4),
        roofMat
      );
      porchRoof.position.set(2.8, 2.9, depth / 2 + porchD / 2);
      porchRoof.rotation.x = 0.12;
      porchRoof.castShadow = true;
      root.add(porchRoof);
    }

    // --- Rear Backyard Patio ---
    if (spec.hasPatio) {
      const patio = new THREE.Mesh(
        new THREE.BoxGeometry(6.5, 0.15, 4.5),
        concreteMat
      );
      patio.position.set(1.5, 0.08, -depth / 2 - 2.5);
      patio.receiveShadow = true;
      root.add(patio);

      // Patio Table & Chairs
      const pTable = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 0.9, 0.06, 16),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 })
      );
      pTable.position.set(2.5, 0.75, -depth / 2 - 2.5);
      root.add(pTable);

      const umbrella = new THREE.Mesh(
        new THREE.ConeGeometry(1.6, 0.6, 12),
        new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.7 })
      );
      umbrella.position.set(2.5, 2.3, -depth / 2 - 2.5);
      root.add(umbrella);
    }
  }

  // --- Second-Story Cantilevered Balcony ---
  if (
    spec.hasBalcony &&
    spec.stories >= 2 &&
    (spec.viewLevel === "exterior" || spec.viewLevel === "dollhouse" || spec.viewLevel === "story2")
  ) {
    const balconyGroup = new THREE.Group();
    balconyGroup.name = "SecondStoryBalcony";
    const bW = 4.2;
    const bD = 1.8;
    const bElevation = storyHeight;

    const bFloor = new THREE.Mesh(new THREE.BoxGeometry(bW, 0.15, bD), concreteMat);
    bFloor.position.set(-2.0, bElevation + 0.08, depth / 2 + bD / 2);
    bFloor.castShadow = true;
    balconyGroup.add(bFloor);

    // Brackets
    [-bW / 2 + 0.4, bW / 2 - 0.4].forEach((bx) => {
      const bracket = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.6, bD * 0.8),
        whiteTrimMat
      );
      bracket.position.set(-2.0 + bx, bElevation - 0.25, depth / 2 + (bD * 0.8) / 2);
      balconyGroup.add(bracket);
    });

    // Railing
    const railingMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.8,
      roughness: 0.2,
    });
    const rHeight = 0.95;
    const frontRail = new THREE.Mesh(new THREE.BoxGeometry(bW, 0.06, 0.06), railingMat);
    frontRail.position.set(-2.0, bElevation + rHeight, depth / 2 + bD);
    balconyGroup.add(frontRail);

    [-bW / 2, bW / 2].forEach((rx) => {
      const sideRail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, bD), railingMat);
      sideRail.position.set(-2.0 + rx, bElevation + rHeight, depth / 2 + bD / 2);
      balconyGroup.add(sideRail);
    });

    for (let bx = -bW / 2; bx <= bW / 2; bx += 0.35) {
      const baluster = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, rHeight, 8),
        railingMat
      );
      baluster.position.set(-2.0 + bx, bElevation + rHeight / 2, depth / 2 + bD);
      balconyGroup.add(baluster);
    }
    root.add(balconyGroup);
  }

  // --- Architectural Bay Turret Feature ---
  if (spec.hasBayTurret && (spec.viewLevel === "exterior" || spec.viewLevel === "dollhouse")) {
    const turretGroup = new THREE.Group();
    turretGroup.name = "ArchitecturalBayTurret";
    const turretR = 2.4;
    const turretH = spec.stories * storyHeight;
    const turretSegments = 6;

    const turretMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(turretR, turretR, turretH, turretSegments),
      facadeMat
    );
    turretMesh.position.set(width / 2 - 1.2, turretH / 2, depth / 2);
    turretMesh.castShadow = true;
    turretMesh.receiveShadow = true;
    turretGroup.add(turretMesh);

    for (let s = 1; s <= spec.stories; s++) {
      const wY = (s - 1) * storyHeight + 1.6;
      const tWin = createWindow(0.9, 1.4, false);
      tWin.position.set(width / 2 - 1.2, wY, depth / 2 + turretR * 0.85);
      turretGroup.add(tWin);
    }

    if (spec.viewLevel === "exterior") {
      const capH = 2.8;
      const turretCap = new THREE.Mesh(
        new THREE.ConeGeometry(turretR * 1.2, capH, turretSegments),
        roofMat
      );
      turretCap.position.set(width / 2 - 1.2, turretH + capH / 2, depth / 2);
      turretCap.castShadow = true;
      turretGroup.add(turretCap);

      const finial = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.08, 1.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.9, roughness: 0.1 })
      );
      finial.position.set(width / 2 - 1.2, turretH + capH + 0.6, depth / 2);
      turretGroup.add(finial);
    }
    root.add(turretGroup);
  }

  return root;
}
