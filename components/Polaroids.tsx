
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { TreeMode } from '../types';

interface PolaroidsProps {
  mode: TreeMode;
  uploadedPhotos: string[];
  twoHandsDetected: boolean;
  onClosestPhotoChange?: (photoUrl: string | null) => void;
  onPhotoClick?: (photoUrl: string) => void;
}

interface PhotoData {
  id: number;
  url: string;
  chaosPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  speed: number;
}

interface PolaroidItemProps {
  data: PhotoData;
  mode: TreeMode;
  index: number;
  onClick?: (url: string) => void;
  allPhotosCount: number;
  carouselRotation: number;
}

const PolaroidItem: React.FC<PolaroidItemProps> = ({ data, mode, index, onClick, allPhotosCount, carouselRotation }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const funnyCaptions = [
    "¿Qué hace un perro con un taladro? 'Ta-taladrando'. 🐶",
    "¿Por qué el libro de matemáticas se suicidó? Tenía muchos problemas. 📚",
    "Mi novia me dejó... ¡pero me dejó la puerta abierta! 😉",
    "¿Qué es largo, duro y tiene nombre de mujer? La barandilla. 🤭",
    "¿En qué se parece un termómetro a una mujer? 🔥",
    "¿Qué tiene 4 letras, empieza por C y termina con O? El CODO. 🦾",
    "¿Qué es peludo por fuera y húmedo por dentro? Un coco. 🥥",
    "¿Qué entra duro y sale blando y mojado? ¡Un chicle! 😂",
    "¿Por qué las mujeres no usan paracaídas? 😎",
    "¿Qué es negro, blanco y se ríe? Una cebra. 🦓",
    "¡Ríete un poco, Gianny! ✨"
  ];

  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [error, setError] = useState(false);

  // Safe texture loading
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      data.url,
      (loadedTex) => {
        loadedTex.colorSpace = THREE.SRGBColorSpace;
        setTexture(loadedTex);
        setError(false);
      },
      undefined,
      (err) => {
        console.warn(`Failed to load image: ${data.url}`, err);
        setError(true);
      }
    );
  }, [data.url]);
  
  const swayOffset = useMemo(() => Math.random() * 100, []);

  // Position animation initialization
  useEffect(() => {
    if (groupRef.current) {
      const initialPos = mode === TreeMode.FORMED ? data.targetPos : data.chaosPos;
      groupRef.current.position.copy(initialPos);
      
      const targetScale = mode === TreeMode.CHAOS ? 6.5 : 1.0;
      groupRef.current.scale.set(targetScale, targetScale, targetScale);
    }
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const isFormed = mode === TreeMode.FORMED;
    const time = state.clock.elapsedTime;
    const dummy = new THREE.Object3D();
    
    // 1. Position Interpolation
    const targetPos = isFormed ? data.targetPos : data.chaosPos;
    const step = delta * data.speed;
    groupRef.current.position.lerp(targetPos, step);

    // 2. Rotation & Sway Logic
    if (isFormed) {
        dummy.position.copy(groupRef.current.position);
        dummy.lookAt(0, groupRef.current.position.y, 0); 
        // Eliminada la rotación de 180 grados para que la foto mire hacia afuera
                
        groupRef.current.quaternion.slerp(dummy.quaternion, step);
        
        const swayAngle = Math.sin(time * 2.0 + swayOffset) * 0.08;
        const tiltAngle = Math.cos(time * 1.5 + swayOffset) * 0.05;
        
        const currentRot = new THREE.Euler().setFromQuaternion(groupRef.current.quaternion);
        groupRef.current.rotation.z = currentRot.z + swayAngle * 0.05; 
        groupRef.current.rotation.x = currentRot.x + tiltAngle * 0.05;
    } else {
        const dummy = new THREE.Object3D();
        dummy.position.copy(groupRef.current.position);
        
        // Face outward from center
        dummy.lookAt(new THREE.Vector3(0, 9, 0)); 
        // Eliminada la rotación de 180 grados para que la foto mire hacia afuera
                
        groupRef.current.quaternion.slerp(dummy.quaternion, delta * 3);
        
        const wobbleX = Math.sin(time * 1.5 + swayOffset) * 0.03;
        const wobbleZ = Math.cos(time * 1.2 + swayOffset) * 0.03;
        
        const currentRot = new THREE.Euler().setFromQuaternion(groupRef.current.quaternion);
        groupRef.current.rotation.x = currentRot.x + wobbleX;
        groupRef.current.rotation.z = currentRot.z + wobbleZ;
    }
    
    // 3. Scale Logic
    const targetScale = mode === TreeMode.CHAOS ? 6.5 : 1.0;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 4);
});

  return (
    <group 
      ref={groupRef} 
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(data.url);
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <mesh position={[0, 1.2, -0.1]}>
        <cylinderGeometry args={[0.005, 0.005, 1.5]} />
        <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.2} transparent opacity={0.6} />
      </mesh>

      <group position={[0, 0, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.2, 1.5, 0.02]} />
          <meshStandardMaterial color="#fdfdfd" roughness={0.8} />
        </mesh>

        <mesh position={[0, 0.15, 0.025]}>
          <planeGeometry args={[1.05, 1.05]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.2} />
        </mesh>
        
        <mesh position={[0, 0.15, 0.03]}>
          <planeGeometry args={[1.0, 1.0]} />
          {texture && !error ? (
            <meshBasicMaterial map={texture} />
          ) : (
            <meshStandardMaterial color={error ? "#550000" : "#cccccc"} />
          )}
        </mesh>
        
        <mesh position={[0, 0.7, 0.035]}>
           <boxGeometry args={[0.2, 0.08, 0.04]} />
           <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.1} />
        </mesh>

      </group>
    </group>
  );
};

