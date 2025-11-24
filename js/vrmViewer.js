class VRMViewer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, innerWidth/innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
        this.renderer.setSize(innerWidth, innerHeight);
        this.renderer.setPixelRatio(devicePixelRatio);
        this.scene.background = new THREE.Color(0x1a1a2e);
        this.scene.add(new THREE.AmbientLight(0xffffff, 2));
        this.scene.add(new THREE.DirectionalLight(0xffffff, 3));

        this.camera.position.set(0, 1.4, 2);
        this.controls = new THREE.OrbitControls(this.camera, this.canvas);
        this.controls.target.set(0, 1.3, 0);
        this.clock = new THREE.Clock();

        this.loadVRM();
        this.animate();
    }

    async loadVRM() {
        const loader = new THREE.GLTFLoader();
        loader.register(p => new VRM.VRMLoaderPlugin(p));

        try {
            console.log("Loading /assets/tererst.vrm ...");
            const gltf = await loader.loadAsync('/assets/tererst.vrm');
            this.vrm = await VRM.from(gltf);
            this.vrm.scene.rotation.y = Math.PI;
            this.scene.add(this.vrm.scene);
            console.log("TERERST.VRM MUNCUL GILA COY!!!");
        } catch (e) {
            console.error("Gagal load VRM:", e);
            this.loadFallback();
        }
    }

    async loadFallback() {
        try {
            const gltf = await new THREE.GLTFLoader().loadAsync('https://cdn.jsdelivr.net/gh/pixiv/three-vrm@release/packages/three-vrm/examples/models/AliciaSolid.vrm');
            this.vrm = await VRM.from(gltf);
            this.vrm.scene.rotation.y = Math.PI;
            this.scene.add(this.vrm.scene);
            console.log("Fallback AliciaSolid muncul");
        } catch (e) {
            document.body.innerHTML += "<h1 style='color:red;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)'>VRM GAGAL LOAD</h1>";
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (this.vrm) this.vrm.update(this.clock.getDelta());
        this.renderer.render(this.scene, this.camera);
    }

    setAnimating(yes) {
        if (this.vrm && this.vrm.expressionManager) {
            this.vrm.expressionManager.setValue('a', yes ? 0.8 : 0);
        }
    }
}

// INIT SETELAH SEMUA LIBRARY SIAP
function initWhenReady() {
    if (window.THREE && window.VRM && window.VRMLoaderPlugin) {
        window.vrmViewer = new VRMViewer('vrmCanvas');
    } else {
        setTimeout(initWhenReady, 200);
    }
}

// Load library
['https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.min.js',
 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/js/controls/OrbitControls.js',
 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/js/loaders/GLTFLoader.js',
 'https://cdn.jsdelivr.net/npm/@pixiv/three-vrm@3.4.4/lib/three-vrm.min.js']
 .forEach(src => {
     const s = document.createElement('script');
     s.src = src;
     document.head.appendChild(s);
 });

initWhenReady();