var module = {
  scene: null, camera: null, renderer: null,
  container: null, controls: null,
  clock: null, stats: null,
  dna_piece_geometry: null, pieces: null,

  init: function() {
    // Create main scene
    this.scene = new THREE.Scene();
    //this.scene.fog = new THREE.FogExp2(0xc8e0ff, 0.0003);

    var SCREEN_WIDTH = 1024; //window.innerWidth, 
    var SCREEN_HEIGHT = 500; //window.innerHeight;

    // Prepare perspective camera
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 1, FAR = 2000;
    this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    this.scene.add(this.camera);
    this.camera.position.set(0, 0, 50);
    this.camera.lookAt(new THREE.Vector3(0,0,0));

    // Prepare webgl renderer
    this.renderer = new THREE.WebGLRenderer({ antialias:true, alpha: true });
    this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    this.renderer.setClearColor( 0x000000, 0);

    // Prepare container
    this.container = document.getElementById("viewport");
    this.container.appendChild(this.renderer.domElement);

    // Events
    //THREEx.WindowResize(this.renderer, this.camera);

    // Prepare Orbit controls
    
    //this.camera.up.set( 1, 0, 0 );
    /*
    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.target = new THREE.Vector3(50, 0, 0);
    this.controls.update()
    this.controls.minDistance = 120;
    this.controls.maxDistance = 200;
    this.controls.enablePan = true;
    this.controls.autoRotate = true;
*/
    // Prepare clock
    this.clock = new THREE.Clock();

    // Add lights
    this.scene.add( new THREE.AmbientLight(0x111111));
    this.scene.add( new THREE.HemisphereLight( 0xffffff, 0x080820, 1 ) );

    // Load model
    this.loadScene(); 
  },
  loadScene: function() {
    var loader = new THREE.OBJLoader();

    // load base (podium) mesh
    /*loader.load('models/DNA_base.obj', function ( object ) {
      object.children[0].material = new THREE.MeshLambertMaterial( {color: 0x888888} );
      object.rotation.set(0, 0, -Math.PI / 2);// * Math.Pi);
      module.scene.add( object );
      }
    );*/

    // load piece mesh
    //loader.load('models/DNA_piece.obj', function ( object ) {
    loader.load('models/DNA_piece.obj', function ( object ) {
      dna_piece_geometry = object.children[0].geometry;// = blue_material;
    });
    this.pieces = [];
  },
  addPiece: function() {
    var piece = new THREE.Mesh(
      dna_piece_geometry,
      new THREE.MeshLambertMaterial( {color: Math.random() * 0xffffff} )
    );

    var angle = 60.0 // 14.4; //
    var height = 6.666 // 2.0; // 

    var i = this.pieces.length;
    var random_angle = (Math.random() * Math.PI * 2)
    piece.position.set(Math.random() * 10 * (i * height), 1000 * Math.sin(random_angle), 1000 * Math.cos(random_angle));

    if (i % 2 == 1) {
      piece.rotation.set((i-1)/2 * -angle * Math.PI / 180, 0, -Math.PI / 2);
      piece.target_position = new THREE.Vector3((i-1)/2 * height, 0, 0);
    } else {
      piece.rotation.set((i/2 * -angle + 180) * Math.PI / 180, 0, -Math.PI / 2);
      piece.target_position = new THREE.Vector3(i/2 * height, 0, 0);
    }
    module.scene.add(piece);
    //console.log(piece);
    this.pieces.push(piece);

    this.camera.target_position = new THREE.Vector3(i * height/4, 0, Math.max(40, 10 + (i * height/2) / Math.tan(45) ));
    //this.camera.position = (this.camera.target_position);
  }
};

// Animate the scene
function animate() {
  requestAnimationFrame(animate);
  update();
  render();
  
}

// Update controls and stats
function update() {
  var delta = module.clock.getDelta();

  if (module.camera.target_position !== undefined) {
    module.camera.position = module.camera.position.lerp(module.camera.target_position, 0.05);
  }

  if (module.controls != null) {
   module.controls.update(delta);
  }

  /*THREE.AnimationHandler.update(delta);*/
  for (var i = 0, il = module.pieces.length; i < il; i++) {
    piece = module.pieces[i];
    piece.position = piece.position.lerp(piece.target_position, 0.1);
  }
}

// Render the scene
function render() {
  if (module.renderer) {
    module.renderer.render(module.scene, module.camera);
  }
}

// Initialize lesson on page load
function initializeLesson() {
  module.init();
  animate();
}

if (window.addEventListener)
  window.addEventListener('load', initializeLesson, false);
else if (window.attachEvent)
  window.attachEvent('onload', initializeLesson);
else window.onload = initializeLesson;