export const Polaroids: React.FC<PolaroidsProps> = ({ mode, uploadedPhotos, twoHandsDetected, onClosestPhotoChange, onPhotoClick }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [closestPhotoIndex, setClosestPhotoIndex] = React.useState<number>(0);

  const photoData = useMemo(() => {
    if (uploadedPhotos.length === 0) return [];

    const data: PhotoData[] = [];
    const height = 9; 
    const maxRadius = 5.0; 
    const count = uploadedPhotos.length;

    for (let i = 0; i < count; i++) {
      const yNorm = 0.2 + (i / count) * 0.6; 
      const y = yNorm * height;
      const r = maxRadius * (1 - yNorm) + 0.8; 
      const theta = i * 2.39996; 
      
      const targetPos = new THREE.Vector3(
        r * Math.cos(theta),
        y,
        r * Math.sin(theta)
      );

      // 2. Chaos Position - CINEMATIC CAROUSEL (Massive foreground pass)
      // Orbiting between the camera (Z=20) and the tree center (Z=0)
      const carouselRadius = 22; 
      const carouselY = 9;
      const angle = (i / count) * Math.PI * 2;
      const chaosPos = new THREE.Vector3(
        carouselRadius * Math.sin(angle),
        carouselY,
        carouselRadius * Math.cos(angle)
      );

      data.push({
        id: i,
        url: uploadedPhotos[i],
        chaosPos,
        targetPos,
        speed: 0.8 + Math.random() * 1.5
      });
    }
    return data;
  }, [uploadedPhotos]);

  const carouselRotation = useRef(0);

  useFrame((state) => {
    if (twoHandsDetected && groupRef.current && photoData.length > 0) {
      const cameraPos = state.camera.position.clone();
      let minDistance = Infinity;
      let closestIndex = 0;
      
      groupRef.current.children.forEach((child, i) => {
        if (i < photoData.length) {
          const worldPos = new THREE.Vector3();
          child.getWorldPosition(worldPos);
          const distance = worldPos.distanceTo(cameraPos);
          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = i;
          }
        }
      });
      
      if (onClosestPhotoChange) {
        onClosestPhotoChange(uploadedPhotos[closestIndex]);
      }
    } else if (onClosestPhotoChange) {
      onClosestPhotoChange(null);
    }
  });

  const [rotation, setRotation] = useState(0);

  useFrame((_, delta) => {
    if (mode === TreeMode.CHAOS && groupRef.current) {
        carouselRotation.current += delta * 0.45; 
        groupRef.current.rotation.y = carouselRotation.current;
        setRotation(carouselRotation.current);
    } else if (groupRef.current) {
      groupRef.current.rotation.y *= 0.95;
      if (Math.abs(groupRef.current.rotation.y) < 0.01) groupRef.current.rotation.y = 0;
      carouselRotation.current = groupRef.current.rotation.y;
      setRotation(carouselRotation.current);
    }
  });

  return (
    <group ref={groupRef}>
      {photoData.map((data, i) => (
        <PolaroidItem 
          key={data.id} 
          data={data} 
          mode={mode} 
          index={i} 
          onClick={onPhotoClick}
          allPhotosCount={uploadedPhotos.length}
          carouselRotation={rotation}
        />
      ))}
    </group>
  );
};
