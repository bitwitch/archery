// globals
var mouse_sensitivity = { x: 0.002, y: 0.002 };
var power = 0;
var max_power = 1;

var max_pullback_length = 8;
var draw_speed = 0.03;

var shoot_strength = 10;

var USE_WIREFRAME = false;

var clock = new THREE.Clock();

var scene = new THREE.Scene();
scene.background = new THREE.Color( 0x88ccff );

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.rotation.order = 'YXZ';
camera.position.y = 30;

var ambientlight = new THREE.AmbientLight( 0x6688cc );
scene.add( ambientlight );

//var fillLight1 = new THREE.DirectionalLight( 0xff9999, 0.5 );
//fillLight1.position.set( -1, 1, -2 );
//scene.add( fillLight1 );

//var fillLight2 = new THREE.DirectionalLight( 0x8888ff, 0.2 );
//fillLight2.position.set( 0, -1, -1 );
//scene.add( fillLight2 );

var directionalLight = new THREE.DirectionalLight( 0xffffaa, 0.3 );
directionalLight.position.set( - 5, 25, - 1 );
directionalLight.castShadow = true;
directionalLight.shadow.camera.near = 0.01;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.right = 30;
directionalLight.shadow.camera.left = - 30;
directionalLight.shadow.camera.top	= 30;
directionalLight.shadow.camera.bottom = - 30;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.radius = 4;
directionalLight.shadow.bias = - 0.00006;
scene.add( directionalLight );

var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;

var container = document.getElementById( 'container' );

container.appendChild( renderer.domElement );

var stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';

container.appendChild( stats.domElement );


// Create bow
var bow_geometry = new THREE.BoxGeometry(1, 30, 1);
var bow_material = new THREE.MeshPhongMaterial({ color: 0xCAB192 });
var bow = new THREE.Mesh(bow_geometry, bow_material);
bow.position.z = -10;
camera.add(bow);
scene.add(camera);

// Create arrow
var arrow_geometry = new THREE.BoxGeometry(0.5, 0.5, 20);
var arrow_material = new THREE.MeshBasicMaterial({ color: 0x666666 });
var arrow_rot_y = -6;

var arrow = new THREE.Mesh(arrow_geometry, arrow_material);
arrow.rotateY(arrow_rot_y);
arrow.position.z = -3;
arrow.velocity = new THREE.Vector3();
arrow.acceleration = new THREE.Vector3();
arrow.fired = false;

bow.add(arrow);


// Create Scene
var ground = new THREE.Mesh(
  new THREE.PlaneGeometry(400,400,1,1),
  new THREE.MeshPhongMaterial({ color: 0x9DC989})
);
ground.position.y = 0;
ground.rotation.x -= Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);


var cube_geometry = new THREE.BoxGeometry(10, 10, 10);
var cube_material = new THREE.MeshPhongMaterial({ color: 0x23A970 });
var cube = new THREE.Mesh(cube_geometry, cube_material);
cube.position.y = 5;
cube.position.z = -30;
scene.add(cube);

var cylinder_geometry = new THREE.CylinderGeometry(10, 10, 2, 10);
var target_material = new THREE.MeshPhongMaterial({ color: 0xE39FBA });


var target_01 = new THREE.Mesh(cylinder_geometry, target_material);
target_01.rotateX(-Math.PI / 2);
target_01.position.set(0, 13, -100);
scene.add(target_01);

var target_02 = new THREE.Mesh(cylinder_geometry, target_material);
target_02.rotateX(-Math.PI / 2);
target_02.position.set(-30, 13, -130);
scene.add(target_02);

var target_03 = new THREE.Mesh(cylinder_geometry, target_material);
target_03.rotateX(-Math.PI / 2);
target_03.position.set(30, 13, -130);
scene.add(target_03);

//var target_04 = new THREE.Mesh(cylinder_geometry, target_material);
//target_04.rotateX(-Math.PI / 2);
//target_04.rotateZ(-Math.PI / 2);
//target_04.position.set(-100, 13, 0);
//scene.add(target_04);




// Input
var keyStates = {};
var is_mouse_down = false;

document.addEventListener( 'keydown', ( event ) => {
  keyStates[ event.code ] = true;
});

document.addEventListener( 'keyup', ( event ) => {
  keyStates[ event.code ] = false;
});

document.addEventListener( 'mousedown', mouse_down);

document.addEventListener( 'mouseup', mouse_up);

document.body.addEventListener( 'mousemove', move_camera );

function mouse_down(e) {
  if (document.pointerLockElement != document.body) {
    document.body.requestPointerLock();
    return;
  } 

  power = 0;
  is_mouse_down = true;
}

function mouse_up(e) {
  is_mouse_down = false;
}

function move_camera(e) {
  if (document.pointerLockElement != document.body)
    return;
  
  camera.rotation.y -= e.movementX * mouse_sensitivity.x;
  camera.rotation.x -= e.movementY * mouse_sensitivity.y;
}

window.addEventListener( 'resize', onWindowResize );

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

document.addEventListener( 'click', () => {
  //var sphere = spheres[ sphereIdx ];

  //camera.getWorldDirection( playerDirection );

  //sphere.collider.center.copy( playerCollider.end );
  //sphere.velocity.copy( playerDirection ).multiplyScalar( 30 );

  //sphereIdx = ( sphereIdx + 1 ) % spheres.length;

});

//function playerCollitions() {

  //var result = worldOctree.capsuleIntersect( playerCollider );

  //playerOnFloor = false;

  //if ( result ) {

    //playerOnFloor = result.normal.y > 0;

    //if ( ! playerOnFloor ) {

      //playerVelocity.addScaledVector( result.normal, - result.normal.dot( playerVelocity ) );

    //}

    //playerCollider.translate( result.normal.multiplyScalar( result.depth ) );

  //}

