import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import {
  Sun,
  Sunset,
  Moon,
  Camera,
  Maximize2,
  Minimize2,
  Download,
  Layers,
  Eye,
  RotateCw,
  Box,
  Compass,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type LightingMode = "day" | "sunset" | "night";

export interface HouseViewerProps {
  parcelId?: string;
  address?: string;
  zoningDistrict?: string;
  onClose?: () => void;
}

export function HouseModelViewer({
  parcelId = "79-000-02-0045.00-00000",
  address = "742 Evergreen Terrace, York PA",
  zoningDistrict = "R-1 Low-Density Residential",
}: HouseViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [lightingMode, setLightingMode] = useState<LightingMode>("day");
  const [showZoningEnvelope, setShowZoningEnvelope] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [showLandscaping, setShowLandscaping] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeCameraView, setActiveCameraView] = useState("front");

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const interiorLightsRef = useRef<THREE.PointLight[]>([]);
  const porchLightsRef = useRef<THREE.PointLight[]>([]);
  const zoningGroupRef = useRef<THREE.Group | null>(null);
  const landscapingGroupRef = useRef<THREE.Group | null>(null);
  const houseGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x9fc3e8);
    scene.fog = new THREE.FogExp2(0xb2d6f5, 0.009);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      500
    );
    // Initial Front Perspective (matching reference photo 1)
    camera.position.set(0, 4.2, 25);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    rendererRef.current = renderer;
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 3.8, 0);
    controls.minDistance = 4;
    controls.maxDistance = 85;
    controls.maxPolarAngle = Math.PI / 2 - 0.03; // Disallow going underground

    // 5. Lighting Setup
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.1);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    sunLight.position.set(22, 35, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 120;
    const d = 26;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // 6. Texture Loading (Poly Haven Textures)
    const textureLoader = new THREE.TextureLoader();
    let loadedCount = 0;
    const totalTextures = 15;
    const onTexLoad = () => {
      loadedCount++;
      setLoadingProgress(Math.min(100, Math.round((loadedCount / totalTextures) * 100)));
      if (loadedCount >= totalTextures) {
        setIsLoaded(true);
      }
    };

    const loadPBR = (name: string, repX: number, repY: number) => {
      const diff = textureLoader.load(`/textures/house/${name}_diff.jpg`, onTexLoad);
      const nor = textureLoader.load(`/textures/house/${name}_nor.jpg`, onTexLoad);
      const rough = textureLoader.load(`/textures/house/${name}_rough.jpg`, onTexLoad);

      [diff, nor, rough].forEach((t) => {
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(repX, repY);
      });
      diff.colorSpace = THREE.SRGBColorSpace;

      return { diff, nor, rough };
    };

    const brickTex = loadPBR("brick", 3, 2);
    const sidingTex = loadPBR("siding", 4, 6);
    const roofTex = loadPBR("roof", 5, 5);
    const grassTex = loadPBR("grass", 14, 14);
    const concreteTex = loadPBR("concrete", 4, 4);

    // 7. Materials Library
    const brickMat = new THREE.MeshStandardMaterial({
      map: brickTex.diff,
      normalMap: brickTex.nor,
      roughnessMap: brickTex.rough,
      roughness: 0.85,
      metalness: 0.05,
      color: 0xb56345, // Rich red-brown brick
    });

    const sidingMat = new THREE.MeshStandardMaterial({
      map: sidingTex.diff,
      normalMap: sidingTex.nor,
      roughnessMap: sidingTex.rough,
      roughness: 0.65,
      metalness: 0.02,
      color: 0xf1ebe1, // Soft cream/tan horizontal lap siding
    });

    const roofMat = new THREE.MeshStandardMaterial({
      map: roofTex.diff,
      normalMap: roofTex.nor,
      roughnessMap: roofTex.rough,
      roughness: 0.8,
      metalness: 0.1,
      color: 0x42403f, // Weathered dark charcoal shingle
    });

    const concreteMat = new THREE.MeshStandardMaterial({
      map: concreteTex.diff,
      normalMap: concreteTex.nor,
      roughnessMap: concreteTex.rough,
      roughness: 0.75,
      metalness: 0.05,
      color: 0xdedede,
    });

    const grassMat = new THREE.MeshStandardMaterial({
      map: grassTex.diff,
      normalMap: grassTex.nor,
      roughnessMap: grassTex.rough,
      roughness: 0.95,
      metalness: 0.0,
      color: 0x6e9c46, // Vibrant lawn
    });

    const whiteTrimMat = new THREE.MeshStandardMaterial({
      color: 0xfbfbfb,
      roughness: 0.35,
      metalness: 0.05,
    });

    const darkTrimMat = new THREE.MeshStandardMaterial({
      color: 0x22262a,
      roughness: 0.4,
      metalness: 0.1,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xaed3e6,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.7,
      transparent: true,
      opacity: 0.85,
      reflectivity: 0.9,
    });

    const interiorGlowMat = new THREE.MeshBasicMaterial({
      color: 0xffdfa4,
      transparent: true,
      opacity: 0.8,
    });

    const mulchMat = new THREE.MeshStandardMaterial({
      color: 0x3d2719,
      roughness: 0.95,
    });

    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0x2d5a27,
      roughness: 0.8,
    });

    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x4a3b32,
      roughness: 0.9,
    });

    // 8. Construct Architectural Model
    const houseGroup = new THREE.Group();
    houseGroupRef.current = houseGroup;
    scene.add(houseGroup);

    // Helpers to build window assemblies with frames and panes
    const createWindow = (
      width: number,
      height: number,
      withShutters = false,
      isArched = false
    ) => {
      const winGroup = new THREE.Group();
      const frameDepth = 0.12;
      const frameThickness = 0.07;

      if (!isArched) {
        // Outer trim box
        const frameBox = new THREE.Mesh(
          new THREE.BoxGeometry(width, height, frameDepth),
          whiteTrimMat
        );
        frameBox.castShadow = true;
        winGroup.add(frameBox);

        // Glass Pane
        const glass = new THREE.Mesh(
          new THREE.PlaneGeometry(width - frameThickness * 2, height - frameThickness * 2),
          glassMat
        );
        glass.position.z = frameDepth * 0.25;
        winGroup.add(glass);

        // Warm interior glow pane (behind glass)
        const glow = new THREE.Mesh(
          new THREE.PlaneGeometry(width - frameThickness * 2, height - frameThickness * 2),
          interiorGlowMat
        );
        glow.position.z = -frameDepth * 0.1;
        glow.name = "interiorGlow";
        glow.visible = false;
        winGroup.add(glow);

        // Mullions (horizontal & vertical bars)
        const vMullion = new THREE.Mesh(
          new THREE.BoxGeometry(0.025, height - frameThickness * 2, frameDepth * 0.6),
          whiteTrimMat
        );
        vMullion.position.z = frameDepth * 0.28;
        winGroup.add(vMullion);

        const hMullion1 = new THREE.Mesh(
          new THREE.BoxGeometry(width - frameThickness * 2, 0.025, frameDepth * 0.6),
          whiteTrimMat
        );
        hMullion1.position.set(0, height * 0.16, frameDepth * 0.28);
        winGroup.add(hMullion1);

        const hMullion2 = new THREE.Mesh(
          new THREE.BoxGeometry(width - frameThickness * 2, 0.025, frameDepth * 0.6),
          whiteTrimMat
        );
        hMullion2.position.set(0, -height * 0.16, frameDepth * 0.28);
        winGroup.add(hMullion2);

        // Window Sill
        const sill = new THREE.Mesh(
          new THREE.BoxGeometry(width + 0.14, 0.06, frameDepth + 0.08),
          whiteTrimMat
        );
        sill.position.set(0, -height / 2 - 0.03, 0.03);
        sill.castShadow = true;
        winGroup.add(sill);

        // Shutters if specified (dark navy/black shutters matching photos)
        if (withShutters) {
          const shutterW = width * 0.35;
          const shutterH = height * 0.98;
          const shutterL = new THREE.Mesh(
            new THREE.BoxGeometry(shutterW, shutterH, 0.04),
            darkTrimMat
          );
          shutterL.position.set(-width / 2 - shutterW / 2 - 0.02, 0, 0.02);
          shutterL.castShadow = true;
          winGroup.add(shutterL);

          const shutterR = new THREE.Mesh(
            new THREE.BoxGeometry(shutterW, shutterH, 0.04),
            darkTrimMat
          );
          shutterR.position.set(width / 2 + shutterW / 2 + 0.02, 0, 0.02);
          shutterR.castShadow = true;
          winGroup.add(shutterR);
        }
      } else {
        // Arched Dormer Window (matching the arched dormer over the porch in Photo 1)
        const archGroup = new THREE.Group();
        const baseBox = new THREE.Mesh(
          new THREE.BoxGeometry(width, height * 0.7, frameDepth),
          whiteTrimMat
        );
        baseBox.position.y = -height * 0.15;
        archGroup.add(baseBox);

        const topCylinder = new THREE.Mesh(
          new THREE.CylinderGeometry(width / 2, width / 2, frameDepth, 24, 1, false, 0, Math.PI),
          whiteTrimMat
        );
        topCylinder.rotation.z = Math.PI / 2;
        topCylinder.rotation.x = Math.PI / 2;
        topCylinder.position.y = height * 0.2;
        archGroup.add(topCylinder);

        const glassArch = new THREE.Mesh(
          new THREE.CircleGeometry(width / 2 - 0.06, 24, 0, Math.PI),
          glassMat
        );
        glassArch.position.set(0, height * 0.2, frameDepth * 0.25);
        archGroup.add(glassArch);

        winGroup.add(archGroup);
      }

      return winGroup;
    };

    // --- A. FOUNDATION & MAIN CORE STRUCTURE ---
    // Ground Floor: Brick Base (x: -7 to 7, y: 0 to 3.2, z: -5 to 2)
    const lowerMainGeo = new THREE.BoxGeometry(14, 3.2, 7);
    const lowerMainMesh = new THREE.Mesh(lowerMainGeo, brickMat);
    lowerMainMesh.position.set(0, 1.6, -1.5);
    lowerMainMesh.castShadow = true;
    lowerMainMesh.receiveShadow = true;
    houseGroup.add(lowerMainMesh);

    // Second Floor: Horizontal Siding (x: -7 to 7, y: 3.2 to 6.4, z: -5 to 2)
    const upperMainGeo = new THREE.BoxGeometry(14, 3.2, 7);
    const upperMainMesh = new THREE.Mesh(upperMainGeo, sidingMat);
    upperMainMesh.position.set(0, 4.8, -1.5);
    upperMainMesh.castShadow = true;
    upperMainMesh.receiveShadow = true;
    houseGroup.add(upperMainMesh);

    // Horizontal Band Trim between 1st & 2nd Floors
    const floorBand = new THREE.Mesh(
      new THREE.BoxGeometry(14.2, 0.14, 7.2),
      whiteTrimMat
    );
    floorBand.position.set(0, 3.2, -1.5);
    houseGroup.add(floorBand);

    // --- B. LEFT PROJECTING GABLE / GARAGE WING ---
    // Extends forward from z = 2.0 to z = 6.2 (x: -6.8 to -2.0)
    // 1st Floor Brick Wing (Garage)
    const garageWidth = 4.8;
    const garageDepth = 4.4;
    const garageHeight = 3.2;
    const garageMesh = new THREE.Mesh(
      new THREE.BoxGeometry(garageWidth, garageHeight, garageDepth),
      brickMat
    );
    garageMesh.position.set(-4.4, 1.6, 4.0);
    garageMesh.castShadow = true;
    garageMesh.receiveShadow = true;
    houseGroup.add(garageMesh);

    // 2nd Floor Above Garage (Cream Siding)
    const upperGarageMesh = new THREE.Mesh(
      new THREE.BoxGeometry(garageWidth, 3.2, garageDepth),
      sidingMat
    );
    upperGarageMesh.position.set(-4.4, 4.8, 4.0);
    upperGarageMesh.castShadow = true;
    upperGarageMesh.receiveShadow = true;
    houseGroup.add(upperGarageMesh);

    // Band trim on garage projection
    const garageBand = new THREE.Mesh(
      new THREE.BoxGeometry(garageWidth + 0.15, 0.14, garageDepth + 0.15),
      whiteTrimMat
    );
    garageBand.position.set(-4.4, 3.2, 4.0);
    houseGroup.add(garageBand);

    // Garage Gable Triangular Peak (y: 6.4 to 8.6)
    const gableShape = new THREE.Shape();
    gableShape.moveTo(-garageWidth / 2, 0);
    gableShape.lineTo(garageWidth / 2, 0);
    gableShape.lineTo(0, 2.2);
    gableShape.closePath();

    const gableExtrudeSettings = { depth: 0.15, bevelEnabled: false };
    const gableGeom = new THREE.ExtrudeGeometry(gableShape, gableExtrudeSettings);
    const gableFront = new THREE.Mesh(gableGeom, sidingMat);
    gableFront.position.set(-4.4, 6.4, 6.2);
    gableFront.castShadow = true;
    houseGroup.add(gableFront);

    // White bargeboard / fascia trim for the garage gable
    const leftFascia = new THREE.Mesh(
      new THREE.BoxGeometry(3.3, 0.18, 0.22),
      whiteTrimMat
    );
    leftFascia.position.set(-5.6, 7.5, 6.28);
    leftFascia.rotation.z = Math.atan2(2.2, garageWidth / 2);
    houseGroup.add(leftFascia);

    const rightFascia = new THREE.Mesh(
      new THREE.BoxGeometry(3.3, 0.18, 0.22),
      whiteTrimMat
    );
    rightFascia.position.set(-3.2, 7.5, 6.28);
    rightFascia.rotation.z = -Math.atan2(2.2, garageWidth / 2);
    houseGroup.add(rightFascia);

    // Decorative Attic Louver Vent in Gable Peak
    const atticVent = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.08, 16),
      whiteTrimMat
    );
    atticVent.rotation.x = Math.PI / 2;
    atticVent.position.set(-4.4, 7.6, 6.32);
    houseGroup.add(atticVent);

    // Garage Door (Double Carriage Door with upper windows)
    const garageDoor = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 2.35, 0.08),
      whiteTrimMat
    );
    garageDoor.position.set(-4.4, 1.25, 6.24);
    garageDoor.castShadow = true;
    houseGroup.add(garageDoor);

    // Carriage Door Glass Row
    for (let c = 0; c < 4; c++) {
      const gPane = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.35), glassMat);
      gPane.position.set(-4.4 - 1.2 + c * 0.8, 2.05, 6.29);
      houseGroup.add(gPane);
    }

    // Garage Overhead Coach Lantern
    const coachLantern = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.08, 0.35, 8),
      darkTrimMat
    );
    coachLantern.position.set(-4.4, 2.8, 6.4);
    houseGroup.add(coachLantern);

    const coachLight = new THREE.PointLight(0xffbe6b, 0.8, 6);
    coachLight.position.set(-4.4, 2.8, 6.5);
    houseGroup.add(coachLight);
    porchLightsRef.current.push(coachLight);

    // Left Wing 2nd Floor Windows (2 double hung with shutters matching Photo 1)
    const upperGWin1 = createWindow(1.0, 1.5, true);
    upperGWin1.position.set(-5.3, 4.8, 6.22);
    houseGroup.add(upperGWin1);

    const upperGWin2 = createWindow(1.0, 1.5, true);
    upperGWin2.position.set(-3.5, 4.8, 6.22);
    houseGroup.add(upperGWin2);

    // --- C. CENTER 2-STORY FACETED OCTAGONAL BAY TURRET ---
    // Prominent architectural signature in the center of the house
    const turretRadius = 1.9;
    const turretHeight = 6.4;
    const turretGeo = new THREE.CylinderGeometry(
      turretRadius,
      turretRadius,
      turretHeight,
      8,
      1,
      false,
      -Math.PI / 8,
      Math.PI
    );
    const turretMesh = new THREE.Mesh(turretGeo, sidingMat);
    turretMesh.position.set(-0.6, 3.2, 2.4);
    turretMesh.castShadow = true;
    turretMesh.receiveShadow = true;
    houseGroup.add(turretMesh);

    // Lower Turret Brick Base (1st floor brick apron)
    const turretBrickGeo = new THREE.CylinderGeometry(
      turretRadius + 0.02,
      turretRadius + 0.02,
      3.2,
      8,
      1,
      false,
      -Math.PI / 8,
      Math.PI
    );
    const turretBrickMesh = new THREE.Mesh(turretBrickGeo, brickMat);
    turretBrickMesh.position.set(-0.6, 1.6, 2.4);
    turretBrickMesh.castShadow = true;
    houseGroup.add(turretBrickMesh);

    // Turret Windows (3 on 1st floor, 3 on 2nd floor at 0 deg, +45 deg, -45 deg)
    const angles = [-Math.PI / 4, 0, Math.PI / 4];
    angles.forEach((ang) => {
      // 1st floor bay window
      const w1 = createWindow(0.85, 1.55);
      const r = turretRadius + 0.05;
      w1.position.set(-0.6 + Math.sin(ang) * r, 1.65, 2.4 + Math.cos(ang) * r);
      w1.rotation.y = ang;
      houseGroup.add(w1);

      // 2nd floor bay window
      const w2 = createWindow(0.85, 1.55);
      w2.position.set(-0.6 + Math.sin(ang) * r, 4.85, 2.4 + Math.cos(ang) * r);
      w2.rotation.y = ang;
      houseGroup.add(w2);
    });

    // Turret Octagonal Faceted Roof Cone
    const turretRoofGeo = new THREE.ConeGeometry(turretRadius + 0.4, 2.4, 8);
    const turretRoofMesh = new THREE.Mesh(turretRoofGeo, roofMat);
    turretRoofMesh.position.set(-0.6, 7.6, 2.4);
    turretRoofMesh.castShadow = true;
    houseGroup.add(turretRoofMesh);

    // Copper Finial at top of Turret
    const finial = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.08, 0.6, 8),
      whiteTrimMat
    );
    finial.position.set(-0.6, 8.9, 2.4);
    houseGroup.add(finial);

    // --- D. COVERED FRONT PORCH (Right Side, matching photo 1) ---
    const porchWidth = 5.2;
    const porchDepth = 2.4;
    const porchX = 3.8;
    const porchZ = 3.2;

    // Raised Porch Foundation Slab
    const porchFloor = new THREE.Mesh(
      new THREE.BoxGeometry(porchWidth, 0.4, porchDepth),
      concreteMat
    );
    porchFloor.position.set(porchX, 0.2, porchZ);
    porchFloor.castShadow = true;
    porchFloor.receiveShadow = true;
    houseGroup.add(porchFloor);

    // Front Entrance Steps (2 concrete steps)
    const step1 = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.18, 0.6),
      concreteMat
    );
    step1.position.set(porchX, 0.1, porchZ + porchDepth / 2 + 0.3);
    houseGroup.add(step1);

    // Front Entry Door (Dark rich wood door with sidelight window)
    const frontDoor = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 2.25, 0.08),
      darkTrimMat
    );
    frontDoor.position.set(3.4, 1.5, 2.02);
    frontDoor.castShadow = true;
    houseGroup.add(frontDoor);

    // Door Brass Knob
    const doorknob = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xdfb76c, metalness: 0.8, roughness: 0.2 })
    );
    doorknob.position.set(3.05, 1.45, 2.08);
    houseGroup.add(doorknob);

    // Sidelight window beside front door
    const sidelight = createWindow(0.45, 2.1);
    sidelight.position.set(4.2, 1.5, 2.02);
    houseGroup.add(sidelight);

    // Classical White Architectural Porch Columns (3 columns)
    const columnXCoords = [porchX - porchWidth / 2 + 0.3, porchX + 0.2, porchX + porchWidth / 2 - 0.3];
    columnXCoords.forEach((cx) => {
      const colGroup = new THREE.Group();
      colGroup.position.set(cx, 0.4, porchZ + porchDepth / 2 - 0.2);

      // Base plinth
      const colBase = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.15, 0.26), whiteTrimMat);
      colBase.position.y = 0.075;
      colGroup.add(colBase);

      // Shaft
      const colShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.4, 16), whiteTrimMat);
      colShaft.position.y = 1.35;
      colShaft.castShadow = true;
      colGroup.add(colShaft);

      // Capital top
      const colCap = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.28), whiteTrimMat);
      colCap.position.y = 2.6;
      colGroup.add(colCap);

      houseGroup.add(colGroup);
    });

    // Porch White Railing / Balustrade
    const railingHeight = 0.85;
    // Right side railing section
    const railR = new THREE.Group();
    railR.position.set(porchX + porchWidth / 2 - 0.2, 0.4, porchZ);
    const topRailR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, porchDepth - 0.4), whiteTrimMat);
    topRailR.position.y = railingHeight;
    railR.add(topRailR);
    for (let b = -0.8; b <= 0.8; b += 0.2) {
      const baluster = new THREE.Mesh(new THREE.BoxGeometry(0.04, railingHeight, 0.04), whiteTrimMat);
      baluster.position.set(0, railingHeight / 2, b);
      railR.add(baluster);
    }
    houseGroup.add(railR);

    // Front left railing section (between left column and center steps)
    const railFL = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.08), whiteTrimMat);
    railFL.position.set(porchX - 1.5, 0.4 + railingHeight, porchZ + porchDepth / 2 - 0.2);
    houseGroup.add(railFL);
    for (let bx = -0.7; bx <= 0.7; bx += 0.2) {
      const bst = new THREE.Mesh(new THREE.BoxGeometry(0.04, railingHeight, 0.04), whiteTrimMat);
      bst.position.set(porchX - 1.5 + bx, 0.4 + railingHeight / 2, porchZ + porchDepth / 2 - 0.2);
      houseGroup.add(bst);
    }

    // Porch Roof (Sloped Hipped/Shed Roof)
    const porchRoof = new THREE.Mesh(
      new THREE.BoxGeometry(porchWidth + 0.4, 0.28, porchDepth + 0.6),
      roofMat
    );
    porchRoof.position.set(porchX, 3.25, porchZ + 0.1);
    porchRoof.rotation.x = 0.12;
    porchRoof.castShadow = true;
    houseGroup.add(porchRoof);

    // Hanging Warm Porch Lantern
    const porchLight = new THREE.PointLight(0xffbe6b, 1.2, 8);
    porchLight.position.set(porchX, 2.8, porchZ);
    houseGroup.add(porchLight);
    porchLightsRef.current.push(porchLight);

    // Eyebrow Arched Dormer above porch (Centered at x = 4.0, y = 5.5, z = 2.4)
    const dormerRoof = new THREE.Mesh(
      new THREE.CylinderGeometry(1.1, 1.1, 1.6, 16, 1, false, 0, Math.PI),
      roofMat
    );
    dormerRoof.rotation.z = Math.PI / 2;
    dormerRoof.rotation.y = Math.PI;
    dormerRoof.position.set(4.0, 5.6, 2.5);
    dormerRoof.castShadow = true;
    houseGroup.add(dormerRoof);

    const archedWin = createWindow(1.0, 1.1, false, true);
    archedWin.position.set(4.0, 5.2, 3.32);
    houseGroup.add(archedWin);

    // --- E. MAIN HIP & GABLE ROOF COMPLEX ---
    // Ridge extends along main house volume
    const mainRoofShape = new THREE.Shape();
    mainRoofShape.moveTo(-7.4, 0);
    mainRoofShape.lineTo(7.4, 0);
    mainRoofShape.lineTo(4.5, 3.2);
    mainRoofShape.lineTo(-4.5, 3.2);
    mainRoofShape.closePath();

    const mainRoofGeo = new THREE.ExtrudeGeometry(mainRoofShape, {
      depth: 7.8,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.3,
      bevelThickness: 0.2,
    });
    const mainRoofMesh = new THREE.Mesh(mainRoofGeo, roofMat);
    mainRoofMesh.position.set(0, 6.4, -5.2);
    mainRoofMesh.castShadow = true;
    mainRoofMesh.receiveShadow = true;
    houseGroup.add(mainRoofMesh);

    // White Roof Fascia Trim / Gutters along main eaves
    const frontEaveTrim = new THREE.Mesh(
      new THREE.BoxGeometry(14.8, 0.14, 0.18),
      whiteTrimMat
    );
    frontEaveTrim.position.set(0, 6.35, 2.2);
    houseGroup.add(frontEaveTrim);

    // --- F. BRICK CHIMNEY ---
    // Located behind the center turret, extending high through the roofline
    const chimney = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 5.2, 1.2),
      brickMat
    );
    chimney.position.set(0.4, 7.8, -1.2);
    chimney.castShadow = true;
    houseGroup.add(chimney);

    // Concrete Chimney Cap
    const chimneyCap = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.16, 1.4),
      concreteMat
    );
    chimneyCap.position.set(0.4, 10.45, -1.2);
    houseGroup.add(chimneyCap);

    // Dual Terracotta Flue Pots
    [-0.22, 0.22].forEach((offset) => {
      const flue = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 0.45, 12),
        new THREE.MeshStandardMaterial({ color: 0x9e4c2f, roughness: 0.8 })
      );
      flue.position.set(0.4 + offset, 10.7, -1.2);
      houseGroup.add(flue);
    });

    // --- G. REAR PATIO & BACKYARD ELEMENTS (Matching Photo 3) ---
    // Concrete / Stone Paver Patio Slab (x: -1 to 6.2, z: -5 to -10)
    const patioSlab = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 0.15, 5.0),
      concreteMat
    );
    patioSlab.position.set(2.6, 0.08, -7.5);
    patioSlab.receiveShadow = true;
    houseGroup.add(patioSlab);

    // Rear Sliding Glass Patio Door
    const slidingDoor = createWindow(2.2, 2.2);
    slidingDoor.position.set(2.2, 1.2, -5.02);
    slidingDoor.rotation.y = Math.PI;
    houseGroup.add(slidingDoor);

    // Rear 2nd floor windows
    const rearWin1 = createWindow(1.2, 1.4, true);
    rearWin1.position.set(-3.5, 4.8, -5.02);
    rearWin1.rotation.y = Math.PI;
    houseGroup.add(rearWin1);

    const rearWin2 = createWindow(1.2, 1.4, true);
    rearWin2.position.set(3.5, 4.8, -5.02);
    rearWin2.rotation.y = Math.PI;
    houseGroup.add(rearWin2);

    // Outdoor Patio Dining Table & Chairs
    const patioTable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 0.06, 16),
      new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.3, roughness: 0.5 })
    );
    patioTable.position.set(4.2, 0.8, -7.5);
    patioTable.castShadow = true;
    houseGroup.add(patioTable);

    const tablePole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 2.6, 8),
      whiteTrimMat
    );
    tablePole.position.set(4.2, 1.4, -7.5);
    houseGroup.add(tablePole);

    // Patio Umbrella (open conical canopy in cheerful cream/green)
    const umbrella = new THREE.Mesh(
      new THREE.ConeGeometry(1.6, 0.6, 12),
      new THREE.MeshStandardMaterial({ color: 0x2e6648, roughness: 0.7 })
    );
    umbrella.position.set(4.2, 2.5, -7.5);
    umbrella.castShadow = true;
    houseGroup.add(umbrella);

    // Barbecue Grill Cart with Cover (matching covered grill in Photo 3)
    const grillGroup = new THREE.Group();
    grillGroup.position.set(0.6, 0.15, -7.2);

    const grillBase = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.9, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x1f2326, roughness: 0.6 })
    );
    grillBase.position.y = 0.55;
    grillBase.castShadow = true;
    grillGroup.add(grillBase);

    const grillHood = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.8, 12, 1, false, 0, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x2d3238, metalness: 0.4, roughness: 0.4 })
    );
    grillHood.rotation.z = Math.PI / 2;
    grillHood.position.set(0, 1.15, 0);
    grillGroup.add(grillHood);
    houseGroup.add(grillGroup);

    // White Garden Arbor Trellis Gate (photo 3 architectural feature)
    const arborGroup = new THREE.Group();
    arborGroup.position.set(-1.2, 0.0, -8.2);

    // Left & Right Trellis Lattice Posts
    [-0.6, 0.6].forEach((ox) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.4, 0.12), whiteTrimMat);
      post.position.set(ox, 1.2, 0);
      post.castShadow = true;
      arborGroup.add(post);

      // Lattice panel
      const lattice = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.8, 0.6), whiteTrimMat);
      lattice.position.set(ox, 1.2, -0.3);
      arborGroup.add(lattice);
    });

    // Arched Top of the Garden Arbor
    const arborArch = new THREE.Mesh(
      new THREE.TorusGeometry(0.6, 0.06, 8, 20, Math.PI),
      whiteTrimMat
    );
    arborArch.position.set(0, 2.38, 0);
    arborGroup.add(arborArch);
    houseGroup.add(arborGroup);

    // --- H. WHITE VINYL PICKET PERIMETER FENCING ---
    // Surrounds side property and backyard garden (matching photos 2 and 3)
    const fenceGroup = new THREE.Group();

    const buildFenceSection = (length: number) => {
      const section = new THREE.Group();
      const picketCount = Math.floor(length / 0.18);
      // Rails
      const rail1 = new THREE.Mesh(new THREE.BoxGeometry(length, 0.05, 0.04), whiteTrimMat);
      rail1.position.y = 0.35;
      section.add(rail1);
      const rail2 = new THREE.Mesh(new THREE.BoxGeometry(length, 0.05, 0.04), whiteTrimMat);
      rail2.position.y = 0.95;
      section.add(rail2);

      // Pickets with pointed gothic tops
      for (let i = 0; i < picketCount; i++) {
        const px = -length / 2 + (i + 0.5) * (length / picketCount);
        const picket = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.1, 0.025), whiteTrimMat);
        picket.position.set(px, 0.6, 0);
        picket.castShadow = true;
        section.add(picket);
      }
      return section;
    };

    // Side Fence along corner lot (Photo 2)
    const sideFence = buildFenceSection(14.0);
    sideFence.position.set(9.2, 0.0, 1.0);
    sideFence.rotation.y = Math.PI / 2;
    fenceGroup.add(sideFence);

    // Backyard Return Fence (Photo 3)
    const backFence = buildFenceSection(12.0);
    backFence.position.set(3.2, 0.0, -11.5);
    fenceGroup.add(backFence);

    houseGroup.add(fenceGroup);

    // --- I. LANDSCAPING, DRIVEWAY, SIDEWALK, & TREES ---
    const landscapingGroup = new THREE.Group();
    landscapingGroupRef.current = landscapingGroup;
    scene.add(landscapingGroup);

    // Large Ground Lawn Parcel
    const groundGeo = new THREE.PlaneGeometry(60, 60, 8, 8);
    const groundMesh = new THREE.Mesh(groundGeo, grassMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    landscapingGroup.add(groundMesh);

    // Two-Car Driveway leading to garage (x: -6.6 to -2.2, z: 6.2 to 18.0)
    const driveway = new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 12.0),
      concreteMat
    );
    driveway.rotation.x = -Math.PI / 2;
    driveway.position.set(-4.4, 0.02, 12.2);
    driveway.receiveShadow = true;
    landscapingGroup.add(driveway);

    // Curved Concrete Front Walkway (connecting driveway to porch steps)
    const walkGeo = new THREE.PlaneGeometry(1.4, 6.5);
    const walkway = new THREE.Mesh(walkGeo, concreteMat);
    walkway.rotation.x = -Math.PI / 2;
    walkway.rotation.z = -0.55;
    walkway.position.set(-0.2, 0.03, 5.6);
    walkway.receiveShadow = true;
    landscapingGroup.add(walkway);

    // Public Sidewalk & Curb (Matching Corner Lot in Photo 2)
    const sidewalk = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 1.8),
      concreteMat
    );
    sidewalk.rotation.x = -Math.PI / 2;
    sidewalk.position.set(0, 0.04, 18.2);
    sidewalk.receiveShadow = true;
    landscapingGroup.add(sidewalk);

    // Foundation Mulch Beds (Dark shredded bark)
    const mulchBedFront = new THREE.Mesh(
      new THREE.PlaneGeometry(7.0, 1.8),
      mulchMat
    );
    mulchBedFront.rotation.x = -Math.PI / 2;
    mulchBedFront.position.set(3.6, 0.02, 4.8);
    landscapingGroup.add(mulchBedFront);

    // Manicured Foundation Shrubs & Boxwoods (Matching Photo 1 & 2)
    const createBush = (x: number, z: number, scale = 1.0) => {
      const bush = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.55 * scale, 2),
        foliageMat
      );
      bush.position.set(x, 0.45 * scale, z);
      bush.scale.set(1.1, 0.8, 1.0);
      bush.castShadow = true;
      return bush;
    };

    // Shrubs along front porch and bay window
    [1.8, 2.7, 3.8, 4.8, 5.8, 6.6].forEach((x, idx) => {
      landscapingGroup.add(createBush(x, 4.6, 0.85 + (idx % 3) * 0.15));
    });
    // Shrubs around bay turret base
    landscapingGroup.add(createBush(-2.2, 4.8, 1.0));
    landscapingGroup.add(createBush(-0.6, 4.9, 0.9));

    // Ornamental Front Lawn Specimen Tree (Photo 1 right yard)
    const treeGroup = new THREE.Group();
    treeGroup.position.set(7.5, 0, 8.5);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.28, 3.2, 8),
      trunkMat
    );
    trunk.position.y = 1.6;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Multi-layered lush canopy
    const canopy1 = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.8, 2),
      foliageMat
    );
    canopy1.position.set(0, 3.6, 0);
    canopy1.castShadow = true;
    treeGroup.add(canopy1);

    const canopy2 = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.4, 2),
      foliageMat
    );
    canopy2.position.set(0.6, 4.2, 0.4);
    canopy2.castShadow = true;
    treeGroup.add(canopy2);

    landscapingGroup.add(treeGroup);

    // --- J. ZONING ENVELOPE & SETBACK BOUNDARIES ---
    const zoningGroup = new THREE.Group();
    zoningGroupRef.current = zoningGroup;

    // Building Height Limit Envelope (35ft = 10.67m)
    const envelopeGeo = new THREE.BoxGeometry(17, 10.8, 14);
    const envelopeWire = new THREE.WireframeGeometry(envelopeGeo);
    const envelopeLine = new THREE.LineSegments(
      envelopeWire,
      new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 })
    );
    envelopeLine.position.set(0, 5.4, 0.5);
    zoningGroup.add(envelopeLine);

    // Front Setback Boundary Line (25ft = 7.62m from sidewalk)
    const setbackLineFrontGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-18, 0.1, 7.6),
      new THREE.Vector3(18, 0.1, 7.6),
    ]);
    const setbackFrontLine = new THREE.Line(
      setbackLineFrontGeo,
      new THREE.LineDashedMaterial({ color: 0xf59e0b, dashSize: 0.8, gapSize: 0.4 })
    );
    setbackFrontLine.computeLineDistances();
    zoningGroup.add(setbackFrontLine);

    // Side Setback Boundary Line (10ft = 3.05m)
    const setbackLineSideGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(9.5, 0.1, -15),
      new THREE.Vector3(9.5, 0.1, 15),
    ]);
    const setbackSideLine = new THREE.Line(
      setbackLineSideGeo,
      new THREE.LineDashedMaterial({ color: 0xec4899, dashSize: 0.8, gapSize: 0.4 })
    );
    setbackSideLine.computeLineDistances();
    zoningGroup.add(setbackSideLine);

    scene.add(zoningGroup);

    // 9. Interior Lights (for Night Mode)
    const intLight1 = new THREE.PointLight(0xffdfa4, 0, 12);
    intLight1.position.set(0, 2.0, 0);
    scene.add(intLight1);
    interiorLightsRef.current.push(intLight1);

    const intLight2 = new THREE.PointLight(0xffdfa4, 0, 12);
    intLight2.position.set(0, 5.0, 0);
    scene.add(intLight2);
    interiorLightsRef.current.push(intLight2);

    // 10. Animation / Render Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 11. Responsive Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Lighting Mode
  useEffect(() => {
    const scene = sceneRef.current;
    const sun = sunLightRef.current;
    const hemi = hemiLightRef.current;
    if (!scene || !sun || !hemi) return;

    if (lightingMode === "day") {
      scene.background = new THREE.Color(0x9fc3e8);
      scene.fog = new THREE.FogExp2(0xb2d6f5, 0.009);
      sun.position.set(22, 35, 20);
      sun.color.setHex(0xfffaed);
      sun.intensity = 2.2;
      hemi.color.setHex(0xffffff);
      hemi.groundColor.setHex(0x444444);
      hemi.intensity = 1.1;

      // Disable interior glows
      interiorLightsRef.current.forEach((l) => (l.intensity = 0));
      porchLightsRef.current.forEach((l) => (l.intensity = 0.2));
      scene.traverse((obj) => {
        if (obj.name === "interiorGlow") obj.visible = false;
      });
    } else if (lightingMode === "sunset") {
      scene.background = new THREE.Color(0xdd8c6b);
      scene.fog = new THREE.FogExp2(0xd67a54, 0.012);
      sun.position.set(35, 10, 22);
      sun.color.setHex(0xff8d47);
      sun.intensity = 2.8;
      hemi.color.setHex(0xffc299);
      hemi.groundColor.setHex(0x5a3120);
      hemi.intensity = 0.9;

      interiorLightsRef.current.forEach((l) => (l.intensity = 1.2));
      porchLightsRef.current.forEach((l) => (l.intensity = 1.5));
      scene.traverse((obj) => {
        if (obj.name === "interiorGlow") obj.visible = true;
      });
    } else if (lightingMode === "night") {
      scene.background = new THREE.Color(0x0a111c);
      scene.fog = new THREE.FogExp2(0x0a111c, 0.015);
      sun.position.set(-15, 25, -20);
      sun.color.setHex(0x7c98c7);
      sun.intensity = 0.35;
      hemi.color.setHex(0x22334d);
      hemi.groundColor.setHex(0x111620);
      hemi.intensity = 0.4;

      interiorLightsRef.current.forEach((l) => (l.intensity = 3.5));
      porchLightsRef.current.forEach((l) => (l.intensity = 2.5));
      scene.traverse((obj) => {
        if (obj.name === "interiorGlow") obj.visible = true;
      });
    }
  }, [lightingMode]);

  // Update Auto-Rotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
      controlsRef.current.autoRotateSpeed = 1.5;
    }
  }, [autoRotate]);

  // Update Wireframe Mode
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const supportsWireframe = (
      material: THREE.Material,
    ): material is THREE.Material & { wireframe: boolean } =>
      "wireframe" in material &&
      typeof (material as { wireframe?: unknown }).wireframe === "boolean";
    const updateWireframe = (material: THREE.Material) => {
      if (supportsWireframe(material)) {
        material.wireframe = wireframeMode;
      }
    };
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(updateWireframe);
        } else if (mesh.material) {
          updateWireframe(mesh.material);
        }
      }
    });
  }, [wireframeMode]);

  // Update Zoning Envelope Visibility
  useEffect(() => {
    if (zoningGroupRef.current) {
      zoningGroupRef.current.visible = showZoningEnvelope;
    }
  }, [showZoningEnvelope]);

  // Update Landscaping Visibility
  useEffect(() => {
    if (landscapingGroupRef.current) {
      landscapingGroupRef.current.visible = showLandscaping;
    }
  }, [showLandscaping]);

  // Camera Preset Transitions
  const setCameraPreset = (preset: "front" | "street" | "patio" | "aerial" | "porch") => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    setActiveCameraView(preset);

    switch (preset) {
      case "front":
        camera.position.set(0, 4.2, 25);
        controls.target.set(0, 3.8, 0);
        break;
      case "street":
        // Matching Photo 2 side corner view
        camera.position.set(22, 5.5, 20);
        controls.target.set(0, 3.5, 0);
        break;
      case "patio":
        // Matching Photo 3 backyard patio view
        camera.position.set(4.0, 3.8, -18);
        controls.target.set(2.5, 2.5, -5.0);
        break;
      case "aerial":
        // Overhead zoning & parcel inspection
        camera.position.set(24, 32, 24);
        controls.target.set(0, 2.0, 0);
        break;
      case "porch":
        // Close-up front porch view
        camera.position.set(4.2, 2.2, 9.5);
        controls.target.set(3.8, 2.2, 3.0);
        break;
    }
    controls.update();
  };

  // Export 3D Model as GLB
  const handleExportGLB = () => {
    const scene = sceneRef.current;
    if (!scene) return;

    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (gltf) => {
        const output = gltf as ArrayBuffer;
        const blob = new Blob([output], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `residential-model-${parcelId}.glb`;
        link.click();
        URL.revokeObjectURL(url);
      },
      (error) => {
        console.error("GLTF Export Error:", error);
      },
      { binary: true }
    );
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!mountRef.current) return;
    if (!document.fullscreenElement) {
      void mountRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      void document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative flex flex-col w-full h-full min-h-[720px] rounded-xl overflow-hidden border border-border bg-card shadow-2xl">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing">
        {/* Loading Overlay */}
        {!isLoaded && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border bg-card/80 shadow-lg text-center max-w-sm">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <div className="text-lg font-bold text-foreground">Loading 3D House Model</div>
              <div className="text-xs text-muted-foreground">
                Streaming Poly Haven PBR 1K normal, roughness, and diffuse maps...
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden mt-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <span className="text-xs font-mono text-muted-foreground">{loadingProgress}%</span>
            </div>
          </div>
        )}

        {/* Top Header Overlay with Address & District Metadata */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 p-3 rounded-lg bg-background/85 backdrop-blur-md border border-border shadow-md pointer-events-auto max-w-md">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center p-1 rounded bg-primary/10 text-primary">
              <Box className="w-4 h-4" />
            </span>
            <div className="font-semibold text-sm text-foreground truncate">{address}</div>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Parcel: <code className="font-mono text-foreground">{parcelId}</code></span>
            <span>•</span>
            <span className="text-primary font-medium">{zoningDistrict}</span>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 pointer-events-auto">
          <Button
            size="sm"
            variant="outline"
            className="bg-background/85 backdrop-blur-md text-xs shadow-sm hover:bg-background"
            onClick={handleExportGLB}
            title="Download GLB 3D model for Blender, Cesium, or ArcGIS Pro"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-primary" />
            Export .GLB
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-background/85 backdrop-blur-md text-xs shadow-sm hover:bg-background"
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
        </div>

        {/* Bottom Floating Control Bar */}
        <div className="absolute bottom-4 inset-x-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          {/* Left Controls: Camera Presets */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-background/90 backdrop-blur-md border border-border shadow-lg pointer-events-auto">
            <div className="text-[11px] font-semibold uppercase text-muted-foreground px-2 flex items-center gap-1">
              <Camera className="w-3 h-3 text-primary" />
              Camera
            </div>
            <button
              onClick={() => setCameraPreset("front")}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                activeCameraView === "front"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Front
            </button>
            <button
              onClick={() => setCameraPreset("street")}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                activeCameraView === "street"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Street Corner
            </button>
            <button
              onClick={() => setCameraPreset("patio")}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                activeCameraView === "patio"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Rear Patio
            </button>
            <button
              onClick={() => setCameraPreset("porch")}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                activeCameraView === "porch"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Porch
            </button>
            <button
              onClick={() => setCameraPreset("aerial")}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                activeCameraView === "aerial"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Aerial
            </button>
          </div>

          {/* Right Controls: Lighting, Overlays & Turntable */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Lighting Mode Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-background/90 backdrop-blur-md border border-border shadow-lg">
              <button
                onClick={() => setLightingMode("day")}
                className={`p-1.5 rounded transition-colors ${
                  lightingMode === "day"
                    ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Midday Sun (6000K)"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLightingMode("sunset")}
                className={`p-1.5 rounded transition-colors ${
                  lightingMode === "sunset"
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Golden Hour Sunset"
              >
                <Sunset className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLightingMode("night")}
                className={`p-1.5 rounded transition-colors ${
                  lightingMode === "night"
                    ? "bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Twilight / Night with Interior Window Glow"
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>

            {/* Feature Toggles */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-background/90 backdrop-blur-md border border-border shadow-lg">
              <button
                onClick={() => setShowZoningEnvelope(!showZoningEnvelope)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  showZoningEnvelope
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Toggle Zoning Setback Lines & 35ft Height Envelope"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Zoning Envelope</span>
              </button>

              <button
                onClick={() => setShowLandscaping(!showLandscaping)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  showLandscaping
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Toggle Landscaping, Trees, Driveway & Picket Fence"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Site</span>
              </button>

              <button
                onClick={() => setWireframeMode(!wireframeMode)}
                className={`p-1.5 rounded transition-colors ${
                  wireframeMode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                title="Toggle Architectural Wireframe Mesh"
              >
                <Compass className="w-4 h-4" />
              </button>

              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`p-1.5 rounded transition-colors ${
                  autoRotate ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                title="Toggle Auto-Rotate Turntable"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Legend / Key Overlay */}
        <div className="absolute bottom-16 left-4 z-10 hidden sm:flex flex-col gap-1 p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border text-[11px] text-muted-foreground pointer-events-none">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <Info className="w-3 h-3 text-primary" />
            <span>Interactive 3D Navigation</span>
          </div>
          <div>• Left Click + Drag: Orbit / Rotate</div>
          <div>• Right Click + Drag: Pan Camera</div>
          <div>• Scroll: Zoom In / Out</div>
          {showZoningEnvelope && (
            <div className="mt-1 pt-1 border-t border-border flex flex-col gap-0.5">
              <span className="text-amber-500 font-medium">--- 25&apos; Front Setback</span>
              <span className="text-pink-500 font-medium">--- 10&apos; Side Setback</span>
              <span className="text-sky-400 font-medium">▢ 35&apos; Max Height Envelope</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
