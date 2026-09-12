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
  Waves,
  Home,
  MapPin,
  Mountain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  HouseDesignSpec,
  LightingMode,
  StudioSceneMode,
  SubdivisionConfig,
} from "@/lib/subdivision/types";
import { buildHouseStudioModel, type StudioTextures } from "./HouseStudioModel";
import { buildSubdivisionMasterPlan } from "./SubdivisionMasterPlan";

export interface HouseViewerProps {
  parcelId?: string;
  address?: string;
  zoningDistrict?: string;
  onClose?: () => void;
  subdivisionConfig?: SubdivisionConfig;
  houseSpec?: HouseDesignSpec;
  onHouseSpecChange?: (spec: HouseDesignSpec) => void;
  sceneMode?: StudioSceneMode;
  onSceneModeChange?: (mode: StudioSceneMode) => void;
  onSelectLot?: (lotNumber: number) => void;
}

function disposeHierarchy(obj: THREE.Object3D) {
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh || (child as THREE.Line).isLine) {
      const m = child as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      if (m.material) {
        if (Array.isArray(m.material)) {
          m.material.forEach((mat) => mat.dispose());
        } else {
          m.material.dispose();
        }
      }
    }
  });
}

export const DEFAULT_HOUSE_SPEC: HouseDesignSpec = {
  stories: 2,
  style: "craftsman",
  facadeMaterial: "brick",
  roofMaterial: "shingle",
  roofColor: "#334155",
  trimColor: "#f8fafc",
  shutterColor: "#1e293b",
  garageBays: 2,
  hasPorch: true,
  hasPatio: true,
  hasBalcony: true,
  hasBayTurret: true,
  footprintWidthFt: 46,
  footprintDepthFt: 36,
  sqftPerStory: 1450,
  totalSqft: 2900,
  heightFt: 31.2,
  viewLevel: "exterior",
  flooring: "oak",
  wallColor: "greige",
  furnished: true,
};

