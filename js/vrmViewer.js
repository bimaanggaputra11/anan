// vrmViewer.js — FIX FINAL 2025 (PASTI MUNCUL LANGSUNG)

class VRMViewer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.scene.background = new THREE.Color(0x1a1a2e);

        // Lampu terang banget
        this.scene.add(new THREE.AmbientLight(0xffffff, 2));
        this.scene.add(new THREE.DirectionalLight(0xffffff, 3));

        this.camera.position.set(0, 1.4, 2);
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, 1.3, 0);
        this.controls.update();

        this.clock = new THREE.Clock();
        this.vrm = null;

        // LANGSUNG LOAD MODEL KAMU
        this.loadVRM();
        this.animate();
    }

    async loadVRM() {
        const loader = new THREE.GLTFLoader();
        loader.register(parser => new VRM.VRMLoaderPlugin(parser));

        try {
            console.log("Loading tererst.vrm dari assets/ ...");
            const gltf = await loader.loadAsync('assets/tererst.vrm');
            this.vrm = await VRM.from(gltf);

            this.vrm.scene.rotation.y = Math.PI;
            this.scene.add(this.vrm.scene);

            console.log("tererst.vrm MUNCUL 100% GILA COY!!!");
        } catch (e) {
            console.error("Gagal load VRM:", e);
            this.showErrorText();
        }
    }

    showErrorText() {
        const text = document.createElement('div');
        text.innerHTML = '<h1 style="color:red;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:999">VRM GAGAL LOAD<br>CEK CONSOLE</h1>';
        document.body.appendChild(text);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const delta = this.clock.getDelta();

        if (this.vrm) {
            this.vrm.update(delta);

            // Kedip otomatis
            const t = Date.now() * 0.001;
            this.vrm.expressionManager?.setValue('blink', Math.sin(t * 8) > 0.99 ? 1 : 0);

            // Gerak mulut kalau lagi bicara
            if (window.isSpeaking) {
                this.vrm.expressionManager?.setValue('a', 0.5 + Math.random() * 0.4);
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    setAnimating(yes) {
        window.isSpeaking = yes;
    }
}

// JALAN SETELAH SEMUA LIBRARY KELOAD
function initVRM() {
    if (window.THREE && window.VRM && window.VRMLoaderPlugin) {
        window.vrmViewer = new VRMViewer('vrmCanvas');
    } else {
        setTimeout(initVRM, 200);
    }
}

// Load library (pasti jalan)
const scripts = [
    'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.min.js',
    'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/js/controls/OrbitControls.js',
    'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/js/loaders/GLTFLoader.js',
    'https://cdn.jsdelivr.net/npm/@pixiv/three-vrm@3.4.4/lib/three-vrm.min.js'
];

scripts.forEach(src => {
    const s = document.createElement('script');
    s.src = src;
    document.head.appendChild(s);
});

initVRM();