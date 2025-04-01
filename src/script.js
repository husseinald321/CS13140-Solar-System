import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import * as dat from "dat.gui";

// ------------------------------
// Scene Setup
// ------------------------------
const scene = new THREE.Scene();

// ------------------------------
// Texture Loader & Textures
// ------------------------------
const textureLoader = new THREE.TextureLoader();

const sunTexture = textureLoader.load("/textures/2k_sun.jpg");
const mercuryTexture = textureLoader.load("/textures/2k_mercury.jpg");
const venusTexture = textureLoader.load("/textures/2k_venus_surface.jpg");
const earthTexture = textureLoader.load("/textures/2k_earth_daymap.jpg");
const marsTexture = textureLoader.load("/textures/2k_mars.jpg");
const moonTexture = textureLoader.load("/textures/2k_moon.jpg");

//space ship

let spaceshipscene = 0;
const loader = new OBJLoader();
const spaceshipTexture = textureLoader.load("/shiptextures/Rising_Star_Hull_baseColor.jpg");
const spaceshipMaterial = new THREE.MeshBasicMaterial({ map: spaceshipTexture });
let spaceship;
loader.load(
  '/obj/Rising Star_export.obj', 

  function (object) {
    spaceship = object;
    //scene.add(spaceship); // Add the object to the scene
    spaceship.position.set(10, 0, 0); // Set position if needed
    spaceship.scale.set(0.005, 0.005, 0.005); // Scale if needed
    spaceship.traverse((child) => {
      if (child.isMesh) {
        child.material = spaceshipMaterial;

        
      }
    });
  },
  
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded'); // Progress log
  },
  function (error) {
    console.error('Error loading OBJ:', error);
  }
);






// ------------------------------
// Materials
// ------------------------------
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const mercuryMaterial = new THREE.MeshStandardMaterial({ map: mercuryTexture });
const venusMaterial = new THREE.MeshStandardMaterial({ map: venusTexture });
const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
const marsMaterial = new THREE.MeshStandardMaterial({ map: marsTexture });
const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture });

// ------------------------------
// Geometry
// ------------------------------
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

// ------------------------------
// Sun
// ------------------------------
const sun = new THREE.Mesh(sphereGeometry, sunMaterial);
sun.scale.set(5, 5, 5);
scene.add(sun);

// ------------------------------
// Planets & Moons Data
// ------------------------------
const planetsData = [
  {
    name: "Mercury",
    radius: 0.5,
    distance: 10,
    speed: 0.01,
    material: mercuryMaterial,
    moons: []
  },
  {
    name: "Venus",
    radius: 0.8,
    distance: 15,
    speed: 0.007,
    material: venusMaterial,
    moons: []
  },
  {
    name: "Earth",
    radius: 1,
    distance: 20,
    speed: 0.005,
    material: earthMaterial,
    moons: [
      {
        name: "Moon",
        radius: 0.3,
        distance: 3,
        speed: 0.015
      }
    ]
  },
  {
    name: "Mars",
    radius: 0.7,
    distance: 25,
    speed: 0.003,
    material: marsMaterial,
    moons: [
      {
        name: "Phobos",
        radius: 0.1,
        distance: 2,
        speed: 0.02
      },
      {
        name: "Deimos",
        radius: 0.2,
        distance: 3,
        speed: 0.015,
        color: 0xffffff
      }
    ]
  }
];

// ------------------------------
// Create Planet & Moon Meshes
// ------------------------------
let planetMeshes = planetsData.map((planet) => {
  const planetMesh = new THREE.Mesh(sphereGeometry, planet.material);
  planetMesh.scale.setScalar(planet.radius);
  planetMesh.position.x = planet.distance;
  scene.add(planetMesh);
  planet.moons.forEach((moon) => {
    const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
    moonMesh.scale.setScalar(moon.radius);
    moonMesh.position.x = moon.distance;
    planetMesh.add(moonMesh);
  });
  return planetMesh;
});

// ------------------------------
// Ambient Light
// ------------------------------
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// ------------------------------
// Star Field (Particle System)
// ------------------------------
const starGeometry = new THREE.BufferGeometry();
const starCount = 50000;
const starPositions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
  const radius = THREE.MathUtils.randFloat(300, 500);
  const theta = Math.acos(THREE.MathUtils.randFloatSpread(2));
  const phi = THREE.MathUtils.randFloat(0, Math.PI * 2);
  const x = radius * Math.sin(theta) * Math.cos(phi);
  const y = radius * Math.sin(theta) * Math.sin(phi);
  const z = radius * Math.cos(theta);
  starPositions[i * 3] = x;
  starPositions[i * 3 + 1] = y;
  starPositions[i * 3 + 2] = z;
}
starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));