export function HouseModelViewer({
  parcelId = "67-000-04-0112.00-00000",
  address = "482 Country Club Road, York PA 17403",
  zoningDistrict = "R-1 Low-Density Residential (Spring Garden Twp)",
  subdivisionConfig,
  houseSpec = DEFAULT_HOUSE_SPEC,
  onHouseSpecChange,
  sceneMode = "subdivision",
  onSceneModeChange,
  onSelectLot,
}: HouseViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [internalMode, setInternalMode] = useState<StudioSceneMode>(sceneMode);
  const [lightingMode, setLightingMode] = useState<LightingMode>("day");
  const [showZoningEnvelope, setShowZoningEnvelope] = useState(true);
  const [showContours, setShowContours] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [showLandscaping, setShowLandscaping] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeCameraView, setActiveCameraView] = useState("aerial");

  const currentMode = onSceneModeChange ? sceneMode : internalMode;
  const setMode = (m: StudioSceneMode) => {
    setInternalMode(m);
    onSceneModeChange?.(m);
  };

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const zoningGroupRef = useRef<THREE.Group | null>(null);
  const contourGroupRef = useRef<THREE.Group | null>(null);
  const contentRootRef = useRef<THREE.Group | null>(null);
  const animUpdateRef = useRef<((time: number) => void) | null>(null);
  const texturesRef = useRef<StudioTextures | null>(null);

  // Initialize Scene, Camera, Renderer, Textures
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x9fc3e8);
    scene.fog = new THREE.FogExp2(0xb2d6f5, 0.006);

    const contentRoot = new THREE.Group();
    contentRoot.name = "DynamicContentRoot";
    scene.add(contentRoot);
    contentRootRef.current = contentRoot;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 55, 95);
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
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 2, 0);
    controls.minDistance = 4;
    controls.maxDistance = 260;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;

    // 5. Lighting Setup
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.1);
    hemiLight.position.set(0, 80, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.3);
    sunLight.position.set(45, 75, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 1.0;
    sunLight.shadow.camera.far = 300;
    const d = 90;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0003;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // 6. Texture Loading with error handling & safety timeout
    const textureLoader = new THREE.TextureLoader();
    let loadedCount = 0;
    const totalTextures = 15;
    const advanceLoad = () => {
      loadedCount++;
      setLoadingProgress(Math.min(100, Math.round((loadedCount / totalTextures) * 100)));
      if (loadedCount >= totalTextures) {
        setIsLoaded(true);
      }
    };

    const safetyTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 2500);

    const loadPBR = (name: string, repX: number, repY: number) => {
      const diff = textureLoader.load(`/textures/house/${name}_diff.jpg`, advanceLoad, undefined, advanceLoad);
      const nor = textureLoader.load(`/textures/house/${name}_nor.jpg`, advanceLoad, undefined, advanceLoad);
      const rough = textureLoader.load(`/textures/house/${name}_rough.jpg`, advanceLoad, undefined, advanceLoad);

      [diff, nor, rough].forEach((t) => {
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(repX, repY);
      });
      diff.colorSpace = THREE.SRGBColorSpace;
      return { diff, nor, rough };
    };

    const loadedTextures: StudioTextures = {
      brick: loadPBR("brick", 3, 2),
      siding: loadPBR("siding", 4, 6),
      roof: loadPBR("roof", 5, 5),
      grass: loadPBR("grass", 14, 14),
      concrete: loadPBR("concrete", 4, 4),
    };
    texturesRef.current = loadedTextures;

    // 7. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      controls.update();
      if (animUpdateRef.current) {
        animUpdateRef.current(elapsedTime);
      }
      renderer.render(scene, camera);
    };
    animate();

    // 8. Raycasting on lot click for subdivision interactivity
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (e: MouseEvent) => {
      const dom = renderer.domElement;
      const rect = dom.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      if (contentRootRef.current) {
        const hits = raycaster.intersectObjects(contentRootRef.current.children, true);
        for (const hit of hits) {
          let curr: THREE.Object3D | null = hit.object;
          while (curr && curr !== contentRootRef.current) {
            if (curr.userData && typeof curr.userData.lotNumber === "number") {
              onSelectLot?.(curr.userData.lotNumber);
              return;
            }
            curr = curr.parent;
          }
        }
      }
    };
    renderer.domElement.addEventListener("click", handleCanvasClick);

    // 9. Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(safetyTimer);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("click", handleCanvasClick);
      controls.dispose();
      renderer.dispose();
      if (contentRootRef.current) {
        disposeHierarchy(contentRootRef.current);
      }
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Rebuild 3D Model when Scene Mode, Subdivision Config, or House Spec changes
  useEffect(() => {
    const contentRoot = contentRootRef.current;
    if (!contentRoot) return;

    // Clean existing children
    while (contentRoot.children.length > 0) {
      const child = contentRoot.children[0];
      contentRoot.remove(child);
    }
    animUpdateRef.current = null;

    const textures = texturesRef.current || undefined;

    if (currentMode === "subdivision") {
      // Build Full Subdivision Master Plan
      const subConfig: SubdivisionConfig = subdivisionConfig ?? {
        id: "default-sub",
        name: "Spring Garden Reserve",
        parcelId,
        address,
        municipality: "Spring Garden Township",
        county: "York",
        grossAcres: 16.4,
        zoningCode: "R-1",
        zoningName: zoningDistrict,
        maxZoningHeight: 35,
        maxLotCoverage: 35,
        setbacks: { front: 25, side: 10, rear: 25 },
        totalLots: 18,
        pondRadiusFt: 95,
        pondAcreage: 0.85,
        openSpaceAcreage: 3.2,
        roadLengthLinearFt: 1450,
        slopePct: 4,
        floodZone: "X",
        karstRisk: "Moderate",
        utilities: {
          water: "York Water Co.",
          sewer: "Public Gravity",
          electric: "Met-Ed Underground",
          gas: "Columbia Gas",
        },
      };

      const subScene = buildSubdivisionMasterPlan(subConfig, textures, onSelectLot);
      contentRoot.add(subScene.group);
      animUpdateRef.current = subScene.updateAnimation;
      contourGroupRef.current = subScene.contourGroup;
      subScene.contourGroup.visible = showContours;

      // Adjust camera for subdivision overview
      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.set(0, 65, 105);
        controlsRef.current.target.set(0, 2, 0);
        controlsRef.current.update();
      }
    } else {
      // Build 3D House Design Studio Model
      const houseModel = buildHouseStudioModel(houseSpec, textures);
      contentRoot.add(houseModel);

      // Add Zoning Height Limit & Setback Wireframe Envelope
      const zoningGroup = new THREE.Group();
      zoningGroup.name = "ZoningEnvelope";
      zoningGroupRef.current = zoningGroup;

      const maxH = subdivisionConfig?.maxZoningHeight || 35; // ft
      const maxHMeters = maxH * 0.3048; // convert ft to meters
      const isHeightViolated = houseSpec.heightFt > maxH;

      const envWidth = 18.0;
      const envDepth = 15.0;
      const envGeo = new THREE.BoxGeometry(envWidth, maxHMeters, envDepth);
      const envWire = new THREE.WireframeGeometry(envGeo);
      const envLine = new THREE.LineSegments(
        envWire,
        new THREE.LineBasicMaterial({
          color: isHeightViolated ? 0xef4444 : 0x38bdf8,
          transparent: true,
          opacity: 0.65,
        })
      );
      envLine.position.set(0, maxHMeters / 2, 0);
      zoningGroup.add(envLine);

      // Front Setback Line
      const frontSetbackMeters = (subdivisionConfig?.setbacks.front || 25) * 0.3048;
      const frontLineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-14, 0.08, envDepth / 2 - frontSetbackMeters),
        new THREE.Vector3(14, 0.08, envDepth / 2 - frontSetbackMeters),
      ]);
      const frontLine = new THREE.Line(
        frontLineGeo,
        new THREE.LineDashedMaterial({ color: 0xf59e0b, dashSize: 0.8, gapSize: 0.4 })
      );
      frontLine.computeLineDistances();
      zoningGroup.add(frontLine);

      contentRoot.add(zoningGroup);

      // Adjust camera for house studio
      if (cameraRef.current && controlsRef.current) {
        if (houseSpec.viewLevel === "dollhouse") {
          cameraRef.current.position.set(16, 22, 22);
          controlsRef.current.target.set(0, 4, 0);
        } else if (houseSpec.viewLevel === "story1") {
          cameraRef.current.position.set(0, 1.8, 4.5);
          controlsRef.current.target.set(0, 1.6, -1.0);
        } else if (houseSpec.viewLevel === "story2") {
          cameraRef.current.position.set(-2, 4.8, 3.5);
          controlsRef.current.target.set(-2, 4.6, -1.0);
        } else {
          cameraRef.current.position.set(0, 5.5, 26);
          controlsRef.current.target.set(0, 3.8, 0);
        }
        controlsRef.current.update();
      }
    }
  }, [currentMode, subdivisionConfig, houseSpec, parcelId, address, zoningDistrict]);

  // Lighting Mode Updates
  useEffect(() => {
    const scene = sceneRef.current;
    const sun = sunLightRef.current;
    const hemi = hemiLightRef.current;
    if (!scene || !sun || !hemi) return;

    if (lightingMode === "day") {
      scene.background = new THREE.Color(0x9fc3e8);
      scene.fog = new THREE.FogExp2(0xb2d6f5, 0.006);
      sun.position.set(45, 75, 40);
      sun.color.setHex(0xfffaed);
      sun.intensity = 2.3;
      hemi.color.setHex(0xffffff);
      hemi.groundColor.setHex(0x444444);
      hemi.intensity = 1.1;
      scene.traverse((obj) => {
        if (obj.name === "interiorGlow") obj.visible = false;
      });
    } else if (lightingMode === "sunset") {
      scene.background = new THREE.Color(0xdd8c6b);
      scene.fog = new THREE.FogExp2(0xd67a54, 0.009);
      sun.position.set(55, 22, 35);
      sun.color.setHex(0xff8d47);
      sun.intensity = 2.8;
      hemi.color.setHex(0xffc299);
      hemi.groundColor.setHex(0x5a3120);
      hemi.intensity = 0.9;
      scene.traverse((obj) => {
        if (obj.name === "interiorGlow") obj.visible = true;
      });
    } else if (lightingMode === "night") {
      scene.background = new THREE.Color(0x0a111c);
      scene.fog = new THREE.FogExp2(0x0a111c, 0.012);
      sun.position.set(-25, 45, -30);
      sun.color.setHex(0x7c98c7);
      sun.intensity = 0.4;
      hemi.color.setHex(0x22334d);
      hemi.groundColor.setHex(0x111620);
      hemi.intensity = 0.45;
      scene.traverse((obj) => {
        if (obj.name === "interiorGlow") obj.visible = true;
      });
    }
  }, [lightingMode]);

  // Auto-Rotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
      controlsRef.current.autoRotateSpeed = 1.2;
    }
  }, [autoRotate]);

  // Wireframe
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => (m.wireframe = wireframeMode));
        } else if (mesh.material) {
          mesh.material.wireframe = wireframeMode;
        }
      }
    });
  }, [wireframeMode]);

  // Zoning Envelope Visibility
  useEffect(() => {
    if (zoningGroupRef.current) {
      zoningGroupRef.current.visible = showZoningEnvelope;
    }
  }, [showZoningEnvelope]);

  // Contour Lines Visibility
  useEffect(() => {
    if (contourGroupRef.current) {
      contourGroupRef.current.visible = showContours;
    }
  }, [showContours]);

  // Camera Presets
  const setCameraPreset = (preset: string) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    setActiveCameraView(preset);

    if (currentMode === "subdivision") {
      switch (preset) {
        case "aerial":
          camera.position.set(0, 75, 115);
          controls.target.set(0, 2, 0);
          break;
        case "pond":
          // Close up of central pond & spraying fountain
          camera.position.set(0, 7, 42);
          controls.target.set(0, 1.5, 0);
          break;
        case "entrance":
          // Main entrance boulevard view
          camera.position.set(0, 6, 95);
          controls.target.set(0, 2, 40);
          break;
        case "street":
          // Residential loop street view
          camera.position.set(45, 8, 45);
          controls.target.set(30, 4, 15);
          break;
      }
    } else {
      switch (preset) {
        case "front":
          camera.position.set(0, 4.8, 26);
          controls.target.set(0, 3.8, 0);
          if (houseSpec.viewLevel === "dollhouse") {
            onHouseSpecChange?.({ ...houseSpec, viewLevel: "exterior" });
          }
          break;
        case "street":
          camera.position.set(22, 5.5, 20);
          controls.target.set(0, 3.5, 0);
          break;
        case "patio":
          camera.position.set(4.0, 3.8, -18);
          controls.target.set(1.5, 2.5, -5.0);
          break;
        case "porch":
          camera.position.set(3.2, 2.2, 9.5);
          controls.target.set(2.8, 2.0, 4.0);
          break;
        case "dollhouse":
          camera.position.set(18, 24, 22);
          controls.target.set(0, 3.5, 0);
          onHouseSpecChange?.({ ...houseSpec, viewLevel: "dollhouse" });
          break;
      }
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
        link.download = `${
          currentMode === "subdivision" ? "subdivision-master-plan" : "spec-house-design"
        }-${parcelId}.glb`;
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
    <div className="relative flex flex-col w-full h-full min-h-[700px] rounded-xl overflow-hidden border border-border bg-card shadow-2xl">
      {/* 3D Canvas Mount Point */}
      <div
        ref={mountRef}
        className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing"
      >
        {/* Loading Overlay */}
        {!isLoaded && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border bg-card/80 shadow-lg text-center max-w-sm">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <div className="text-lg font-bold text-foreground">
                Loading 3D Land Development & Studio
              </div>
              <div className="text-xs text-muted-foreground">
                Streaming Poly Haven PBR textures and generating subdivision terrain...
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

        {/* Top Header Overlay with Address, Parcel & Mode Switcher */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 p-3 rounded-lg bg-background/90 backdrop-blur-md border border-border shadow-md pointer-events-auto max-w-md">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center p-1 rounded bg-primary/10 text-primary">
              <Box className="w-4 h-4" />
            </span>
            <div className="font-semibold text-sm text-foreground truncate">{address}</div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              Parcel: <code className="font-mono text-foreground">{parcelId}</code>
            </span>
            <span>•</span>
            <span className="text-primary font-medium">{zoningDistrict}</span>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1.5 pt-1.5 border-t border-border mt-0.5">
            <button
              onClick={() => {
                setMode("subdivision");
                setCameraPreset("aerial");
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
                currentMode === "subdivision"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Waves className="w-3.5 h-3.5" />
              <span>Subdivision & Pond</span>
            </button>
            <button
              onClick={() => {
                setMode("houseStudio");
                setCameraPreset("front");
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
                currentMode === "houseStudio"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>House 3D Studio</span>
            </button>
          </div>
        </div>

        {/* Top Right Quick Actions */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 pointer-events-auto">
          <Button
            size="sm"
            variant="outline"
            className="bg-background/90 backdrop-blur-md text-xs shadow-sm hover:bg-background"
            onClick={handleExportGLB}
            title="Export full 3D model in GLB format for ArcGIS Pro, Cesium, or Blender"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-primary" />
            Export .GLB
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-background/90 backdrop-blur-md text-xs shadow-sm hover:bg-background"
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
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

            {currentMode === "subdivision" ? (
              <>
                <button
                  onClick={() => setCameraPreset("aerial")}
                  className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                    activeCameraView === "aerial"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Subdivision Aerial
                </button>
                <button
                  onClick={() => setCameraPreset("pond")}
                  className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                    activeCameraView === "pond"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Central Pond
                </button>
                <button
                  onClick={() => setCameraPreset("entrance")}
                  className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                    activeCameraView === "entrance"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Boulevard
                </button>
                <button
                  onClick={() => setCameraPreset("street")}
                  className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                    activeCameraView === "street"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Street Loop
                </button>
              </>
            ) : (
              <>
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
                  Corner
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
                  onClick={() => setCameraPreset("dollhouse")}
                  className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                    activeCameraView === "dollhouse"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Dollhouse
                </button>
              </>
            )}
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
                title="Golden Hour Sunset with Pond Reflections"
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
                title="Twilight / Night with Illuminated Fountain & Interior Glow"
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>

            {/* Feature Toggles */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-background/90 backdrop-blur-md border border-border shadow-lg">
              {currentMode === "houseStudio" && (
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
              )}

              {currentMode === "subdivision" && (
                <button
                  onClick={() => setShowContours(!showContours)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                    showContours
                      ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Toggle Topography Elevation Contour Lines"
                >
                  <Mountain className="w-3.5 h-3.5" />
                  <span>Contours</span>
                </button>
              )}

              <button
                onClick={() => setWireframeMode(!wireframeMode)}
                className={`p-1.5 rounded transition-colors ${
                  wireframeMode
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Toggle Architectural Wireframe Mesh"
              >
                <Compass className="w-4 h-4" />
              </button>

              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`p-1.5 rounded transition-colors ${
                  autoRotate
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Toggle Auto-Rotate Turntable"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Legend Overlay */}
        <div className="absolute bottom-16 left-4 z-10 hidden sm:flex flex-col gap-1 p-2.5 rounded-lg bg-background/85 backdrop-blur-sm border border-border text-[11px] text-muted-foreground pointer-events-none">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <Info className="w-3.5 h-3.5 text-primary" />
            <span>Interactive 3D Controls</span>
          </div>
          <div>• Left Click + Drag: Orbit / Rotate</div>
          <div>• Right Click + Drag: Pan Camera</div>
          <div>• Scroll: Zoom In / Out</div>
          {currentMode === "subdivision" ? (
            <div className="mt-1 pt-1 border-t border-border flex flex-col gap-0.5">
              <span className="text-sky-500 font-medium">--- Central Stormwater Pond & Fountain</span>
              <span className="text-emerald-500 font-medium">--- Topographic Elevation Contours</span>
              <span className="text-amber-500 font-medium">--- Platted Residential Parcels & Roads</span>
            </div>
          ) : (
            showZoningEnvelope && (
              <div className="mt-1 pt-1 border-t border-border flex flex-col gap-0.5">
                <span className="text-amber-500 font-medium">--- Front / Rear Setback Lines</span>
                <span className="text-sky-400 font-medium">▢ Height Limit Envelope (35&apos; max)</span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
