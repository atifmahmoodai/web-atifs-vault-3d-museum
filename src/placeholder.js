/* Procedural stand-in car, drawn in code so the museum is complete without licensed models.
   Six meshes per car, shared geometry, one body colour per car. */
import * as THREE from 'three';

const geo = {
  body: new THREE.BoxGeometry(1, 0.18, 0.43),
  cabin: new THREE.BoxGeometry(0.5, 0.12, 0.38),
  wheel: new THREE.CylinderGeometry(0.075, 0.075, 0.05, 18).rotateX(Math.PI / 2),
};
const glass = new THREE.MeshStandardMaterial({ color: 0x1d2a33, roughness: 0.15, metalness: 0.3 });
const tyre = new THREE.MeshStandardMaterial({ color: 0x16171a, roughness: 0.85 });

export function hueForKey(key) {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return (h % 360) / 360;
}

export function placeholderCar(car) {
  const root = new THREE.Group();
  root.name = 'placeholder:' + car.key;
  const paint = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(hueForKey(car.key), 0.55, 0.42), roughness: 0.35, metalness: 0.45,
  });
  const body = new THREE.Mesh(geo.body, paint);
  body.position.y = 0.14;
  const cabin = new THREE.Mesh(geo.cabin, glass);
  cabin.position.set(-0.06, 0.29, 0);
  root.add(body, cabin);
  for (const [x, z] of [[0.32, 0.2], [0.32, -0.2], [-0.32, 0.2], [-0.32, -0.2]]) {
    const w = new THREE.Mesh(geo.wheel, tyre);
    w.position.set(x, 0.075, z);
    root.add(w);
  }
  /* modelled at unit length (about 0.35 high), scaled uniformly to the catalogue length */
  root.scale.setScalar(car.len || 4.3);
  root.userData.placeholder = true;
  return root;
}