const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 1,
  depthTest: false
});

const starField = new THREE.Points(starGeometry, starMaterial);
starField.renderOrder = -1;
scene.add(starField);

// ------------------------------
// Asteroid Belt (Beyond Mars)
// ------------------------------
function createAsteroidBelt() {
  // Define inner and outer radii for the belt.
  const innerRadius = 30;
  const outerRadius = 40;
  const asteroidCount = 500;
  
  // Create a small sphere geometry for each asteroid.
  const asteroidGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const asteroidMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
  
  // Use an InstancedMesh for performance.
  const asteroids = new THREE.InstancedMesh(asteroidGeometry, asteroidMaterial, asteroidCount);
  
  const dummy = new THREE.Object3D();
  for (let i = 0; i < asteroidCount; i++) {
    // Random radius between inner and outer radius.
    const radius = THREE.MathUtils.randFloat(innerRadius, outerRadius);
    // Random angle around the sun.
    const angle = THREE.MathUtils.randFloat(0, Math.PI * 2);
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    // A small vertical offset.
    const y = THREE.MathUtils.randFloatSpread(1);
    
    dummy.position.set(x, y, z);
    dummy.rotation.set(
      THREE.MathUtils.randFloat(0, Math.PI),
      THREE.MathUtils.randFloat(0, Math.PI),
      THREE.MathUtils.randFloat(0, Math.PI)
    );
    // Scale each asteroid randomly.
    const scale = THREE.MathUtils.randFloat(0.05, 0.15);
    dummy.scale.set(scale, scale, scale);
    
    dummy.updateMatrix();
    asteroids.setMatrixAt(i, dummy.matrix);
  }
  asteroids.instanceMatrix.needsUpdate = true;
  scene.add(asteroids);
}


// ------------------------------
// Camera & Renderer Setup
// ------------------------------
const defaultCameraPos = new THREE.Vector3(0, 5, 100);
const camera = new THREE.PerspectiveCamera(
  20,
  window.innerWidth / window.innerHeight,
  0.1,
  400
);
camera.position.copy(defaultCameraPos);

const canvasEl = document.querySelector("canvas.threejs");
const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, canvasEl);
controls.enableDamping = true;
controls.maxDistance = 200;
controls.minDistance = 1;

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ------------------------------
// dat.GUI Integration
// ------------------------------
const paramsGUI = {
  orbitSpeed: 0.2,
  viewMode: "Missile" // "Missile" or "Orbital"
};
const gui = new dat.GUI();
gui.add(paramsGUI, "orbitSpeed", 0, 1).name("Orbit Speed");
gui.add(paramsGUI, "viewMode", ["Missile", "Orbital"]).name("View Mode").setValue('Orbital');

// ------------------------------
// Explosion System
// ------------------------------
const explosions = [];
function createExplosion(position) {
  const particleCount = 1000;
  const explosionGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = position.x;
    positions[i * 3 + 1] = position.y;
    positions[i * 3 + 2] = position.z;
    velocities[i * 3] = THREE.MathUtils.randFloatSpread(2);
    velocities[i * 3 + 1] = THREE.MathUtils.randFloatSpread(2);
    velocities[i * 3 + 2] = THREE.MathUtils.randFloatSpread(2);
  }
  explosionGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  explosionGeometry.userData = { velocities: velocities };
  const explosionMaterial = new THREE.PointsMaterial({
    color: 0xffeeaa,
    size: 5,
    transparent: true,
    blending: THREE.AdditiveBlending,
    opacity: 1.0,
    depthWrite: false
  });
  const explosion = new THREE.Points(explosionGeometry, explosionMaterial);
  explosion.userData = { lifetime: 0, maxLifetime: 2 };
  scene.add(explosion);
  return explosion;
}

