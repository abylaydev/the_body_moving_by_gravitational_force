"use strict"
import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import * as CANNON from 'cannon-es'

/**
 * Debug
 */

// debugObject.mass = ()=> {
// }
// gui.add(debugObject, 'addVelocity')




/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
])

/*
Physics*/

const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase(world)
// world.allowSleep = true

world.gravity.set(0, -4.905, -8.5347)

// materials
const defaultMaterial = new CANNON.Material('default')
const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 1,
        restitution: 0
    }
)
world.addContactMaterial(defaultContactMaterial)
world.defaultContactMaterial = defaultContactMaterial



const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
floorBody.mass = 0
floorBody.addShape(floorShape)
floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1, 0, 0),
    (Math.PI/180)*30
)
world.addBody(floorBody)




/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100, 100, 100),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5,
        // wireframe: true
    }) 
)
floor.receiveShadow = true
floor.rotation.x = (- Math.PI/180)*30
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 1000)
scene.add(camera)
camera.position.set(-25, 1, 5 )
camera.lookAt(-10, 0.75, 0.5)


// Controls
// const controls = new OrbitControls(camera, canvas)


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//shpere
const objectToUpdateBody = []
    
const sphereBody = new CANNON.Body({ mass: 1 })
const sphereShape = new CANNON.Sphere(0.5)
    sphereBody.material = defaultMaterial
    sphereBody.addShape(sphereShape)
    sphereBody.position.x = -10


const sphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 20, 20),
    new THREE.MeshStandardMaterial({
        metalness: 0.5,
        roughness: 0.4,
        envMap: environmentMapTexture
    })
)
sphereMesh.castShadow = true


objectToUpdateBody.push({sphereBody, sphereMesh})

const gui = new dat.GUI()

const debugObject = {}
gui
    .add(sphereBody.position, 'y')
    .setValue(5)
    .min(5)
    .max(10)
    .step(0.01)
    .name('position')
gui
    .add(camera.rotation, 'x')
    .setValue(1)
    .min(-2)
    .max(2)
    .step(0.01)
    .name('camera x')
const addVelocity = ()=> {

    sphereBody.position
    scene.add(sphereMesh)
    world.addBody(sphereBody)

}





const addvelo = document.querySelector(`.addvelo`)
addvelo.addEventListener('click', addVelocity)

const stop =()=> {
    for(const objects of objectToUpdateBody) 
    {
        // sphereBody.position.y = 0
        // sphereBody.velocity.y = 0
        world.removeBody(objects.sphereBody)
        scene.remove(objects.sphereMesh)
    }
}
const reset = document.querySelector(`.reset`)
reset.addEventListener('click', stop)



const floorPositionCopy = []

//horizont
const floorMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1,0.1,10),
    new THREE.MeshStandardMaterial({
        color: 0xff0000,
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5,
    })
)
floorMesh.receiveShadow = true

scene.add(floorMesh)

const horizontShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.05, 5))
const horizontBody = new CANNON.Body()
horizontBody.mass = 0
horizontBody.addShape(horizontShape)
horizontBody.position = new CANNON.Vec3(-10, 5.5, -0.53)
horizontBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(1, 0, 0),
    (Math.PI /180)*90
)
world.addBody(horizontBody)
floorPositionCopy.push({floorMesh, horizontBody})
for(const floors of floorPositionCopy) {
    floors.floorMesh.position.copy(floors.horizontBody.position)
    floors.floorMesh.quaternion.copy(floors.horizontBody.quaternion)
}
//Cylinder
const cylinderPositionCopy = []
const cylinderMesh = new THREE.Mesh(
new THREE.BoxGeometry(1, 1, 1),
new THREE.MeshStandardMaterial({
    color: 0xff0000,
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5,
})
)
scene.add(cylinderMesh)

const cylinderShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
const cylinderBody = new CANNON.Body()
cylinderBody.mass = 0
cylinderBody.addShape(cylinderShape)
cylinderBody.position = new CANNON.Vec3(-10, 0.75, 0.5)
// cylinderBody.quaternion.setFromAxisAngle(
//     new CANNON.Vec3(-1, 0, 0),
//     (Math.PI / 180)*70)
world.addBody(cylinderBody)
cylinderPositionCopy.push({cylinderBody, cylinderMesh})

for(const cylinders of cylinderPositionCopy){
    cylinders.cylinderMesh.position.copy(cylinders.cylinderBody.position)
    cylinders.cylinderMesh.quaternion.copy(cylinders.cylinderBody.quaternion)
}

const axesHelper1 = new THREE.AxesHelper(25)
// const axesHelper2 = new THREE.AxesHelper(15)
axesHelper1.position.set(-15,0,0)
axesHelper1.rotation.set(Math.PI/3,0,0)
scene.add(axesHelper1)


/**
 * Animate
*/
const clock = new THREE.Clock()
let oldElapsedTime = 0

// const timer =()=>{
//     const uaqit = clock.getElapsedTime()
//     const delta = uaqit - oldElapsedTime
//     oldElapsedTime = uaqit

//     window.requestAnimationFrame(timer)
// }
// timer()



const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime
    
    
    //update physics world
    world.step(1/60, deltaTime, 3)


    const stopwatch = document.querySelector('#stopwatch')



for(const objects of objectToUpdateBody){
    objects.sphereMesh.position.copy(objects.sphereBody.position)
    objects.sphereMesh.quaternion.copy(objects.sphereBody.quaternion)
    }


    // Update controls

    // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}


tick()