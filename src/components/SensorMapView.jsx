import React, { Suspense, useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, useGLTF, TransformControls } from "@react-three/drei";
import * as THREE from "three";
import axios from "../utils/axios";
import { useSensors } from "../context/SensorContext1";
import { XR, createXRStore } from "@react-three/xr";

if (THREE.Material && !THREE.Material.prototype._patchedOnBuild) {
  const originalOnBuild = THREE.Material.prototype.onBuild;
  THREE.Material.prototype.onBuild = function (...args) {
    if (typeof originalOnBuild === "function") {
      return originalOnBuild.apply(this, args);
    }
    return null;
  };
  THREE.Material.prototype._patchedOnBuild = true;
}


const xrStore = createXRStore();

function BridgeModel({ position }) {
  const { scene } = useGLTF("/models/railway_bridge_with_a_feeling_of_coziness.glb");
  return (
    <group position={position} scale={1}>
      <primitive object={scene.clone()} />
    </group>
  );
}

// -------- Status Categorization ----------
function getSensorStatus(id, value) {
  const v = parseFloat(value);

  switch (id) {
    case "temperature":
      if (v > 50) return "CRITICAL";
      if (v > 40) return "WARNING";
      return "GOOD";
    case "hum":
      if (v > 90) return "CRITICAL";
      if (v > 80) return "WARNING";
      return "GOOD";
    case "ws_2":
      if (v > 20) return "CRITICAL";
      if (v > 10) return "WARNING";
      return "GOOD";
    case "press_h":
      if (v < 970 || v > 1060) return "CRITICAL";
      if (v < 980 || v > 1050) return "WARNING";
      return "GOOD";
    case "curr_rain":
      if (v > 30) return "CRITICAL";
      if (v > 10) return "WARNING";
      return "GOOD";
    case "max_WS":
      if (v > 25) return "CRITICAL";
      if (v > 15) return "WARNING";
      return "GOOD";
    case "VP_mbar":
      if (v > 30) return "CRITICAL";
      if (v > 20) return "WARNING";
      return "GOOD";
    case "tilt_NS":
    case "tilt_WE":
      if (Math.abs(v) > 5) return "CRITICAL";
      if (Math.abs(v) > 2) return "WARNING";
      return "GOOD";
    case "Strike":
      if (Math.abs(v) > 3) return "CRITICAL";
      if (Math.abs(v) > 1) return "WARNING";
      return "GOOD";
    case "bv":
      if (v < 10) return "CRITICAL";
      if (v < 12) return "WARNING";
      return "GOOD";
    default:
      return "GOOD";
  }
}

// -------- Sensor Display Names ----------
const sensorMeta = {
  temperature: "Temperature (°C)",
  hum: "Humidity (%)",
  ws_2: "Wind Speed (m/s)",
  wd: "Wind Direction (°)",
  press_h: "Pressure (hPa)",
  curr_rain: "Rainfall (mm/hr)",
  max_WS: "Max Wind Speed (m/s)",
  VP_mbar: "Vapor Pressure (mbar)",
  tilt_NS: "Tilt N-S (°)",
  tilt_WE: "Tilt W-E (°)",
  Strike: "Structural Stress",
  bv: "Battery Voltage (V)",
};

// -------- Sensor Marker ----------
function SensorMarker({ pos, sensor, time, sensorDraggable, setIsDragging, updateSensorPos }) {
  const sensorRef = useRef();
  const pulseRef = useRef();
  const materialRef = useRef();
  const pulseMaterialRef = useRef();
  const [position, setPosition] = useState(pos);

  const { id, value } = sensor;
  const status = useMemo(() => getSensorStatus(id, value), [id, value]);

  const getColor = useMemo(() => {
    switch (status) {
      case "GOOD": return "#00ff00";
      case "WARNING": return "#ffff00";
      case "CRITICAL": return "#ff0000";
      default: return "#808080";
    }
  }, [status]);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.color.set(getColor);
      materialRef.current.emissive.set(getColor);
    }
    if (pulseMaterialRef.current) {
      pulseMaterialRef.current.color.set(getColor);
    }
  }, [getColor]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (sensorRef.current) {
      sensorRef.current.scale.setScalar(1.1 + Math.sin(t * 2) * 0.1);
    }
    if (pulseRef.current && pulseMaterialRef.current) {
      const scale = 1 + (Math.sin(t * 2) + 1) * 0.4;
      pulseRef.current.scale.set(scale, scale, scale);
      pulseMaterialRef.current.opacity = 0.4 + Math.sin(t * 2) * 0.2;
    }
  });

  const sensorMesh = (
    <group ref={sensorRef} position={position}>
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          ref={materialRef}
          color={getColor}
          emissive={getColor}
          emissiveIntensity={0.7}
        />
      </mesh>

      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshBasicMaterial
          ref={pulseMaterialRef}
          color={getColor}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Html distanceFactor={10}>
        <div className="bg-black/80 text-cyan-400 text-xs px-2 py-1 rounded shadow border border-cyan-500 font-mono whitespace-nowrap">
          <div className="font-bold">{sensorMeta[id] || id}</div>
          <div>Value: {value}</div>
          <div>Time: {time}</div>
          <div>Status: {status}</div>
        </div>
      </Html>
    </group>
  );

  if (sensorDraggable) {
    return (
      <TransformControls
        object={sensorRef}
        mode="translate"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => {
          setIsDragging(false);
          if (sensorRef.current) {
            const newPos = sensorRef.current.position.toArray();
            setPosition(newPos);
            updateSensorPos(id, newPos);
            console.log(`${sensorMeta[id] || id} moved to:`, newPos);
          }
        }}
      >
        {sensorMesh}
      </TransformControls>
    );
  }

  return sensorMesh;
}