// ------------------------------
// Debris Field (Splatting After Explosion)
// ------------------------------
const debrisFields = [];
function createDebrisField(position, radius, particleCount) {
  const debrisGeometry = new THREE.BufferGeometry();
  const debrisPositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    let r = radius * Math.cbrt(Math.random());
    let theta = Math.acos(THREE.MathUtils.randFloatSpread(2));
    let phi = THREE.MathUtils.randFloat(0, Math.PI * 2);
    let x = r * Math.sin(theta) * Math.cos(phi);
    let y = r * Math.sin(theta) * Math.sin(phi);
    let z = r * Math.cos(theta);
    debrisPositions[i * 3] = position.x + x;
    debrisPositions[i * 3 + 1] = position.y + y;
    debrisPositions[i * 3 + 2] = position.z + z;
  }
  debrisGeometry.setAttribute("position", new THREE.BufferAttribute(debrisPositions, 3));
  const debrisMaterial = new THREE.PointsMaterial({
    color: 0x888888,
    size: 2,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const debrisField = new THREE.Points(debrisGeometry, debrisMaterial);
  debrisField.userData = {
    lifetime: 0,
    maxLifetime: 5,
    center: position.clone()
  };
  scene.add(debrisField);
  debrisFields.push(debrisField);
  return debrisField;
}

function explodePlanet(index) {
  const planetMesh = planetMeshes[index];
  if (!planetMesh) return;
  const worldPosition = new THREE.Vector3();
  planetMesh.getWorldPosition(worldPosition);
  const explosion = createExplosion(worldPosition);
  explosions.push(explosion);
  createDebrisField(worldPosition, 2, 1000);
  scene.remove(planetMesh);
  planetMeshes[index] = null;
}

// ------------------------------
// Missile & Missile Exhaust System
// ------------------------------
const missiles = [];
const missileExhausts = [];
function launchMissile(index) {
  const targetPlanet = planetMeshes[index];
  if (!targetPlanet) return;
  // Create missile mesh as a red sphere.
  const missileGeometry = new THREE.SphereGeometry(0.5, 16, 16);
  const missileMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const missile = new THREE.Mesh(missileGeometry, missileMaterial);
  missile.position.set(-50, 10, 0);
  scene.add(missile);
  missiles.push({
    mesh: missile,
    targetIndex: index,
    speed: 10,
    exhaustSpawnTimer: 0
  });
}

function spawnMissileExhaust(missileObj) {
  const particleCount = 20;
  const exhaustGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const targetPos = new THREE.Vector3();
  if (planetMeshes[missileObj.targetIndex]) {
    planetMeshes[missileObj.targetIndex].getWorldPosition(targetPos);
  } else {
    targetPos.set(0, 0, 0);
  }
  const direction = new THREE.Vector3().subVectors(targetPos, missileObj.mesh.position).normalize();
  direction.negate();
  const exhaustOrigin = missileObj.mesh.position.clone().add(direction.clone().multiplyScalar(1));
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = exhaustOrigin.x;
    positions[i * 3 + 1] = exhaustOrigin.y;
    positions[i * 3 + 2] = exhaustOrigin.z;
    velocities[i * 3] = direction.x + THREE.MathUtils.randFloatSpread(0.5);
    velocities[i * 3 + 1] = direction.y + THREE.MathUtils.randFloatSpread(0.5);
    velocities[i * 3 + 2] = direction.z + THREE.MathUtils.randFloatSpread(0.5);
  }
  exhaustGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  exhaustGeometry.userData = { velocities: velocities };
  const exhaustMaterial = new THREE.PointsMaterial({
    color: 0xff5500,
    size: 1.5,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const exhaustParticles = new THREE.Points(exhaustGeometry, exhaustMaterial);
  exhaustParticles.userData = { lifetime: 0, maxLifetime: 0.3 };
  scene.add(exhaustParticles);
  missileExhausts.push(exhaustParticles);
}

// ------------------------------
// Reset Scene Button
// ------------------------------
function resetScene() {
  missiles.forEach(missileObj => scene.remove(missileObj.mesh));
  missiles.length = 0;
  missileExhausts.forEach(exhaust => scene.remove(exhaust));
  missileExhausts.length = 0;
  explosions.forEach(exp => scene.remove(exp));
  explosions.length = 0;
  debrisFields.forEach(debris => scene.remove(debris));
  debrisFields.length = 0;
  planetMeshes.forEach(mesh => { if (mesh) scene.remove(mesh); });
  planetMeshes = planetsData.map((planet) => {
    const planetMesh = new THREE.Mesh(sphereGeometry, planet.material);
    planetMesh.scale.setScalar(planet.radius);
    planetMesh.position.x = planet.distance;
    scene.add(planetMesh);
    planet.moons.forEach((moon) => {
      const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
      moonMesh.scale.setScalar(moon.radius);
      moonMesh.position.x = moon.distance;
      planetMesh.add(moonMesh);
    });
    return planetMesh;
  });
  // Reset camera to default sun view.
  sun.getWorldPosition(sunPos);
  camera.position.lerp(defaultCameraPos, 0.1);
  controls.target.lerp(sunPos, 0.1);
  controls.enabled = true;
  camera.fov = 20;
  camera.updateProjectionMatrix();

  //remove spaceship
  scene.remove(spaceship);
}
const resetParams = { reset: resetScene };
gui.add(resetParams, "reset").name("Reset Scene");


function spaceshipScene() {


  spaceshipscene = 1;
  scene.add(spaceship);


const sposition = new THREE.Vector3();



const earthIndex = planetsData.findIndex(planet => planet.name === "Earth");

// Get Earth's mesh from planetMeshes
const earthMesh = planetMeshes[earthIndex];

// Get Earth's position
const earthPosition = earthMesh.position;
//console.log("Earth Position:", earthPosition);

  //planetsData[2].getWorldPosition(eposition);
  
  spaceship.position.set(earthPosition.x,earthPosition.y,earthPosition.z);
  spaceship.rotation.y += -90;
   spaceship.getWorldPosition(sposition);
  controls.target.copy(sposition);
  controls.update();
  paramsGUI.viewMode = "Orbital";

}
const spaceshipParams = { spaceship: spaceshipScene};
gui.add(spaceshipParams, "spaceship").name("spaceship Scene");






// ------------------------------
// Missile GUI Buttons
// ------------------------------
const missileFolder = gui.addFolder("Missile Attacks");
planetsData.forEach((planet, index) => {
  const obj = { destroy: () => { launchMissile(index); } };
  missileFolder.add(obj, "destroy").name(`Destroy ${planet.name}`);
});

// ------------------------------
// Click-to-Focus Feature
// ------------------------------
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
canvasEl.addEventListener("click", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0) {
    const selectedObject = intersects[0].object;
    const selectedPosition = new THREE.Vector3();
    selectedObject.getWorldPosition(selectedPosition);
    controls.target.copy(selectedPosition);
    controls.update();
    // Switch to orbital view when clicking on a planet.
    paramsGUI.viewMode = "Orbital";
  }
});

