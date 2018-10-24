var module = {
  scene: null, camera: null, renderer: null,
  container: null, controls: null,
  clock: null, stats: null,
  dna_piece_geometry: null, pieces: null, last_choice: 0,

  init: function() {
    // Create main scene
    this.scene = new THREE.Scene();
    //this.scene.fog = new THREE.FogExp2(0xc8e0ff, 0.0003);

    this.container = document.getElementById("viewport");
    var SCREEN_WIDTH = this.container.offsetWidth; 
    var SCREEN_HEIGHT = this.container.offsetHeight;

    // Prepare perspective camera
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 1, FAR = 2000;
    this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    this.scene.add(this.camera);
    this.camera.position.set(0, 0, 50);
    this.camera.lookAt(new THREE.Vector3(0,0,0));
    this.camera.rotateAngle = 0.0;

    // Prepare webgl renderer
    this.renderer = new THREE.WebGLRenderer({ antialias:true, alpha: true });
    this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    this.renderer.setClearColor( 0x000000, 0);

    // Prepare container
    this.container.appendChild(this.renderer.domElement);

    // Events
    THREEx.WindowResize(this.container, this.renderer, this.camera);

    // Prepare Orbit controls
    /*
    //this.camera.up.set( 1, 0, 0 );
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
    this.scene.add( new THREE.AmbientLight(0x888888));
    this.scene.add( new THREE.HemisphereLight( 0xffffff, 0x080820, 0.8 ) );

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
      dna_piece_geometry.computeFaceNormals();
      dna_piece_geometry.computeVertexNormals(true);
    });
    this.pieces = [];
  },
  addPiece: function() {
    var i = this.pieces.length;

    // alternating colour OR random colour
    var col_choice = 0
    if (i % 2) {
      if (last_choice == 0) {
        col_choice = 1;
      }
      if (last_choice == 1) {
        col_choice = 0;
      }
      if (last_choice == 2) {
        col_choice = 3;
      }
      if (last_choice == 3) {
        col_choice = 2;
      }
    } else {
      col_choice = Math.floor(Math.random() * 4) ;
      last_choice = col_choice;
    }

    // get DNA geometry
    var cols = [0xF8766D, 0x7CAE00, 0x00BFC4, 0xC77CFF];
    var piece = new THREE.Mesh(
      dna_piece_geometry,
      new THREE.MeshLambertMaterial( {color: cols[col_choice]} )
    );
    var angle = 60.0 // 14.4; //
    var height = 6.666 // 2.0; // 
    
    // initial position
    var random_angle = (Math.random() * Math.PI * 2)
    piece.position.set(Math.random() * 10 * (i * height), 1000 * Math.sin(random_angle), 1000 * Math.cos(random_angle));

    // resting position
    if (i % 2 == 1) {
      piece.rotation.set((i-1)/2 * -angle * Math.PI / 180, 0, -Math.PI / 2);
      piece.target_position = new THREE.Vector3((i-1)/2 * height, 0, 0);
    } else {
      piece.rotation.set((i/2 * -angle + 180) * Math.PI / 180, 0, -Math.PI / 2);
      piece.target_position = new THREE.Vector3(i/2 * height, 0, 0);
    }
    module.scene.add(piece);
    this.pieces.push(piece);

    this.camera.target_position = new THREE.Vector3(i * height/4, 0, Math.max(40, (i * height/2) / Math.tan(45) ));
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

  /* update camera rotation */
  module.camera.rotateAngle += delta / 2;
  if (module.camera.target_position !== undefined) {
    var rad = module.camera.target_position.z * (750 / module.container.offsetWidth);
    var pan = module.camera.target_position.x;
    var rot = -module.camera.rotateAngle % (2 * Math.PI);
    
    var target_position = new THREE.Vector3(pan, rad * Math.sin(rot), rad * Math.cos(rot));
    module.camera.rotation.set(-rot, 0, 0);
    module.camera.position = module.camera.position.lerp(target_position, 1.0);

    // update light pos
    //console.log(module.camera.light.position);
    //module.camera.light.position.set(new THREE.Vector3(0, 1, 0));
    //module.camera.light.rotation.set(-rot, 0, 0);
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