// -------- Main Component ----------
export default function SensorMapView() {
  const { sensors, metaData } = useSensors();
  const [sensorDraggable, setSensorDraggable] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef();

  // Default positions (used as fallback)
  const defaultPositions = {
    temperature: [-4, 31, -6.5],
    hum: [-3, 2, 1],
    ws_2: [1, 0.5, -2],
    wd: [2, 4, 3],
    press_h: [0, 10, -5],
    curr_rain: [5, 6, 2],
    max_WS: [6, 8, -3],
    VP_mbar: [-6, 3, 2],
    tilt_NS: [3, 12, 1],
    tilt_WE: [-2, 15, -4],
    Strike: [4, 20, 0],
    bv: [7, 5, 1],
  };

  const [sensorPositions, setSensorPositions] = useState(defaultPositions);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch saved positions from backend
  useEffect(() => {
    axios.get("/api/sensors-position")
      .then(res => {
        // Backend now returns positions directly as { temperature: [x,y,z], hum: [x,y,z], ... }
        setSensorPositions(prev => ({ ...prev, ...res.data }));
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching positions:", err);
        setIsLoading(false);
      });
  }, []);

  // Save new position to backend
  const updateSensorPos = (id, newPos) => {
    // Update local state immediately for smooth UX
    setSensorPositions((prev) => ({
      ...prev,
      [id]: newPos
    }));

    // Save to backend
    axios.post("/api/sensors-position/update", {
      sensorId: id,
      position: newPos
    })
    .then(response => {
      console.log(`Position saved for ${id}:`, response.data);
    })
    .catch(err => {
      console.error("Error saving position:", err);
      // Optionally revert local state on error
      // setSensorPositions(prev => ({ ...prev, [id]: prevPosition }));
    });
  };

  const sensorsById = useMemo(() => {
    const map = new Map();
    sensors.forEach(sensor => {
      map.set(sensor.id, sensor);
    });
    return map;
  }, [sensors]);

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading sensor positions...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gray-900 relative">
      <button
        onClick={() => setSensorDraggable((d) => !d)}
        className="absolute top-4 left-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-10 hover:bg-green-700 transition-colors"
      >
        {sensorDraggable ? "Lock Sensor Position" : "Change Sensor Position"}
      </button>
      {/* <button onClick={() => xrStore.enterVR()} className="absolute top-4 left-[20%] border-2 px-4 py-2 rounded-xl text-lg font-semibold hover:cursor-pointer">
        Enter VR
      </button> */}

      <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-2 rounded shadow-lg z-10 font-mono text-sm">
        <div>Last Update: {metaData?.ts_server || "No data"}</div>
        <div>Sensors: {sensors.length}</div>
      </div>

      <Canvas ref={canvasRef} camera={{ position: [8, 8, 12], fov: 50 }} onCreated={({ scene }) => {canvasRef.current = { scene };}}>
        <XR store={xrStore}
          hideControllers
          controllers={false}
          hands={false}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} />

          {/* <Suspense fallback={null}> */}
          <BridgeModel position={[0, 0, 0]} />

          {Object.entries(sensorPositions).map(([sensorId, pos]) => {
            const sensor = sensorsById.get(sensorId);
            if (!sensor) return null;
            return (
              <SensorMarker
                key={`${sensorId}-${sensor.value}-${metaData?.ts_server}`}
                pos={pos}
                sensor={sensor}
                time={metaData?.ts_server || ""}
                sensorDraggable={sensorDraggable}
                setIsDragging={setIsDragging}
                updateSensorPos={updateSensorPos}
              />
            );
          })}
          {/* </Suspense> */}

          <OrbitControls
            enableZoom
            enablePan
            enableRotate={!sensorDraggable || !isDragging}
          />
        </XR>
      </Canvas>
    </div>
  );
}