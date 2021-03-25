// globals
var collidables = [];
var mouse_sensitivity = { x: 0.002, y: 0.002 };
var power = 0;
var max_power = 1;
var gravity = 1;
var max_pullback_length = 8;
var draw_speed = 0.07;
var shoot_strength = 10;
var clock = new THREE.Clock();

var scene = new THREE.Scene();
scene.background = new THREE.Color( 0x88ccff );
scene.fog = new THREE.Fog( 0x88CCFF, 100, 400 );
//scene.fog = new THREE.FogExp2( 0x88CCFF, 0.0025 );

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
//directionalLight.position.set( - 5, 25, - 1 );
directionalLight.position.set( 50, 200, 100);
directionalLight.position.multiplyScalar( 1.3 );

directionalLight.castShadow = true;
directionalLight.shadow.camera.near = 0.01;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.right = 500;
directionalLight.shadow.camera.left = - 500;
directionalLight.shadow.camera.top	= 500;
directionalLight.shadow.camera.bottom = - 500;
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

//var stats = new Stats();
//stats.domElement.style.position = 'absolute';
//stats.domElement.style.top = '0px';

//container.appendChild( stats.domElement );


// Create bow
var bow_geometry = new THREE.BoxGeometry(1, 30, 1);
var bow_material = new THREE.MeshLambertMaterial({ color: 0xCAB192 });
var bow = new THREE.Mesh(bow_geometry, bow_material);
bow.position.z = -10;
camera.add(bow);
scene.add(camera);

// Create arrow
var max_arrows = 10;
var arrows = [];
var arrow_length = 20;
var arrow_rot_y = -6;
var arrow_drag = -1;
var arrow_geometry = new THREE.BoxGeometry(0.5, 0.5, arrow_length);
var arrow_material = new THREE.MeshBasicMaterial({ color: 0xEEFFEE });

function Arrow() {
  var arrow = new THREE.Mesh(arrow_geometry, arrow_material);
  arrow.velocity = new THREE.Vector3();
  arrow.acceleration = new THREE.Vector3();
  arrow.state = 'idle';
  return arrow;
}

// generate arrow pool
for (var i=0; i<max_arrows; i++) {
  arrows.push(Arrow());
}

// function to retrieve next arrow from pool
var get_arrow = function() {
  var next_index = 0;
  return function() {
    var next_arrow = arrows[next_index++];
    next_arrow.acceleration.set(0,0,0);
    next_arrow.velocity.set(0,0,0);
    next_arrow.position.set(0,0,-3);
    next_arrow.rotation.set(0,arrow_rot_y,0);
    next_arrow.state = 'reload';

    if (next_index >= max_arrows)
      next_index = 0;

    return next_arrow;
  }
}();

var current_arrow = get_arrow();
bow.add(current_arrow);


// Create Scene
var ground = new THREE.Mesh(
  new THREE.PlaneGeometry(10000,10000),
  new THREE.MeshLambertMaterial({ color: 0x9DC989})
);
ground.position.set(0,0,-100);
ground.rotation.x -= Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);


var cube_geometry = new THREE.BoxGeometry(10, 10, 10);
var cube_material = new THREE.MeshLambertMaterial({ color: 0x23A970 });
var cube = new THREE.Mesh(cube_geometry, cube_material);
cube.position.y = 5;
cube.position.z = -30;
scene.add(cube);


// trees

var num_trees_per_side = 6;
var trunk_height = 75;

var trunk_geometry   = new THREE.BoxGeometry(10, trunk_height, 10);
var trunk_material   = new THREE.MeshLambertMaterial({ color: 0x664516 });
var treetop_geometry = new THREE.BoxGeometry(40, 40, 40);
var treetop_material = new THREE.MeshLambertMaterial({ color: 0x22A869 });

for (var i=0; i<num_trees_per_side; i++) {
  // make left tree
  var trunk = new THREE.Mesh(trunk_geometry, trunk_material, num_trees_per_side*2);
  var treetop = new THREE.Mesh(treetop_geometry, treetop_material, num_trees_per_side*2);
  trunk.position.set(90, 0.5*trunk_height, -75 * (i - 1));
  treetop.position.set(90, trunk_height, -75 * (i - 1));
  scene.add(trunk);
  scene.add(treetop);

  // make right tree
  trunk = new THREE.Mesh(trunk_geometry, trunk_material, num_trees_per_side*2);
  treetop = new THREE.Mesh(treetop_geometry, treetop_material, num_trees_per_side*2);
  trunk.position.set(-90, 0.5*trunk_height, -75 * (i - 1));
  treetop.position.set(-90, trunk_height, -75 * (i - 1));
  scene.add(trunk);
  scene.add(treetop);


}


// targets
var cylinder_geometry = new THREE.CylinderGeometry(10, 10, 5, 10);
var target_material = new THREE.MeshLambertMaterial({ color: 0xE39FBA });

var target_01 = new THREE.Mesh(cylinder_geometry, target_material);
target_01.rotateX(-Math.PI / 2);
target_01.position.set(0, 13, -100);
scene.add(target_01);
collidables.push(target_01);

var target_02 = new THREE.Mesh(cylinder_geometry, target_material);
target_02.rotateX(-Math.PI / 2);
target_02.position.set(-30, 13, -130);
scene.add(target_02);
collidables.push(target_02);

