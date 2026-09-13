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
  _onSelectLot?: (lotNumber: number) => void
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
    color: 0x242426,
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

  const brickMat = textures
    ? new THREE.MeshStandardMaterial({
        map: textures.brick.diff,
        normalMap: textures.brick.nor,
        roughnessMap: textures.brick.rough,
        roughness: 0.85,
        color: 0xb56345,
      })
    : new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.85 });

  const sidingWhiteMat = textures
    ? new THREE.MeshStandardMaterial({
        map: textures.siding.diff,
        normalMap: textures.siding.nor,
        roughnessMap: textures.siding.rough,
        roughness: 0.65,
        color: 0xf8fafc,
      })
    : new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.65 });

  const sidingSageMat = textures
    ? new THREE.MeshStandardMaterial({
        map: textures.siding.diff,
        normalMap: textures.siding.nor,
        roughnessMap: textures.siding.rough,
        roughness: 0.65,
        color: 0x94a390,
      })
    : new THREE.MeshStandardMaterial({ color: 0x849480, roughness: 0.65 });

  const stuccoMat = new THREE.MeshStandardMaterial({
    color: 0xedebe6,
    roughness: 0.88,
  });

  const whiteTrimMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
  const darkTrimMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
  const bronzeTrimMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.45 });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x93c5fd,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.75,
    transparent: true,
    opacity: 0.85,
    reflectivity: 0.9,
  });

  const interiorGlowMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
    transparent: true,
    opacity: 0.45,
  });

  const roofShingleDarkMat = textures
    ? new THREE.MeshStandardMaterial({
        map: textures.roof.diff,
        normalMap: textures.roof.nor,
        roughnessMap: textures.roof.rough,
        roughness: 0.8,
        color: 0x27272a,
      })
    : new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.8 });

  const roofShingleSlateMat = textures
    ? new THREE.MeshStandardMaterial({
        map: textures.roof.diff,
        normalMap: textures.roof.nor,
        roughnessMap: textures.roof.rough,
        roughness: 0.8,
        color: 0x334155,
      })
    : new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });

  const roofMetalBlackMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.35,
    metalness: 0.6,
  });

  const curbMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.6 });
  const roadStripeYellowMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  const crosswalkMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const stopSignMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
  const signGreenMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 });
  const metalPoleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
  const mulchMat = new THREE.MeshStandardMaterial({ color: 0x29180c, roughness: 0.95 });
  const shrubMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.85 });
  const flowerMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.7 });
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
  const treeCanopyMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
  const woodDeckMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
  const mailboxPostMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 });
  const mailboxMetalMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 });
  const redFlagMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });

  // 1. Terrain Mesh with subtle Topographic Slope
  const terrainSize = 260; // 260m x 260m (~17 acres in scale)
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

  // =========================================================================
  // 4. CONTINUOUS CONNECTED ROADWAY CIRCUIT (Inner Loop + Outer Loop + 4 Avenues)
  // =========================================================================
  const roadWidth = 8.5; // Standard 28 ft wide residential street

  // A. INNER PARKWAY LOOP (around central pond)
  const innerRoadR1 = 45.0;
  const innerRoadR2 = innerRoadR1 + roadWidth; // 53.5
  const innerRoadMesh = new THREE.Mesh(
    new THREE.RingGeometry(innerRoadR1, innerRoadR2, 64),
    asphaltMat
  );
  innerRoadMesh.rotation.x = -Math.PI / 2;
  innerRoadMesh.position.set(0, 0.05, 0);
  innerRoadMesh.receiveShadow = true;
  root.add(innerRoadMesh);

  // Inner Road Yellow Dashed Centerline
  const innerStripeR = innerRoadR1 + roadWidth / 2; // 49.25
  const innerStripeMesh = new THREE.Mesh(
    new THREE.RingGeometry(innerStripeR - 0.08, innerStripeR + 0.08, 64),
    roadStripeYellowMat
  );
  innerStripeMesh.rotation.x = -Math.PI / 2;
  innerStripeMesh.position.set(0, 0.06, 0);
  root.add(innerStripeMesh);

  // Inner Road Curbs
  const innerCurbInner = new THREE.Mesh(
    new THREE.RingGeometry(innerRoadR1 - 0.4, innerRoadR1, 64),
    curbMat
  );
  innerCurbInner.rotation.x = -Math.PI / 2;
  innerCurbInner.position.set(0, 0.1, 0);
  root.add(innerCurbInner);

  const innerCurbOuter = new THREE.Mesh(
    new THREE.RingGeometry(innerRoadR2, innerRoadR2 + 0.4, 64),
    curbMat
  );
  innerCurbOuter.rotation.x = -Math.PI / 2;
  innerCurbOuter.position.set(0, 0.1, 0);
  root.add(innerCurbOuter);

  // Inner Pedestrian Sidewalk
  const innerSidewalkR1 = innerRoadR2 + 1.2; // 54.7
  const innerSidewalkR2 = innerSidewalkR1 + 1.6; // 56.3
  const innerSidewalk = new THREE.Mesh(
    new THREE.RingGeometry(innerSidewalkR1, innerSidewalkR2, 64),
    concreteMat
  );
  innerSidewalk.rotation.x = -Math.PI / 2;
  innerSidewalk.position.set(0, 0.08, 0);
  root.add(innerSidewalk);

  // B. OUTER PERIMETER BOULEVARD LOOP (Circling the entire subdivision perimeter)
  const outerRoadR1 = 96.0;
  const outerRoadR2 = outerRoadR1 + roadWidth; // 104.5
  const outerRoadMesh = new THREE.Mesh(
    new THREE.RingGeometry(outerRoadR1, outerRoadR2, 80),
    asphaltMat
  );
  outerRoadMesh.rotation.x = -Math.PI / 2;
  outerRoadMesh.position.set(0, 0.05, 0);
  outerRoadMesh.receiveShadow = true;
  root.add(outerRoadMesh);

  // Outer Road Centerline Yellow Stripes
  const outerStripeR = outerRoadR1 + roadWidth / 2; // 100.25
  const outerStripeMesh = new THREE.Mesh(
    new THREE.RingGeometry(outerStripeR - 0.08, outerStripeR + 0.08, 80),
    roadStripeYellowMat
  );
  outerStripeMesh.rotation.x = -Math.PI / 2;
  outerStripeMesh.position.set(0, 0.06, 0);
  root.add(outerStripeMesh);

  // Outer Road Curbs
  const outerCurbInner = new THREE.Mesh(
    new THREE.RingGeometry(outerRoadR1 - 0.4, outerRoadR1, 80),
    curbMat
  );
  outerCurbInner.rotation.x = -Math.PI / 2;
  outerCurbInner.position.set(0, 0.1, 0);
  root.add(outerCurbInner);

  const outerCurbOuter = new THREE.Mesh(
    new THREE.RingGeometry(outerRoadR2, outerRoadR2 + 0.4, 80),
    curbMat
  );
  outerCurbOuter.rotation.x = -Math.PI / 2;
  outerCurbOuter.position.set(0, 0.1, 0);
  root.add(outerCurbOuter);

  // Outer Sidewalk along inner edge of outer road
  const outerSidewalk = new THREE.Mesh(
    new THREE.RingGeometry(outerRoadR1 - 2.8, outerRoadR1 - 1.2, 80),
    concreteMat
  );
  outerSidewalk.rotation.x = -Math.PI / 2;
  outerSidewalk.position.set(0, 0.08, 0);
  root.add(outerSidewalk);

  // C. FOUR CONNECTING CROSS-AVENUES (North, South, East, West)

  // 1. South Main Entrance Boulevard (Gateway connecting boundary Z=125 through outer loop into inner loop Z=53.5)
  const southAvenueLength = 125 - innerRoadR2; // 71.5m
  const southAvenueZ = innerRoadR2 + southAvenueLength / 2;
  const southAvenue = new THREE.Mesh(new THREE.PlaneGeometry(roadWidth, southAvenueLength), asphaltMat);
  southAvenue.rotation.x = -Math.PI / 2;
  southAvenue.position.set(0, 0.05, southAvenueZ);
  southAvenue.receiveShadow = true;
  root.add(southAvenue);

  // South Entrance Boulevard Centerline Yellow Stripe
  const southStripe = new THREE.Mesh(new THREE.PlaneGeometry(0.16, southAvenueLength), roadStripeYellowMat);
  southStripe.rotation.x = -Math.PI / 2;
  southStripe.position.set(0, 0.06, southAvenueZ);
  root.add(southStripe);

  // South Entrance Boulevard Median Island
  const southMedian = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 45), grassMat);
  southMedian.position.set(0, 0.15, 95);
  root.add(southMedian);

  // South Entrance Monument Sign Wall
  const monumentWall = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.2, 0.9), stoneMat);
  monumentWall.position.set(roadWidth / 2 + 3.8, 1.1, 118);
  root.add(monumentWall);
  const monumentPlaque = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 1.1, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 })
  );
  monumentPlaque.position.set(roadWidth / 2 + 3.8, 1.3, 118 + 0.46);
  root.add(monumentPlaque);

  // 2. North Heritage Way (Connecting Inner Loop Z=-53.5 to Outer Loop Z=-104.5)
  const northAvenueLength = outerRoadR2 - innerRoadR2; // 51m
  const northAvenueZ = -(innerRoadR2 + northAvenueLength / 2);
  const northAvenue = new THREE.Mesh(new THREE.PlaneGeometry(roadWidth, northAvenueLength), asphaltMat);
  northAvenue.rotation.x = -Math.PI / 2;
  northAvenue.position.set(0, 0.05, northAvenueZ);
  northAvenue.receiveShadow = true;
  root.add(northAvenue);

  const northStripe = new THREE.Mesh(new THREE.PlaneGeometry(0.16, northAvenueLength), roadStripeYellowMat);
  northStripe.rotation.x = -Math.PI / 2;
  northStripe.position.set(0, 0.06, northAvenueZ);
  root.add(northStripe);

  // 3. East Ridge Drive (Connecting Inner Loop X=53.5 to Outer Loop X=104.5)
  const eastAvenueLength = outerRoadR2 - innerRoadR2;
  const eastAvenueX = innerRoadR2 + eastAvenueLength / 2;
  const eastAvenue = new THREE.Mesh(new THREE.PlaneGeometry(eastAvenueLength, roadWidth), asphaltMat);
  eastAvenue.rotation.x = -Math.PI / 2;
  eastAvenue.position.set(eastAvenueX, 0.05, 0);
  eastAvenue.receiveShadow = true;
  root.add(eastAvenue);

  const eastStripe = new THREE.Mesh(new THREE.PlaneGeometry(eastAvenueLength, 0.16), roadStripeYellowMat);
  eastStripe.rotation.x = -Math.PI / 2;
  eastStripe.position.set(eastAvenueX, 0.06, 0);
  root.add(eastStripe);

  // 4. West Valley Court / Drive (Connecting Inner Loop X=-53.5 to Outer Loop X=-104.5)
  const westAvenueLength = outerRoadR2 - innerRoadR2;
  const westAvenueX = -(innerRoadR2 + westAvenueLength / 2);
  const westAvenue = new THREE.Mesh(new THREE.PlaneGeometry(westAvenueLength, roadWidth), asphaltMat);
  westAvenue.rotation.x = -Math.PI / 2;
  westAvenue.position.set(westAvenueX, 0.05, 0);
  westAvenue.receiveShadow = true;
  root.add(westAvenue);

  const westStripe = new THREE.Mesh(new THREE.PlaneGeometry(westAvenueLength, 0.16), roadStripeYellowMat);
  westStripe.rotation.x = -Math.PI / 2;
  westStripe.position.set(westAvenueX, 0.06, 0);
  root.add(westStripe);

  // D. PAINTED PEDESTRIAN CROSSWALKS AT INTERSECTIONS (High-Visibility White Zebra Bars)
  const createCrosswalkZebra = (x: number, z: number, rotationY: number) => {
    const cwGroup = new THREE.Group();
    cwGroup.position.set(x, 0.07, z);
    cwGroup.rotation.y = rotationY;

    for (let b = -3; b <= 3; b++) {
      const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 2.4), crosswalkMat);
      bar.rotation.x = -Math.PI / 2;
      bar.position.set(b * 0.9, 0, 0);
      cwGroup.add(bar);
    }
    return cwGroup;
  };

  // Crosswalks at Inner Loop junctions
  root.add(createCrosswalkZebra(0, innerRoadR2 + 1.2, 0)); // South junction
  root.add(createCrosswalkZebra(0, -innerRoadR2 - 1.2, 0)); // North junction
  root.add(createCrosswalkZebra(innerRoadR2 + 1.2, 0, Math.PI / 2)); // East junction
  root.add(createCrosswalkZebra(-innerRoadR2 - 1.2, 0, Math.PI / 2)); // West junction

  // Crosswalks at Outer Loop junctions
  root.add(createCrosswalkZebra(0, outerRoadR1 - 1.2, 0)); // South outer
  root.add(createCrosswalkZebra(0, -outerRoadR1 + 1.2, 0)); // North outer
  root.add(createCrosswalkZebra(outerRoadR1 - 1.2, 0, Math.PI / 2)); // East outer
  root.add(createCrosswalkZebra(-outerRoadR1 + 1.2, 0, Math.PI / 2)); // West outer

  // E. 3D STOP SIGNS AND STREET NAME SIGNS AT INTERSECTIONS
  const createStreetSignPost = (x: number, z: number) => {
    const post = new THREE.Group();
    post.position.set(x, 0, z);

    // Metal pole
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.2, 8), metalPoleMat);
    pole.position.y = 1.6;
    post.add(pole);

    // Octagonal Stop Sign
    const stopPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 8), stopSignMat);
    stopPlate.rotation.x = Math.PI / 2;
    stopPlate.position.set(0, 2.4, 0.03);
    post.add(stopPlate);

    // Green Street Name Blade
    const namePlate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.22, 0.03), signGreenMat);
    namePlate.position.set(0.4, 2.9, 0);
    post.add(namePlate);

    return post;
  };

  root.add(createStreetSignPost(roadWidth / 2 + 1.0, innerRoadR2 + 2.5));
  root.add(createStreetSignPost(-roadWidth / 2 - 1.0, -innerRoadR2 - 2.5));
  root.add(createStreetSignPost(innerRoadR2 + 2.5, roadWidth / 2 + 1.0));
  root.add(createStreetSignPost(-innerRoadR2 - 2.5, -roadWidth / 2 - 1.0));

  // F. STREET LAMPS AROUND INNER LOOP AND OUTER LOOP
  const createStreetLamp = (x: number, z: number) => {
    const postGroup = new THREE.Group();
    postGroup.position.set(x, 0, z);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 4.6, 8), metalPoleMat);
    pole.position.y = 2.3;
    postGroup.add(pole);

    const lantern = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.5, 0.35),
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        roughness: 0.1,
        emissive: 0xfef08a,
        emissiveIntensity: 0.8,
      })
    );
    lantern.position.y = 4.7;
    postGroup.add(lantern);

    const streetLight = new THREE.PointLight(0xffbe6b, 0.55, 14);
    streetLight.position.y = 4.6;
    postGroup.add(streetLight);

    return postGroup;
  };

  // 12 Lamps along the Inner Loop
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI * 2) / 12;
    const lx = Math.cos(angle) * (innerRoadR2 + 0.8);
    const lz = Math.sin(angle) * (innerRoadR2 + 0.8);
    root.add(createStreetLamp(lx, lz));
  }

  // 16 Lamps along the Outer Loop
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI * 2) / 16;
    const lx = Math.cos(angle) * (outerRoadR1 - 0.8);
    const lz = Math.sin(angle) * (outerRoadR1 - 0.8);
    root.add(createStreetLamp(lx, lz));
  }

  // =========================================================================
  // 5. PLATTED RESIDENTIAL LOTS & FULLY FINISHED HOMES
  // =========================================================================
  const standardWindowFrameGeo = new THREE.BoxGeometry(1.3, 1.8, 0.08);
  const standardWindowGlassGeo = new THREE.BoxGeometry(1.15, 1.65, 0.04);
  const standardWindowSillGeo = new THREE.BoxGeometry(1.45, 0.1, 0.2);
  const standardShutterGeo = new THREE.BoxGeometry(0.48, 1.75, 0.06);
  const standardColumnGeo = new THREE.BoxGeometry(0.24, 2.9, 0.24);
  const standardChimneyCapGeo = new THREE.CylinderGeometry(0.2, 0.24, 0.45, 8);
  const standardBoxwoodGeo = new THREE.SphereGeometry(0.55, 8, 8);
  const standardDrivewayGeo = new THREE.PlaneGeometry(5.2, 19.5);
  const standardWalkwayGeo = new THREE.PlaneGeometry(1.4, 7.5);

  /**
   * Completely builds an architectural residence based on one of four distinct styles
   */
  const buildCompleteNeighborhoodHouse = (styleIndex: number, lotNum: number): THREE.Group => {
    const hGroup = new THREE.Group();
    hGroup.name = `FinishedHouse_Lot${lotNum}`;
    const style = styleIndex % 4;

    // -----------------------------------------------------------------------
    // STYLE 0: THE COLONIAL MANOR (Classic Red Brick, Slate Roof, Portico)
    // -----------------------------------------------------------------------
    if (style === 0) {
      const foundation = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.8, 8.8), stoneMat);
      foundation.position.y = 0.4;
      foundation.castShadow = true;
      hGroup.add(foundation);

      const mainHouse = new THREE.Mesh(new THREE.BoxGeometry(12.0, 5.8, 8.4), brickMat);
      mainHouse.position.y = 3.7;
      mainHouse.castShadow = true;
      hGroup.add(mainHouse);

      const beltCourse = new THREE.Mesh(new THREE.BoxGeometry(12.15, 0.14, 8.55), whiteTrimMat);
      beltCourse.position.y = 3.6;
      hGroup.add(beltCourse);

      const porticoDeck = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.35, 2.2), concreteMat);
      porticoDeck.position.set(0, 0.4, 5.1);
      hGroup.add(porticoDeck);

      const porticoSteps = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.2, 1.0), concreteMat);
      porticoSteps.position.set(0, 0.1, 6.4);
      hGroup.add(porticoSteps);

      const col1 = new THREE.Mesh(standardColumnGeo, whiteTrimMat);
      col1.position.set(-1.4, 1.85, 5.8);
      hGroup.add(col1);
      const col2 = new THREE.Mesh(standardColumnGeo, whiteTrimMat);
      col2.position.set(1.4, 1.85, 5.8);
      hGroup.add(col2);

      const porticoRoof = new THREE.Mesh(new THREE.ConeGeometry(2.4, 1.2, 4), roofShingleSlateMat);
      porticoRoof.position.set(0, 3.85, 5.2);
      porticoRoof.rotation.y = Math.PI / 4;
      porticoRoof.scale.set(1.2, 1.0, 0.9);
      hGroup.add(porticoRoof);

      const frontDoor = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.4, 0.08), darkTrimMat);
      frontDoor.position.set(0, 1.6, 4.22);
      hGroup.add(frontDoor);

      const addColonialWindow = (wx: number, wy: number) => {
        const frame = new THREE.Mesh(standardWindowFrameGeo, whiteTrimMat);
        frame.position.set(wx, wy, 4.23);
        hGroup.add(frame);
        const glass = new THREE.Mesh(standardWindowGlassGeo, glassMat);
        glass.position.set(wx, wy, 4.25);
        hGroup.add(glass);
        const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.6), interiorGlowMat);
        glow.position.set(wx, wy, 4.22);
        hGroup.add(glow);
        const sill = new THREE.Mesh(standardWindowSillGeo, whiteTrimMat);
        sill.position.set(wx, wy - 0.95, 4.28);
        hGroup.add(sill);
        const shLeft = new THREE.Mesh(standardShutterGeo, darkTrimMat);
        shLeft.position.set(wx - 0.95, wy, 4.25);
        hGroup.add(shLeft);
        const shRight = new THREE.Mesh(standardShutterGeo, darkTrimMat);
        shRight.position.set(wx + 0.95, wy, 4.25);
        hGroup.add(shRight);
      };

      addColonialWindow(-4.0, 2.1);
      addColonialWindow(4.0, 2.1);
      addColonialWindow(-4.0, 5.0);
      addColonialWindow(0, 5.0);
      addColonialWindow(4.0, 5.0);

      const garageWing = new THREE.Mesh(new THREE.BoxGeometry(6.2, 3.4, 6.8), brickMat);
      garageWing.position.set(-8.5, 2.1, 1.2);
      garageWing.castShadow = true;
      hGroup.add(garageWing);

      const garageDoor = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.4, 0.08), whiteTrimMat);
      garageDoor.position.set(-8.5, 1.6, 4.62);
      hGroup.add(garageDoor);

      const gGlass = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.45, 0.04), glassMat);
      gGlass.position.set(-8.5, 2.4, 4.68);
      hGroup.add(gGlass);

      const gRoof = new THREE.Mesh(new THREE.ConeGeometry(5.0, 1.8, 4), roofShingleSlateMat);
      gRoof.position.set(-8.5, 4.4, 1.2);
      gRoof.rotation.y = Math.PI / 4;
      gRoof.scale.set(1.1, 1.0, 1.1);
      hGroup.add(gRoof);

      const mainRoof = new THREE.Mesh(new THREE.ConeGeometry(8.8, 3.2, 4), roofShingleSlateMat);
      mainRoof.position.set(0, 8.0, 0);
      mainRoof.rotation.y = Math.PI / 4;
      mainRoof.scale.set(1.45, 1.0, 1.1);
      mainRoof.castShadow = true;
      hGroup.add(mainRoof);

      const createDormer = (dx: number) => {
        const dorm = new THREE.Group();
        dorm.position.set(dx, 7.2, 2.4);
        const dBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.5, 1.8), sidingWhiteMat);
        dorm.add(dBody);
        const dWindow = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.1, 0.04), glassMat);
        dWindow.position.set(0, 0, 0.92);
        dorm.add(dWindow);
        const dRoof = new THREE.Mesh(new THREE.ConeGeometry(1.3, 0.9, 4), roofShingleSlateMat);
        dRoof.position.set(0, 1.1, 0);
        dRoof.rotation.y = Math.PI / 4;
        dorm.add(dRoof);
        return dorm;
      };
      hGroup.add(createDormer(-2.8));
      hGroup.add(createDormer(2.8));

      const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.2, 8.8, 1.4), brickMat);
      chimney.position.set(5.8, 5.0, -1.8);
      hGroup.add(chimney);
      const cap1 = new THREE.Mesh(standardChimneyCapGeo, stoneMat);
      cap1.position.set(5.6, 9.6, -1.8);
      hGroup.add(cap1);
      const cap2 = new THREE.Mesh(standardChimneyCapGeo, stoneMat);
      cap2.position.set(6.0, 9.6, -1.8);
      hGroup.add(cap2);

      const patio = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.2, 4.0), concreteMat);
      patio.position.set(0, 0.1, -5.8);
      hGroup.add(patio);

      const driveway = new THREE.Mesh(standardDrivewayGeo, concreteMat);
      driveway.rotation.x = -Math.PI / 2;
      driveway.position.set(-8.5, 0.04, 14.0);
      hGroup.add(driveway);

      const walkway = new THREE.Mesh(standardWalkwayGeo, concreteMat);
      walkway.rotation.x = -Math.PI / 2;
      walkway.rotation.z = Math.PI / 2;
      walkway.position.set(-4.2, 0.05, 6.4);
      hGroup.add(walkway);

    // -----------------------------------------------------------------------
    // STYLE 1: THE CRAFTSMAN ESTATE (Sage Siding, Stone Water Table, Tapered Posts)
    // -----------------------------------------------------------------------
    } else if (style === 1) {
      const stoneBase = new THREE.Mesh(new THREE.BoxGeometry(12.4, 1.4, 8.8), stoneMat);
      stoneBase.position.y = 0.7;
      stoneBase.castShadow = true;
      hGroup.add(stoneBase);

      const waterTable = new THREE.Mesh(new THREE.BoxGeometry(12.6, 0.16, 9.0), whiteTrimMat);
      waterTable.position.y = 1.4;
      hGroup.add(waterTable);

      const mainHouse = new THREE.Mesh(new THREE.BoxGeometry(12.0, 5.2, 8.4), sidingSageMat);
      mainHouse.position.y = 4.0;
      mainHouse.castShadow = true;
      hGroup.add(mainHouse);

      const porchDeck = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.35, 2.8), woodDeckMat);
      porchDeck.position.set(1.5, 0.5, 5.4);
      hGroup.add(porchDeck);

      const porchSteps = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.25, 1.2), concreteMat);
      porchSteps.position.set(1.5, 0.15, 7.0);
      hGroup.add(porchSteps);

      [-1.8, 1.5, 4.8].forEach((px) => {
        const stonePier = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.0, 0.55), stoneMat);
        stonePier.position.set(px, 1.0, 6.5);
        hGroup.add(stonePier);

        const taperedPost = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 2.2, 4), whiteTrimMat);
        taperedPost.rotation.y = Math.PI / 4;
        taperedPost.position.set(px, 2.3, 6.5);
        hGroup.add(taperedPost);
      });

      const porchRoof = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.35, 3.2), roofShingleDarkMat);
      porchRoof.position.set(1.5, 3.5, 5.4);
      porchRoof.rotation.x = 0.15;
      hGroup.add(porchRoof);

      const frontDoor = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.3, 0.08), bronzeTrimMat);
      frontDoor.position.set(1.5, 1.65, 4.22);
      hGroup.add(frontDoor);

      const addCraftsmanWindow = (wx: number, wy: number, width = 1.3) => {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(width, 1.7, 0.08), bronzeTrimMat);
        frame.position.set(wx, wy, 4.23);
        hGroup.add(frame);
        const glass = new THREE.Mesh(new THREE.BoxGeometry(width - 0.15, 1.55, 0.04), glassMat);
        glass.position.set(wx, wy, 4.25);
        hGroup.add(glass);
        const glow = new THREE.Mesh(new THREE.PlaneGeometry(width - 0.2, 1.5), interiorGlowMat);
        glow.position.set(wx, wy, 4.22);
        hGroup.add(glow);
      };

      addCraftsmanWindow(3.8, 2.0, 1.4);
      addCraftsmanWindow(-3.5, 2.0, 1.8);
      addCraftsmanWindow(-3.5, 4.8, 1.8);
      addCraftsmanWindow(0.5, 4.8, 1.4);
      addCraftsmanWindow(3.8, 4.8, 1.4);

      const garageWing = new THREE.Mesh(new THREE.BoxGeometry(6.2, 3.4, 6.8), sidingSageMat);
      garageWing.position.set(-8.5, 2.1, 1.2);
      garageWing.castShadow = true;
      hGroup.add(garageWing);

      const gDoor = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.4, 0.08), whiteTrimMat);
      gDoor.position.set(-8.5, 1.6, 4.62);
      hGroup.add(gDoor);

      const gRoof = new THREE.Mesh(new THREE.ConeGeometry(5.0, 1.8, 4), roofShingleDarkMat);
      gRoof.position.set(-8.5, 4.4, 1.2);
      gRoof.rotation.y = Math.PI / 4;
      gRoof.scale.set(1.1, 1.0, 1.1);
      hGroup.add(gRoof);

      const mainRoof = new THREE.Mesh(new THREE.ConeGeometry(8.6, 3.4, 4), roofShingleDarkMat);
      mainRoof.position.set(0, 8.0, 0);
      mainRoof.rotation.y = Math.PI / 4;
      mainRoof.scale.set(1.45, 1.0, 1.15);
      mainRoof.castShadow = true;
      hGroup.add(mainRoof);

      const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.4, 8.6, 1.4), stoneMat);
      chimney.position.set(5.8, 4.8, -1.2);
      hGroup.add(chimney);

      const rearDeck = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.3, 3.8), woodDeckMat);
      rearDeck.position.set(0, 0.4, -5.8);
      hGroup.add(rearDeck);

      const driveway = new THREE.Mesh(standardDrivewayGeo, concreteMat);
      driveway.rotation.x = -Math.PI / 2;
      driveway.position.set(-8.5, 0.04, 14.0);
      hGroup.add(driveway);

      const walkway = new THREE.Mesh(standardWalkwayGeo, concreteMat);
      walkway.rotation.x = -Math.PI / 2;
      walkway.rotation.z = Math.PI / 2;
      walkway.position.set(-3.5, 0.05, 7.0);
      hGroup.add(walkway);

    // -----------------------------------------------------------------------
    // STYLE 2: THE MODERN FARMHOUSE (Crisp White Board & Batten, Black Windows)
    // -----------------------------------------------------------------------
    } else if (style === 2) {
      const foundation = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.8, 8.8), concreteMat);
      foundation.position.y = 0.4;
      foundation.castShadow = true;
      hGroup.add(foundation);

      const mainHouse = new THREE.Mesh(new THREE.BoxGeometry(12.0, 6.0, 8.4), sidingWhiteMat);
      mainHouse.position.y = 3.8;
      mainHouse.castShadow = true;
      hGroup.add(mainHouse);

      const porchDeck = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.35, 2.6), concreteMat);
      porchDeck.position.set(0, 0.4, 5.3);
      hGroup.add(porchDeck);

      [-5.2, -1.8, 1.8, 5.2].forEach((px) => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.8, 0.18), darkTrimMat);
        post.position.set(px, 1.8, 6.4);
        hGroup.add(post);
      });

      const porchRoof = new THREE.Mesh(new THREE.BoxGeometry(12.6, 0.25, 3.0), roofMetalBlackMat);
      porchRoof.position.set(0, 3.3, 5.3);
      porchRoof.rotation.x = 0.14;
      hGroup.add(porchRoof);

      const frontDoor = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.4, 0.08), darkTrimMat);
      frontDoor.position.set(0, 1.6, 4.22);
      hGroup.add(frontDoor);

      const addFarmhouseWindow = (wx: number, wy: number, width = 1.4) => {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(width, 1.9, 0.08), darkTrimMat);
        frame.position.set(wx, wy, 4.23);
        hGroup.add(frame);
        const glass = new THREE.Mesh(new THREE.BoxGeometry(width - 0.14, 1.76, 0.04), glassMat);
        glass.position.set(wx, wy, 4.25);
        hGroup.add(glass);
        const glow = new THREE.Mesh(new THREE.PlaneGeometry(width - 0.2, 1.7), interiorGlowMat);
        glow.position.set(wx, wy, 4.22);
        hGroup.add(glow);
      };

      addFarmhouseWindow(-3.6, 2.1, 1.8);
      addFarmhouseWindow(3.6, 2.1, 1.8);
      addFarmhouseWindow(-3.6, 5.1, 1.8);
      addFarmhouseWindow(0, 5.1, 1.4);
      addFarmhouseWindow(3.6, 5.1, 1.8);

      const garageWing = new THREE.Mesh(new THREE.BoxGeometry(6.2, 3.4, 6.8), sidingWhiteMat);
      garageWing.position.set(-8.5, 2.1, 1.2);
      garageWing.castShadow = true;
      hGroup.add(garageWing);

      const gDoor = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.4, 0.08), darkTrimMat);
      gDoor.position.set(-8.5, 1.6, 4.62);
      hGroup.add(gDoor);

      const gRoof = new THREE.Mesh(new THREE.ConeGeometry(5.0, 1.8, 4), roofMetalBlackMat);
      gRoof.position.set(-8.5, 4.4, 1.2);
      gRoof.rotation.y = Math.PI / 4;
      gRoof.scale.set(1.1, 1.0, 1.1);
      hGroup.add(gRoof);

      const mainRoof = new THREE.Mesh(new THREE.ConeGeometry(8.8, 3.8, 4), roofMetalBlackMat);
      mainRoof.position.set(0, 8.4, 0);
      mainRoof.rotation.y = Math.PI / 4;
      mainRoof.scale.set(1.45, 1.0, 1.1);
      mainRoof.castShadow = true;
      hGroup.add(mainRoof);

      const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.2, 8.8, 1.2), sidingWhiteMat);
      chimney.position.set(-5.2, 5.2, -1.8);
      hGroup.add(chimney);
      const cShroud = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 1.4), darkTrimMat);
      cShroud.position.set(-5.2, 9.7, -1.8);
      hGroup.add(cShroud);

      const patio = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.2, 4.2), concreteMat);
      patio.position.set(0, 0.1, -6.0);
      hGroup.add(patio);

      const driveway = new THREE.Mesh(standardDrivewayGeo, concreteMat);
      driveway.rotation.x = -Math.PI / 2;
      driveway.position.set(-8.5, 0.04, 14.0);
      hGroup.add(driveway);

      const walkway = new THREE.Mesh(standardWalkwayGeo, concreteMat);
      walkway.rotation.x = -Math.PI / 2;
      walkway.rotation.z = Math.PI / 2;
      walkway.position.set(-4.2, 0.05, 6.4);
      hGroup.add(walkway);

    // -----------------------------------------------------------------------
    // STYLE 3: THE EUROPEAN HERITAGE (Limestone Base, Stucco, Arched Entry)
    // -----------------------------------------------------------------------
    } else {
      const stoneBase = new THREE.Mesh(new THREE.BoxGeometry(12.4, 3.2, 8.8), stoneMat);
      stoneBase.position.y = 1.6;
      stoneBase.castShadow = true;
      hGroup.add(stoneBase);

      const stuccoStory = new THREE.Mesh(new THREE.BoxGeometry(12.0, 3.2, 8.4), stuccoMat);
      stuccoStory.position.y = 4.8;
      stuccoStory.castShadow = true;
      hGroup.add(stuccoStory);

      const porticoArch = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.2, 1.8), stoneMat);
      porticoArch.position.set(0, 1.6, 5.0);
      hGroup.add(porticoArch);

      const archCut = new THREE.Mesh(
        new THREE.CylinderGeometry(0.85, 0.85, 2.0, 16),
        new THREE.MeshBasicMaterial({ color: 0x1c1917 })
      );
      archCut.rotation.x = Math.PI / 2;
      archCut.position.set(0, 1.8, 5.1);
      hGroup.add(archCut);

      const archDoor = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.4, 0.08), woodDeckMat);
      archDoor.position.set(0, 1.5, 4.22);
      hGroup.add(archDoor);

      const addEuropeanWindow = (wx: number, wy: number) => {
        const frame = new THREE.Mesh(standardWindowFrameGeo, darkTrimMat);
        frame.position.set(wx, wy, 4.23);
        hGroup.add(frame);
        const glass = new THREE.Mesh(standardWindowGlassGeo, glassMat);
        glass.position.set(wx, wy, 4.25);
        hGroup.add(glass);
        const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.6), interiorGlowMat);
        glow.position.set(wx, wy, 4.22);
        hGroup.add(glow);

        const wBox = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, 0.4), darkTrimMat);
        wBox.position.set(wx, wy - 0.95, 4.4);
        hGroup.add(wBox);
        const greenery = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 0.3), shrubMat);
        greenery.position.set(wx, wy - 0.78, 4.4);
        hGroup.add(greenery);
      };

      addEuropeanWindow(-4.0, 1.8);
      addEuropeanWindow(4.0, 1.8);
      addEuropeanWindow(-4.0, 4.8);
      addEuropeanWindow(4.0, 4.8);

      const garageWing = new THREE.Mesh(new THREE.BoxGeometry(6.2, 3.4, 6.8), stoneMat);
      garageWing.position.set(-8.5, 2.1, 1.2);
      garageWing.castShadow = true;
      hGroup.add(garageWing);

      const gDoor = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.4, 0.08), woodDeckMat);
      gDoor.position.set(-8.5, 1.6, 4.62);
      hGroup.add(gDoor);

      const gRoof = new THREE.Mesh(new THREE.ConeGeometry(5.0, 2.2, 4), roofShingleSlateMat);
      gRoof.position.set(-8.5, 4.6, 1.2);
      gRoof.rotation.y = Math.PI / 4;
      gRoof.scale.set(1.1, 1.0, 1.1);
      hGroup.add(gRoof);

      const mainRoof = new THREE.Mesh(new THREE.ConeGeometry(9.0, 4.0, 4), roofShingleSlateMat);
      mainRoof.position.set(0, 8.4, 0);
      mainRoof.rotation.y = Math.PI / 4;
      mainRoof.scale.set(1.45, 1.0, 1.15);
      mainRoof.castShadow = true;
      hGroup.add(mainRoof);

      const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.6, 9.2, 1.6), stoneMat);
      chimney.position.set(5.8, 5.0, 1.4);
      hGroup.add(chimney);

      const patio = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.2, 4.4), stoneMat);
      patio.position.set(0, 0.1, -6.0);
      hGroup.add(patio);

      const driveway = new THREE.Mesh(standardDrivewayGeo, concreteMat);
      driveway.rotation.x = -Math.PI / 2;
      driveway.position.set(-8.5, 0.04, 14.0);
      hGroup.add(driveway);

      const walkway = new THREE.Mesh(standardWalkwayGeo, concreteMat);
      walkway.rotation.x = -Math.PI / 2;
      walkway.rotation.z = Math.PI / 2;
      walkway.position.set(-4.2, 0.05, 6.4);
      hGroup.add(walkway);
    }

    // -----------------------------------------------------------------------
    // FINISHED LANDSCAPING, MAILBOX, AND DETAILS ON EVERY LOT
    // -----------------------------------------------------------------------
    // Foundation Mulch Garden Bed
    const mulchBed = new THREE.Mesh(new THREE.BoxGeometry(13.6, 0.08, 2.2), mulchMat);
    mulchBed.position.set(0, 0.04, 5.2);
    hGroup.add(mulchBed);

    // Sculpted Foundation Shrubs
    [-5.2, -3.8, -2.4, 2.4, 3.8, 5.2].forEach((bx) => {
      const shrub = new THREE.Mesh(standardBoxwoodGeo, shrubMat);
      shrub.position.set(bx, 0.5, 5.4);
      shrub.scale.set(1.0, 0.85, 1.0);
      hGroup.add(shrub);
    });

    // Flower Accent Clusters
    [-3.1, 3.1].forEach((fx) => {
      const flw = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), flowerMat);
      flw.position.set(fx, 0.35, 5.8);
      hGroup.add(flw);
    });

    // Front Lawn Ornamental Shade / Flowering Dogwood Tree
    const lawnTree = new THREE.Group();
    lawnTree.position.set(5.2, 0, 11.5);
    const trk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 3.2, 8), trunkMat);
    trk.position.y = 1.6;
    lawnTree.add(trk);
    const fol = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8, 1), treeCanopyMat);
    fol.position.y = 3.6;
    lawnTree.add(fol);
    hGroup.add(lawnTree);

    // Curbside Wooden Post Mailbox with Red Flag (at the road curb edge)
    const mailboxGroup = new THREE.Group();
    mailboxGroup.position.set(-5.6, 0, 18.2);

    const mPost = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.3, 0.12), mailboxPostMat);
    mPost.position.y = 0.65;
    mailboxGroup.add(mPost);

    const mBox = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.26, 0.55), mailboxMetalMat);
    mBox.position.set(0, 1.35, 0.1);
    mailboxGroup.add(mBox);

    const mFlag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.08), redFlagMat);
    mFlag.position.set(0.16, 1.42, 0.05);
    mailboxGroup.add(mFlag);

    hGroup.add(mailboxGroup);

    return hGroup;
  };

  // =========================================================================
  // 6. ALLOCATE RESIDENTIAL LOTS SAFELY ACROSS THE 4 QUADRANTS
  // =========================================================================
  const numLots = Math.min(24, Math.max(12, config.totalLots));
  const lotRadius = 75.0; // Midway between inner road (53.5) and outer road (96.0)

  // Divide lots evenly across the 4 quadrant sectors (leaving clean clearings for the 4 avenues)
  // Cross avenues are at: 0 (East), PI/2 (South), PI (West), 3*PI/2 (North)
  const sectors = [
    { start: 0.30, end: 1.25 }, // NE
    { start: 1.88, end: 2.84 }, // SE
    { start: 3.45, end: 4.41 }, // SW
    { start: 5.02, end: 5.98 }, // NW
  ];

  const lotsPerSector = Math.ceil(numLots / 4);
  let placedLots = 0;

  for (let s = 0; s < 4 && placedLots < numLots; s++) {
    const sector = sectors[s];
    const countInSector = Math.min(lotsPerSector, numLots - placedLots);
    const step = (sector.end - sector.start) / Math.max(1, countInSector - 1);

    for (let k = 0; k < countInSector; k++) {
      const angle = countInSector === 1 ? (sector.start + sector.end) / 2 : sector.start + k * step;
      const lotIndex = placedLots++;

      const lotX = Math.cos(angle) * lotRadius;
      const lotZ = Math.sin(angle) * lotRadius;

      const lotContainer = new THREE.Group();
      lotContainer.name = `Lot_${lotIndex + 1}`;
      lotContainer.position.set(lotX, 0, lotZ);
      // Face inward towards the Inner Loop and pond
      lotContainer.rotation.y = -angle - Math.PI / 2;
      lotContainer.userData = { lotNumber: lotIndex + 1 };

      // Lot Boundary Lines (Dashed parcel line)
      const lotBoundsGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-12, 0.06, -15),
        new THREE.Vector3(12, 0.06, -15),
        new THREE.Vector3(12, 0.06, 18.5),
        new THREE.Vector3(-12, 0.06, 18.5),
        new THREE.Vector3(-12, 0.06, -15),
      ]);
      const lotBounds = new THREE.Line(
        lotBoundsGeo,
        new THREE.LineDashedMaterial({ color: 0x38bdf8, dashSize: 0.8, gapSize: 0.4 })
      );
      lotBounds.computeLineDistances();
      lotContainer.add(lotBounds);

      // Add Completely Finished Architectural House
      const house = buildCompleteNeighborhoodHouse(lotIndex, lotIndex + 1);
      house.userData = { lotNumber: lotIndex + 1 };
      lotContainer.add(house);

      lotsGroup.add(lotContainer);
    }
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