// ------------------------------
// Camera Follow for Missile or Reset to Sun
// ------------------------------
const sunPos = new THREE.Vector3();
sun.getWorldPosition(sunPos);

const clock = new THREE.Clock();
const expansionSpeed = 5; // units per second for debris field expansion.
const renderloop = () => {
  const delta = clock.getDelta();
  createAsteroidBelt();




  // Animate planet orbits.
  planetMeshes.forEach((planetMesh, index) => {
    if (planetMesh) {
      planetMesh.rotation.y += planetsData[index].speed * paramsGUI.orbitSpeed;
      planetMesh.position.x = Math.cos(planetMesh.rotation.y) * planetsData[index].distance;
      planetMesh.position.z = Math.sin(planetMesh.rotation.y) * planetsData[index].distance;
    }
  });

  // Update explosion systems.
  for (let i = explosions.length - 1; i >= 0; i--) {
    const explosion = explosions[i];
    explosion.userData.lifetime += delta;
    const positions = explosion.geometry.attributes.position.array;
    const velocities = explosion.geometry.userData.velocities;
    const count = positions.length / 3;
    for (let j = 0; j < count; j++) {
      positions[j * 3]     += velocities[j * 3] * delta * 100;
      positions[j * 3 + 1] += velocities[j * 3 + 1] * delta * 100;
      positions[j * 3 + 2] += velocities[j * 3 + 2] * delta * 100;
    }
    explosion.geometry.attributes.position.needsUpdate = true;
    explosion.material.opacity = 1 - (explosion.userData.lifetime / explosion.userData.maxLifetime);
    if (explosion.userData.lifetime > explosion.userData.maxLifetime) {
      scene.remove(explosion);
      explosions.splice(i, 1);
    }
  }

  // Update debris fields: expand outward and fade.
  for (let i = debrisFields.length - 1; i >= 0; i--) {
    const debris = debrisFields[i];
    debris.userData.lifetime += delta;
    const positions = debris.geometry.attributes.position.array;
    const count = positions.length / 3;
    const center = debris.userData.center;
    for (let j = 0; j < count; j++) {
      const idx = j * 3;
      const dx = positions[idx] - center.x;
      const dy = positions[idx + 1] - center.y;
      const dz = positions[idx + 2] - center.z;
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (len > 0) {
        const dirX = dx / len;
        const dirY = dy / len;
        const dirZ = dz / len;
        positions[idx]     += dirX * expansionSpeed * delta;
        positions[idx + 1] += dirY * expansionSpeed * delta;
        positions[idx + 2] += dirZ * expansionSpeed * delta;
      }
    }
    debris.geometry.attributes.position.needsUpdate = true;
    debris.material.opacity = 0.7 * (1 - debris.userData.lifetime / debris.userData.maxLifetime);
    if (debris.userData.lifetime > debris.userData.maxLifetime) {
      scene.remove(debris);
      debrisFields.splice(i, 1);
    }
  }

 
  // Update missiles.
  for (let i = missiles.length - 1; i >= 0; i--) {
    const missileObj = missiles[i];
    const targetPlanet = planetMeshes[missileObj.targetIndex];
    if (targetPlanet) {
      const targetPos = new THREE.Vector3();
      targetPlanet.getWorldPosition(targetPos);
      const direction = new THREE.Vector3().subVectors(targetPos, missileObj.mesh.position).normalize();
      missileObj.mesh.position.add(direction.multiplyScalar(missileObj.speed * delta));
      missileObj.mesh.lookAt(targetPos);
      if (missileObj.mesh.position.distanceTo(targetPos) < 1) {
        explodePlanet(missileObj.targetIndex);
        scene.remove(missileObj.mesh);
        missiles.splice(i, 1);
        // Once missile impacts, reset camera to view the sun.
        controls.enabled = true;
        camera.position.lerp(defaultCameraPos, 0.1);
        controls.target.lerp(sunPos, 0.1);
        continue;
      }
    } else {
      scene.remove(missileObj.mesh);
      missiles.splice(i, 1);
      continue;
    }
    
    missileObj.exhaustSpawnTimer += delta;
    if (missileObj.exhaustSpawnTimer > 0.05) {
      spawnMissileExhaust(missileObj);
      missileObj.exhaustSpawnTimer = 0;
    }
  }

  // Update missile exhaust systems.
  for (let i = missileExhausts.length - 1; i >= 0; i--) {
    const exhaust = missileExhausts[i];
    exhaust.userData.lifetime += delta;
    const positions = exhaust.geometry.attributes.position.array;
    const velocities = exhaust.geometry.userData.velocities;
    const count = positions.length / 3;
    for (let j = 0; j < count; j++) {
      positions[j * 3]     += velocities[j * 3] * delta * 50;
      positions[j * 3 + 1] += velocities[j * 3 + 1] * delta * 50;
      positions[j * 3 + 2] += velocities[j * 3 + 2] * delta * 50;
    }
    exhaust.geometry.attributes.position.needsUpdate = true;
    exhaust.material.opacity = 0.8 * (1 - exhaust.userData.lifetime / exhaust.userData.maxLifetime);
    if (exhaust.userData.lifetime > exhaust.userData.maxLifetime) {
      scene.remove(exhaust);
      missileExhausts.splice(i, 1);
    }
  }
  
  // --- Camera Follow for Missile or Reset to Sun ---
  if (paramsGUI.viewMode === "Missile") {
    if (missiles.length > 0) {
      // Follow the first active missile.
      const missile = missiles[0].mesh;
      // Adjusted offset for a more zoomed-out view.
      const followOffset = new THREE.Vector3(0, 2, -20);
      const desiredPos = missile.position.clone().add(followOffset);
      camera.position.lerp(desiredPos, 0.1);
      controls.target.lerp(missile.position, 0.1);
      controls.enabled = false;
      camera.fov = 50;
      camera.updateProjectionMatrix();
    } else {
      // No active missile: reset camera to the sun.
      sun.getWorldPosition(sunPos);
      camera.position.lerp(defaultCameraPos, 0.1);
      controls.target.lerp(sunPos, 0.1);
      controls.enabled = true;
      camera.fov = 20;
      camera.updateProjectionMatrix();
    }
  }


 

  

  


  // If viewMode is "Orbital", OrbitControls handle the camera.

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(renderloop);
};

renderloop();
