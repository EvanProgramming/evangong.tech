/* eslint-disable react/no-unknown-property */
import * as THREE from 'three';
import { Suspense, useRef, useState, useEffect, memo } from 'react';
import { Canvas, createPortal, useFrame, useThree, useLoader } from '@react-three/fiber';
import {
  useFBO,
  useGLTF,
  Preload,
  MeshTransmissionMaterial,
} from '@react-three/drei';
import { easing } from 'maath';

export default function FluidGlass({ mode = 'lens', image, lensProps = {}, barProps = {}, cubeProps = {} }) {
  const Wrapper = mode === 'bar' ? Bar : mode === 'cube' ? Cube : Lens;
  const rawOverrides = mode === 'bar' ? barProps : mode === 'cube' ? cubeProps : lensProps;

  const {
    navItems = [
      { label: 'Home', link: '' },
      { label: 'About', link: '' },
      { label: 'Contact', link: '' }
    ],
    ...modeProps
  } = rawOverrides;

  return (
    <Canvas camera={{ position: [0, 0, 20], fov: 15 }} gl={{ alpha: true }}>
      <Wrapper modeProps={modeProps} image={image}>
        <Suspense fallback={null}>
          <BackgroundImage image={image} />
        </Suspense>
        <Preload />
      </Wrapper>
    </Canvas>
  );
}

const ModeWrapper = memo(function ModeWrapper({
  children,
  glb,
  geometryKey,
  lockToBottom = false,
  followPointer = true,
  modeProps = {},
  image,
  ...props
}) {
  const ref = useRef();
  const { nodes } = useGLTF(glb);
  const buffer = useFBO();
  const { viewport: vp } = useThree();
  const [scene] = useState(() => new THREE.Scene());
  const geoWidthRef = useRef(1);

  useEffect(() => {
    const geo = nodes[geometryKey]?.geometry;
    geo.computeBoundingBox();
    geoWidthRef.current = geo.boundingBox.max.x - geo.boundingBox.min.x || 1;
  }, [nodes, geometryKey]);

  useFrame((state, delta) => {
    const { gl, viewport, pointer, camera } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

    const destX = followPointer ? (pointer.x * v.width) / 2 : 0;
    const destY = lockToBottom ? -v.height / 2 + 0.2 : followPointer ? (pointer.y * v.height) / 2 : 0;
    easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta);

    if (modeProps.scale == null) {
      const maxWorld = v.width * 0.9;
      const desired = maxWorld / geoWidthRef.current;
      ref.current.scale.setScalar(Math.min(0.15, desired));
    }

    gl.setRenderTarget(buffer);
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    // Without setClearColor the FBO is cleared to transparent (alpha 0),
    // and MeshTransmissionMaterial falls back to its default white color.
    // Opaque black matches the project's dark theme.
    gl.setClearColor(0x000000, 1);
  });

  const { scale, ior, thickness, anisotropy, chromaticAberration, ...extraMat } = modeProps;

  return (
    <>
      {createPortal(children, scene)}
      <mesh scale={[vp.width, vp.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} transparent />
      </mesh>
      <mesh ref={ref} scale={scale ?? 0.15} rotation-x={Math.PI / 2} geometry={nodes[geometryKey]?.geometry} {...props}>
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={ior ?? 1.15}
          thickness={thickness ?? 5}
          anisotropy={anisotropy ?? 0.01}
          chromaticAberration={chromaticAberration ?? 0.1}
          {...extraMat}
        />
      </mesh>
    </>
  );
});

function BackgroundImage({ image }) {
  const viewport = useThree(s => s.viewport);
  const texture = useLoader(THREE.TextureLoader, image);
  return (
    <mesh position={[0, 0, -1]} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function Lens({ modeProps, image, ...p }) {
  return <ModeWrapper glb="/assets/3d/lens.glb" geometryKey="Cylinder" followPointer modeProps={modeProps} image={image} {...p} />;
}

function Cube({ modeProps, image, ...p }) {
  return <ModeWrapper glb="/assets/3d/cube.glb" geometryKey="Cube" followPointer modeProps={modeProps} image={image} {...p} />;
}

function Bar({ modeProps = {}, image, ...p }) {
  const defaultMat = {
    transmission: 1,
    roughness: 0,
    thickness: 10,
    ior: 1.15,
    color: '#ffffff',
    attenuationColor: '#ffffff',
    attenuationDistance: 0.25
  };

  return (
    <ModeWrapper
      glb="/assets/3d/bar.glb"
      geometryKey="Cube"
      lockToBottom
      followPointer={false}
      modeProps={{ ...defaultMat, ...modeProps }}
      image={image}
      {...p}
    />
  );
}