//}

//function updatePlayer( dt ) {

  //if ( playerOnFloor ) {

    //var damping = Math.exp( - 3 * dt ) - 1;
    //playerVelocity.addScaledVector( playerVelocity, damping );

  //} else {

    //playerVelocity.y -= GRAVITY * dt;

  //}

  //var deltaPosition = playerVelocity.clone().multiplyScalar( dt );
  //playerCollider.translate( deltaPosition );

  //playerCollitions();

  //camera.position.copy( playerCollider.end );

//}

//function spheresCollisions() {

  //for ( let i = 0; i < spheres.length; i ++ ) {

    //var s1 = spheres[ i ];

    //for ( let j = i + 1; j < spheres.length; j ++ ) {

      //var s2 = spheres[ j ];

      //var d2 = s1.collider.center.distanceToSquared( s2.collider.center );
      //var r = s1.collider.radius + s2.collider.radius;
      //var r2 = r * r;

      //if ( d2 < r2 ) {

        //var normal = s1.collider.clone().center.sub( s2.collider.center ).normalize();
        //var v1 = normal.clone().multiplyScalar( normal.dot( s1.velocity ) );
        //var v2 = normal.clone().multiplyScalar( normal.dot( s2.velocity ) );
        //s1.velocity.add( v2 ).sub( v1 );
        //s2.velocity.add( v1 ).sub( v2 );

        //var d = ( r - Math.sqrt( d2 ) ) / 2;

        //s1.collider.center.addScaledVector( normal, d );
        //s2.collider.center.addScaledVector( normal, - d );

      //}

    //}

  //}

//}

//function updateSpheres( dt ) {

  //spheres.forEach( sphere =>{

    //sphere.collider.center.addScaledVector( sphere.velocity, dt );

    //var result = worldOctree.sphereIntersect( sphere.collider );

    //if ( result ) {

      //sphere.velocity.addScaledVector( result.normal, - result.normal.dot( sphere.velocity ) * 1.5 );
      //sphere.collider.center.add( result.normal.multiplyScalar( result.depth ) );

    //} else {

      //sphere.velocity.y -= GRAVITY * dt;

    //}

    //var damping = Math.exp( - 1.5 * dt ) - 1;
    //sphere.velocity.addScaledVector( sphere.velocity, damping );

    //spheresCollisions();

    //sphere.mesh.position.copy( sphere.collider.center );

  //} );

//}

function getForwardVector() {
  camera.getWorldDirection( playerDirection );
  playerDirection.y = 0;
  playerDirection.normalize();

  return playerDirection;
}

function getSideVector() {
  camera.getWorldDirection( playerDirection );
  playerDirection.y = 0;
  playerDirection.normalize();
  playerDirection.cross( camera.up );

  return playerDirection;
}

//function controls( dt ) {

  //var speed = 25;

  //if ( playerOnFloor ) {

    //if ( keyStates[ 'KeyW' ] ) {

      //playerVelocity.add( getForwardVector().multiplyScalar( speed * dt ) );

    //}

    //if ( keyStates[ 'KeyS' ] ) {

      //playerVelocity.add( getForwardVector().multiplyScalar( - speed * dt ) );

    //}

    //if ( keyStates[ 'KeyA' ] ) {

      //playerVelocity.add( getSideVector().multiplyScalar( - speed * dt ) );

    //}

    //if ( keyStates[ 'KeyD' ] ) {

      //playerVelocity.add( getSideVector().multiplyScalar( speed * dt ) );

    //}

    //if ( keyStates[ 'Space' ] ) {

      //playerVelocity.y = 15;

    //}

  //}

//}

//var loader = new GLTFLoader().setPath( './models/gltf/' );

//loader.load( 'collision-world.glb', ( gltf ) => {

  //scene.add( gltf.scene );

  //worldOctree.fromGraphNode( gltf.scene );

  //gltf.scene.traverse( child => {

    //if ( child.isMesh ) {

      //child.castShadow = true;
      //child.receiveShadow = true;

      //if ( child.material.map ) {

        //child.material.map.anisotropy = 8;

      //}

    //}

  //} );

  //animate();

//} );

function lerp(a,b,x) { return a + (b-a)*x; }

function update_bow(dt) {
  //var time = Date.now() * 0.002;
  //bow.position.y = camera.position.y - 0.5 + Math.sin(time) * 0.01;


  // pull back bow to build power 
  if (is_mouse_down) {
    power = lerp(power, max_power, draw_speed);
    var pullback_length = power * max_pullback_length;
    arrow.position.z = bow.position.z + pullback_length;

  } else if (power > 0) {
    // fire arrow
    arrow.fired = true;

    // remove arrow as child of bow
    scene.attach(arrow);

    // get arrow shoot direction
    camera.getWorldDirection(arrow.acceleration);
    arrow.acceleration.normalize();
    var arrow_skew = new THREE.Quaternion().setFromAxisAngle(camera.up, arrow_rot_y);
    arrow.acceleration.applyQuaternion(arrow_skew);

    // multiply shot strength
    arrow.acceleration.multiplyScalar(shoot_strength * power);

    power = 0;
  }
}

function update_arrow(dt) {
  if (!arrow.fired) return;

  // apply acceleration 
  arrow.velocity.add( arrow.acceleration.clone().multiplyScalar(dt) );
  arrow.position.add( arrow.velocity );

}

function animate() {

  var dt = Math.min( 0.1, clock.getDelta() );

  //controls( dt );

  //updatePlayer( dt );

  //updateSpheres( dt );

  update_bow(dt);

  update_arrow(dt);

  renderer.render( scene, camera );

  stats.update();

  requestAnimationFrame( animate );

}

animate();
