import * as THREE from "three";
import type { SubdivisionConfig } from "@/lib/subdivision/types";
import type { StudioTextures } from "./HouseStudioModel";

export interface SubdivisionSceneRefs {
  group: THREE.Group;
  waterMesh: THREE.Mesh;
  fountainGroup: THREE.Group;
  contourGroup: THREE.Group;
  lotsGroup: THREE.Group;
  updateAnimation: (time: number) => void;
}

export function buildSubdivisionMasterPlan(
  config: SubdivisionConfig,
  textures?: StudioTextures,
  onSelectLot?: (lotNumber: number) => void
): SubdivisionSceneRefs {
  const root = new THREE.Group();
  root.name = "SubdivisionMasterPlanRoot";

  const contourGroup = new THREE.Group();
  contourGroup.name = "ContourGroup";
  root.add(contourGroup);

  const lotsGroup = new THREE.Group();
  lotsGroup.name = "LotsGroup";
  root.add(lotsGroup);

  const fountainGroup = new THREE.Group();
  fountainGroup.name = "FountainGroup";

  // --- Materials Library ---
  const grassMat = textures
    ? new THREE.MeshStandardMaterial({
        map: textures.grass.diff,
        normalMap: textures.grass.nor,
        roughnessMap: textures.grass.rough,
        roughness: 0.9,
        color: 0x5b8a3c,
      })
    : new THREE.MeshStandardMaterial({ color: 0x4d7c2a, roughness: 0.9 });

  const asphaltMat = new THREE.MeshStandardMaterial({
    color: 0x27272a,
    roughness: 0.85,
    metalness: 0.05,
  });

  const concreteMat = textures
    ? new THREE.MeshStandardMaterial({
        map: textures.concrete.diff,
        normalMap: textures.concrete.nor,
        roughnessMap: textures.concrete.rough,
        roughness: 0.75,
        color: 0xd6d3d1,
      })
    : new THREE.MeshStandardMaterial({ color: 0xe5e5e5, roughness: 0.75 });

  const stoneMat = textures
    ? new THREE.MeshStandardMaterial({
        map: textures.brick.diff,
        normalMap: textures.brick.nor,
        roughnessMap: textures.brick.rough,
        roughness: 0.95,
        color: 0x78716c,
      })
    : new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });

  const roadStripeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  const curbMat = new THREE.MeshStandardMaterial({ color: 0xf3f4f6, roughness: 0.6 });

  // 1. Terrain Mesh with subtle Topographic Slope
  const terrainSize = 240; // 240m x 240m (~14 acres in scale)
  const terrainSegments = 64;
  const terrainGeo = new THREE.PlaneGeometry(terrainSize, terrainSize, terrainSegments, terrainSegments);

  // Apply subtle elevation deformation based on slope %
  const posAttr = terrainGeo.attributes.position;
  const slopeFactor = (config.slopePct / 100) * 0.4;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    // Slope rises along diagonal + rolling mound hills
    const distFromCenter = Math.sqrt(x * x + y * y);
    let zElevation = (x * 0.08 + y * 0.05) * slopeFactor * 12;
    // Lower center depression for the retention pond basin
    if (distFromCenter < 45) {
      const depression = Math.cos((distFromCenter / 45) * (Math.PI / 2)) * 3.5;
      zElevation -= depression;
    }
    posAttr.setZ(i, zElevation);
  }
  terrainGeo.computeVertexNormals();

  const terrainMesh = new THREE.Mesh(terrainGeo, grassMat);
  terrainMesh.rotation.x = -Math.PI / 2;
  terrainMesh.receiveShadow = true;
  root.add(terrainMesh);

  // 2. Central Stormwater Retention Pond in the Middle
  const pondRadius = 26.0; // 26m radius pond (~0.8 acres)
  const pondGeo = new THREE.CircleGeometry(pondRadius, 48);
  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0x0284c7,
    roughness: 0.1,
    metalness: 0.15,
    transmission: 0.6,
    transparent: true,
    opacity: 0.88,
    reflectivity: 0.95,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });

  const waterMesh = new THREE.Mesh(pondGeo, waterMat);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.set(0, -1.8, 0); // Nestled in the central basin
  waterMesh.receiveShadow = true;
  root.add(waterMesh);

  // Pond Riprap Stone Perimeter Embankment (rock ring around pond edge)
  const riprapGeo = new THREE.RingGeometry(pondRadius - 0.5, pondRadius + 2.5, 48);
  const riprapMesh = new THREE.Mesh(riprapGeo, stoneMat);
  riprapMesh.rotation.x = -Math.PI / 2;
  riprapMesh.position.set(0, -1.75, 0);
  root.add(riprapMesh);

  // Central Aerator Fountain in Middle of Pond
  fountainGroup.position.set(0, -1.6, 0);

  // Fountain Base Nozzle
  const fountainNozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.9, 0.8, 16),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 })
  );
  fountainGroup.add(fountainNozzle);

  // Vertical Spray Jets (Multiple ascending cone & cylinder water layers)
  const jetMat = new THREE.MeshBasicMaterial({
    color: 0xbae6fd,
    transparent: true,
    opacity: 0.75,
  });

  const sprayColumn = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 1.2, 7.5, 16), jetMat);
  sprayColumn.position.y = 3.8;
  fountainGroup.add(sprayColumn);

  const sprayCrown = new THREE.Mesh(new THREE.ConeGeometry(3.2, 3.8, 20), jetMat);
  sprayCrown.position.y = 5.2;
  fountainGroup.add(sprayCrown);

  // Spray Ring Ripples
  const rippleGeo = new THREE.RingGeometry(0.5, 3.8, 32);
  const rippleMesh = new THREE.Mesh(
    rippleGeo,
    new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.45 })
  );
  rippleMesh.rotation.x = -Math.PI / 2;
  rippleMesh.position.y = 0.05;
  fountainGroup.add(rippleMesh);

  // Underwater Fountain Spotlight
  const fountainLight = new THREE.PointLight(0x38bdf8, 2.5, 18);
  fountainLight.position.set(0, 1.2, 0);
  fountainGroup.add(fountainLight);

  root.add(fountainGroup);

  // 3. Walking Trail & Park Amenities looping around the Pond
  const trailInnerR = pondRadius + 3.8;
  const trailOuterR = trailInnerR + 2.2;
  const trailGeo = new THREE.RingGeometry(trailInnerR, trailOuterR, 48);
  const trailMesh = new THREE.Mesh(trailGeo, concreteMat);
  trailMesh.rotation.x = -Math.PI / 2;
  trailMesh.position.set(0, -0.9, 0);
  trailMesh.receiveShadow = true;
  root.add(trailMesh);

  // Benches and Weeping Willow Trees along walking trail
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 + 0.2;
    const bx = Math.cos(angle) * (trailOuterR + 1.2);
    const bz = Math.sin(angle) * (trailOuterR + 1.2);

    // Park Bench
    const benchGroup = new THREE.Group();
    benchGroup.position.set(bx, -0.7, bz);
    benchGroup.rotation.y = -angle - Math.PI / 2;
    const benchSeat = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.1, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 })
    );
    benchSeat.position.y = 0.45;
    benchGroup.add(benchSeat);
    const benchBack = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.4, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 })
    );
    benchBack.position.set(0, 0.75, -0.2);
    benchGroup.add(benchBack);
    root.add(benchGroup);

    // Willow / Shade Tree
    const treeAngle = angle + 0.35;
    const tx = Math.cos(treeAngle) * (trailOuterR + 3.5);
    const tz = Math.sin(treeAngle) * (trailOuterR + 3.5);
    const treeGroup = new THREE.Group();
    treeGroup.position.set(tx, -0.6, tz);
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.35, 3.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 })
    );
    trunk.position.y = 1.75;
    treeGroup.add(trunk);
    const canopy = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 })
    );
    canopy.position.y = 4.2;
    canopy.scale.set(1.2, 1.4, 1.2);
    treeGroup.add(canopy);
    root.add(treeGroup);
  }

  // 4. Suburban Roadway Network
  // Circular Loop Road wrapped around the central pond and walking trail
  const roadInnerR = 48.0;
  const roadWidth = 8.5; // Standard 28 ft suburban residential street with curbs
  const roadOuterR = roadInnerR + roadWidth;
  const roadGeo = new THREE.RingGeometry(roadInnerR, roadOuterR, 64);
  const roadMesh = new THREE.Mesh(roadGeo, asphaltMat);
  roadMesh.rotation.x = -Math.PI / 2;
  roadMesh.position.set(0, 0.05, 0);
  roadMesh.receiveShadow = true;
  root.add(roadMesh);

  // Centerline Road Yellow Stripes
  const stripeR = roadInnerR + roadWidth / 2;
  const stripeGeo = new THREE.RingGeometry(stripeR - 0.08, stripeR + 0.08, 64);
  const stripeMesh = new THREE.Mesh(stripeGeo, roadStripeMat);
  stripeMesh.rotation.x = -Math.PI / 2;
  stripeMesh.position.set(0, 0.06, 0);
  root.add(stripeMesh);

  // Concrete Curbs (Inner & Outer curbs)
  const curbInnerGeo = new THREE.RingGeometry(roadInnerR - 0.4, roadInnerR, 64);
  const curbInner = new THREE.Mesh(curbInnerGeo, curbMat);
  curbInner.rotation.x = -Math.PI / 2;
  curbInner.position.set(0, 0.1, 0);
  root.add(curbInner);

  const curbOuterGeo = new THREE.RingGeometry(roadOuterR, roadOuterR + 0.4, 64);
  const curbOuter = new THREE.Mesh(curbOuterGeo, curbMat);
  curbOuter.rotation.x = -Math.PI / 2;
  curbOuter.position.set(0, 0.1, 0);
  root.add(curbOuter);

  // Outer Concrete Sidewalk (5ft wide pedestrian sidewalk)
  const sidewalkInnerR = roadOuterR + 1.2; // 4ft grass utility strip
  const sidewalkOuterR = sidewalkInnerR + 1.6;
  const sidewalkGeo = new THREE.RingGeometry(sidewalkInnerR, sidewalkOuterR, 64);
  const sidewalkMesh = new THREE.Mesh(sidewalkGeo, concreteMat);
  sidewalkMesh.rotation.x = -Math.PI / 2;
  sidewalkMesh.position.set(0, 0.08, 0);
  root.add(sidewalkMesh);

  // Main Boulevard Entrance Road (connecting south entrance to the circular loop)
  const entranceRoad = new THREE.Mesh(
    new THREE.PlaneGeometry(roadWidth, 65),
    asphaltMat
  );
  entranceRoad.rotation.x = -Math.PI / 2;
  entranceRoad.position.set(0, 0.05, roadOuterR + 32.5);
  root.add(entranceRoad);

  // Entrance Boulevard Median with decorative landscaping
  const median = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.2, 50),
    grassMat
  );
  median.position.set(0, 0.15, roadOuterR + 32.5);
  root.add(median);

  // Subdivision Entrance Monument Sign
  const monumentSign = new THREE.Group();
  monumentSign.position.set(roadWidth / 2 + 3.5, 0, roadOuterR + 58);
  const signWall = new THREE.Mesh(
    new THREE.BoxGeometry(4.5, 2.0, 0.8),
    stoneMat
  );
  signWall.position.y = 1.0;
  monumentSign.add(signWall);

  const signPlaque = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 1.0, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 })
  );
  signPlaque.position.set(0, 1.2, 0.42);
  monumentSign.add(signPlaque);
  root.add(monumentSign);

  // 5. Classic Suburban Streetlamp Posts
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI * 2) / 10;
    const lx = Math.cos(angle) * (roadOuterR + 0.8);
    const lz = Math.sin(angle) * (roadOuterR + 0.8);

    const postGroup = new THREE.Group();
    postGroup.position.set(lx, 0, lz);

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 4.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.6, roughness: 0.3 })
    );
    pole.position.y = 2.25;
    postGroup.add(pole);

    const lantern = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.55, 0.35),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.1, emissive: 0xfef08a, emissiveIntensity: 0.8 })
    );
    lantern.position.y = 4.6;
    postGroup.add(lantern);

    const streetLight = new THREE.PointLight(0xffbe6b, 0.6, 14);
    streetLight.position.y = 4.5;
    postGroup.add(streetLight);

    root.add(postGroup);
  }

  // 6. Platted Residential Lots & Houses
  const numLots = Math.min(24, Math.max(12, config.totalLots));
  const lotRadius = sidewalkOuterR + 18.0; // Lot centerlines
  const lotWidthAngular = (Math.PI * 2) / numLots;

  // Simple house prototype model generator for neighborhood houses
  const createSubdivisionHouse = (houseIndex: number, houseColor: number, roofColor: number) => {
    const hGroup = new THREE.Group();

    const houseMat = new THREE.MeshStandardMaterial({ color: houseColor, roughness: 0.7 });
    const rMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.75 });

    // Main 2-story box
    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(10, 5.8, 7.5), houseMat);
    mainBody.position.y = 2.9;
    mainBody.castShadow = true;
    hGroup.add(mainBody);

    // Garage projection
    const garage = new THREE.Mesh(new THREE.BoxGeometry(4.8, 3.0, 4.2), houseMat);
    garage.position.set(-3.2, 1.5, 3.8);
    garage.castShadow = true;
    hGroup.add(garage);

    // Garage Door
    const gDoor = new THREE.Mesh(
      new THREE.BoxGeometry(4.0, 2.2, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })
    );
    gDoor.position.set(-3.2, 1.1, 5.92);
    hGroup.add(gDoor);

    // Front Porch
    const porch = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.25, 2.0),
      concreteMat
    );
    porch.position.set(2.2, 0.12, 4.6);
    hGroup.add(porch);

    // Pitched Roof
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(7.2, 2.6, 4),
      rMat
    );
    roof.position.set(0, 6.8, 0);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.4, 1.0, 1.0);
    roof.castShadow = true;
    hGroup.add(roof);

    // Driveway connecting to the road
    const driveway = new THREE.Mesh(
      new THREE.PlaneGeometry(4.5, 12),
      concreteMat
    );
    driveway.rotation.x = -Math.PI / 2;
    driveway.position.set(-3.2, 0.02, 10);
    hGroup.add(driveway);

    // Front lawn tree
    const tree = new THREE.Group();
    tree.position.set(3.8, 0, 7.5);
    const trk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.2, 2.8, 8),
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 })
    );
    trk.position.y = 1.4;
    tree.add(trk);
    const fol = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.6, 1),
      new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 })
    );
    fol.position.y = 3.2;
    tree.add(fol);
    hGroup.add(tree);

    return hGroup;
  };

  const housePalettes = [
    { house: 0xb56345, roof: 0x334155 }, // Red brick + charcoal
    { house: 0xf1ebe1, roof: 0x1e293b }, // Cream siding + slate
    { house: 0x948e85, roof: 0x27272a }, // Fieldstone + metal
    { house: 0xe2e8f0, roof: 0x334155 }, // Modern gray + charcoal
    { house: 0xfef3c7, roof: 0x475569 }, // Warm tan + gray
  ];

  for (let i = 0; i < numLots; i++) {
    const angle = i * lotWidthAngular;
    const lotX = Math.cos(angle) * lotRadius;
    const lotZ = Math.sin(angle) * lotRadius;

    const lotContainer = new THREE.Group();
    lotContainer.name = `Lot_${i + 1}`;
    lotContainer.position.set(lotX, 0, lotZ);
    lotContainer.rotation.y = -angle - Math.PI / 2;

    lotContainer.userData = { lotNumber: i + 1 };

    // Lot Boundary Lines (Dashed parcel line)
    const lotBoundsGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-12, 0.06, -14),
      new THREE.Vector3(12, 0.06, -14),
      new THREE.Vector3(12, 0.06, 14),
      new THREE.Vector3(-12, 0.06, 14),
      new THREE.Vector3(-12, 0.06, -14),
    ]);
    const lotBounds = new THREE.Line(
      lotBoundsGeo,
      new THREE.LineDashedMaterial({ color: 0x38bdf8, dashSize: 0.8, gapSize: 0.4 })
    );
    lotBounds.computeLineDistances();
    lotContainer.add(lotBounds);

    // Placed House
    const pal = housePalettes[i % housePalettes.length];
    const house = createSubdivisionHouse(i + 1, pal.house, pal.roof);
    house.userData = { lotNumber: i + 1 };
    lotContainer.add(house);

    lotsGroup.add(lotContainer);
  }

  // 7. Topography Contour Visualization Lines
  const contourSteps = 8;
  for (let c = 1; c <= contourSteps; c++) {
    const cRadius = 35 + c * 11;
    const contourLineGeo = new THREE.RingGeometry(cRadius - 0.1, cRadius + 0.1, 64);
    const contourLine = new THREE.Mesh(
      contourLineGeo,
      new THREE.MeshBasicMaterial({
        color: 0x059669,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      })
    );
    contourLine.rotation.x = -Math.PI / 2;
    contourLine.position.y = (c - 4) * 0.4;
    contourGroup.add(contourLine);
  }

  // Animation Updater for Shimmering Water & Aerating Fountain
  const updateAnimation = (time: number) => {
    // Oscillate fountain spray scale and ripple
    const wave = Math.sin(time * 3.5) * 0.15;
    sprayColumn.scale.set(1.0 + wave * 0.2, 1.0 + wave * 0.3, 1.0 + wave * 0.2);
    sprayCrown.scale.set(1.0 + wave * 0.3, 1.0 - wave * 0.1, 1.0 + wave * 0.3);
    rippleMesh.scale.set(1.0 + wave * 0.4, 1.0 + wave * 0.4, 1.0);

    // Subtle water surface breathing
    waterMesh.position.y = -1.8 + Math.sin(time * 1.5) * 0.03;
  };

  return {
    group: root,
    waterMesh,
    fountainGroup,
    contourGroup,
    lotsGroup,
    updateAnimation,
  };
}
