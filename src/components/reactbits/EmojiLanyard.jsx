/* eslint-disable react/no-unknown-property */
/*
 * Adapted from React Bits' <Lanyard /> component.
 * Instead of a rectangular card.glb model, the hanging object is a single
 * emoji glyph rendered onto a transparent plane — no card box, no background.
 * Same rope-joint physics, drag interaction, and swinging behaviour as the
 * original component.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";
import "./EmojiLanyard.css";

extend({ MeshLineGeometry, MeshLineMaterial });

// Renders a single emoji glyph onto a transparent canvas texture so it can be
// mapped onto a plane with no visible box/background behind it.
function useEmojiTexture(emoji, size = 512) {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, size, size);
    ctx.font = `${Math.round(size * 0.8)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, size / 2, size / 2 + size * 0.04);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    return tex;
  }, [emoji, size]);
}

// Generates a simple repeating band texture procedurally, so no external
// lanyard.png asset is required.
function useBandTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#146bff";
    ctx.fillRect(0, 0, 64, 256);
    ctx.strokeStyle = "rgba(7,17,31,0.55)";
    ctx.lineWidth = 5;
    for (let y = -32; y < 288; y += 26) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(64, y + 13);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.needsUpdate = true;
    return tex;
  }, []);
}

export default function EmojiLanyard({
  emoji = "🧿",
  position = [0, 0, 13],
  gravity = [0, -40, 0],
  fov = 20,
  emojiScale = 1.02
}) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="emoji-lanyard-wrapper" aria-hidden="true">
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), 0)}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          {/* emojiScale is intentionally NOT re-multiplied per breakpoint here —
              the responsive .emoji-lanyard-wrapper canvas height (set in the CSS
              file) already produces the correct proportional on-screen size at
              each breakpoint for this fixed camera distance/fov. */}
          <EmojiBand isMobile={isMobile} emoji={emoji} emojiScale={emojiScale} />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}

function EmojiBand({ maxSpeed = 50, minSpeed = 0, isMobile = false, emoji = "🧿", emojiScale = 3.4 }) {
  const band = useRef(),
    fixed = useRef(),
    j1 = useRef(),
    j2 = useRef(),
    j3 = useRef(),
    bead = useRef();
  const vec = new THREE.Vector3(),
    ang = new THREE.Vector3(),
    rot = new THREE.Vector3(),
    dir = new THREE.Vector3();
  const segmentProps = { type: "dynamic", canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };

  const bandTexture = useBandTexture();
  const emojiTexture = useEmojiTexture(emoji);
  // Remembers the rope points that were last uploaded to the GPU, so the (allocation-heavy)
  // geometry rebuild below only runs when the rope has actually moved.
  const drawn = useRef({ pts: new Float64Array(12).fill(NaN), geo: null, mobile: isMobile });

  const [curve] = useState(
    () => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  );
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  // Anchor point sits above the emoji's own origin so the strap visually
  // attaches at the top of the glyph, like a bead hanging from a lanyard.
  useSphericalJoint(j3, bead, [
    [0, 0, 0],
    [0, 0.55 * emojiScale, 0]
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab";
      return () => void (document.body.style.cursor = "auto");
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [bead, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      bead.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    if (fixed.current) {
      [j1, j2].forEach(ref => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      const d = drawn.current;
      let changed = d.geo !== band.current.geometry || d.mobile !== isMobile;
      for (let k = 0; k < 4 && !changed; k++) {
        const p = curve.points[k], o = k * 3;
        if (!(Math.abs(p.x - d.pts[o]) <= 1e-5 && Math.abs(p.y - d.pts[o + 1]) <= 1e-5 && Math.abs(p.z - d.pts[o + 2]) <= 1e-5)) changed = true;
      }
      if (changed) {
        for (let k = 0; k < 4; k++) {
          const p = curve.points[k], o = k * 3;
          d.pts[o] = p.x; d.pts[o + 1] = p.y; d.pts[o + 2] = p.z;
        }
        d.geo = band.current.geometry;
        d.mobile = isMobile;
        band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      }
      ang.copy(bead.current.angvel());
      rot.copy(bead.current.rotation());
      bead.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = "chordal";
  bandTexture.wrapS = bandTexture.wrapT = THREE.RepeatWrapping;

  const planeSize = 1.6;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={bead}
          {...segmentProps}
          type={dragged ? "kinematicPosition" : "dynamic"}
        >
          <CuboidCollider args={[(planeSize * emojiScale) / 2, (planeSize * emojiScale) / 2, 0.05]} />
          <mesh
            scale={emojiScale}
            position={[0, -0.35 * emojiScale, 0]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={e => (e.target.releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={e => (
              e.target.setPointerCapture(e.pointerId),
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(bead.current.translation())))
            )}
          >
            <planeGeometry args={[planeSize, planeSize]} />
            <meshBasicMaterial map={emojiTexture} transparent alphaTest={0.05} toneMapped={false} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={bandTexture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}