var target_03 = new THREE.Mesh(cylinder_geometry, target_material);
target_03.rotateX(-Math.PI / 2);
target_03.position.set(30, 13, -130);
scene.add(target_03);
collidables.push(target_03);

//var target_04 = new THREE.Mesh(cylinder_geometry, target_material);
//target_04.rotateX(-Math.PI / 2);
//target_04.rotateZ(-Math.PI / 2);
//target_04.position.set(-100, 13, 0);
//scene.add(target_04);




// Input
var keyStates = {};
var is_mouse_down = false;

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

function lerp(a,b,x) { return a + (b-a)*x; }

function update_bow(dt) {
  //var time = Date.now() * 0.002;
  //bow.position.y = camera.position.y - 0.5 + Math.sin(time) * 0.01;

  // pull back bow to build power 
  if (is_mouse_down) {
    power = lerp(power, max_power, draw_speed);
    var pullback_length = power * max_pullback_length;
    current_arrow.position.z = bow.position.z + pullback_length;

  } else if (power > 0) {
    // fire arrow
    current_arrow.state = 'normal';

    // remove arrow as child of bow
    scene.attach(current_arrow);

    // get arrow shoot direction
    var arrow_direction = new THREE.Vector3();
    camera.getWorldDirection(arrow_direction);
    current_arrow.velocity.copy(arrow_direction).normalize();
    var arrow_skew = new THREE.Quaternion().setFromAxisAngle(camera.up, arrow_rot_y);
    current_arrow.velocity.applyQuaternion(arrow_skew);

    // multiply shot strength
    current_arrow.velocity.multiplyScalar(shoot_strength * power);

    // set acceleration due to gravity and drag
    current_arrow.acceleration = new THREE.Vector3(0, -gravity, 0);
    current_arrow.acceleration.sub(arrow_direction.multiplyScalar(arrow_drag));
    

    // get a new arrow
    current_arrow = get_arrow();
    bow.add(current_arrow);
    current_arrow.position.set(0,10,-3);

    power = 0;
  }
}

function update_arrow(arrow, dt) {
  switch (arrow.state) {
    case 'normal': arrow_normal(arrow, dt); break;  
    case 'reload': arrow_reload(arrow, dt); break;  
    case 'idle': break;
    default: break;
  }
}

var position_loaded_arrow = new THREE.Vector3(0,0,-3);

function arrow_reload(arrow, dt) {
  arrow.position.lerp(position_loaded_arrow, 0.2);

  if (arrow.position.distanceTo(position_loaded_arrow) < 0.1) {
    arrow.position.copy(position_loaded_arrow);
    arrow.state = 'normal';
  }
}

function arrow_normal(arrow, dt) {
  // calculate movement
  var new_velocity = arrow.velocity.clone().add( arrow.acceleration.clone().multiplyScalar(dt) );
  var new_position = arrow.position.clone().add( new_velocity );

  // simple ground collision test
  if (new_position.y < 0.3) {
    new_position.y = 0.3
    arrow.acceleration.multiplyScalar(0);
    new_velocity.multiplyScalar(0);
    arrow.state = 'idle';

  // check target collisions
  } else {

    // cast a ray from old position to new position
    var distance_travelled = arrow.position.distanceTo(new_position);
    var arrow_direction = arrow.velocity.clone().normalize();
    //var arrow_tip = arrow.position.clone().add(arrow_direction.multiplyScalar(0.5*arrow_length));

    var ray = new THREE.Raycaster(arrow.position, arrow_direction, 0, distance_travelled);
    var collision_results = ray.intersectObjects(collidables);
    if (collision_results.length > 0) { 
      // move arrow back to where it collided
      var position_correction = arrow_direction.clone().multiplyScalar(collision_results[0].distance);
      new_position = arrow.position.clone().add(position_correction);
      
      // stop arrow
      arrow.acceleration.multiplyScalar(0);
      new_velocity.multiplyScalar(0);
      arrow.state = 'idle';
    }

  }

  // move arrow
  arrow.velocity.copy(new_velocity);
  arrow.position.copy(new_position);
}

function animate() {

  var dt = Math.min( 0.1, clock.getDelta() );

  //controls( dt );

  //updatePlayer( dt );

  //updateSpheres( dt );

  update_bow(dt);

  for (var i=0; i<arrows.length; i++) {
    update_arrow(arrows[i], dt);
  }

  renderer.render( scene, camera );

  //stats.update();

  requestAnimationFrame( animate );

}

function init(e) {
  document.body.requestPointerLock();

  container.appendChild( renderer.domElement );

  document.addEventListener( 'keydown', ( event ) => {
    keyStates[ event.code ] = true;
  });

  document.addEventListener( 'keyup', ( event ) => {
    keyStates[ event.code ] = false;
  });

  document.addEventListener( 'mousedown', mouse_down);

  document.addEventListener( 'mouseup', mouse_up);

  document.body.addEventListener( 'mousemove', move_camera );

  document.querySelector('.instructions').style.display = 'none';

  animate();
}

//
//
//   
//
//
// --------------------------------------------------------------------------

var start_button = document.getElementById("start");
start_button.addEventListener("click", init);

