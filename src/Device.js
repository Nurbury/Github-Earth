import ResLoader from './ResLoader.js'
import { bl, _l_pause, _l_resume } from './GlobalData.js'
import { Ul } from './Tool.js'
import Stage from './Stage.js'

export default class Device {
  constructor(t) {
    for (let i in t) {
      bl[i] = t[i]
    }
        this.init = this.init.bind(this),
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this),
        function(t) {
            for (const [e,n] of Object.entries(t))
                bl[e] = n
        }({
            app: this,
            env: "production",
            imagePath: "images/",
            dataPath: "data/",
            isMobile: /iPhone|iPad|iPod|Android|BlackBerry|BB10/i.test(navigator.userAgent),
            pixelRatio: window.devicePixelRatio || 1,
        })
    }
    loadAssets() {
        const {basePath: t, imagePath: e} = bl
          , n = [{
            url: `${t}${e}particle-diffuse.png`,
            id: "particleDiffuse"
        }, {
            url: `${t}${e}map.png`,
            id: "worldMap"
        }]
          , i = new ResLoader();
        return new Promise(((t,e)=>{
            i.load(n).then((({assets: e})=>{
                t(e),
                i.dispose()
            }
            )).catch((t=>e(t)))
        }
        ))
    }
    async loadData() {
        try {
            const t = await Ul(`${bl.basePath}${bl.dataPath}data.json`);
            if (!t || 0 === t.length)
                throw new Error("WebGL Globe: data.json response was empty");
            return t
        } catch (e){
            return await this.loadFallbackData()
        }
    }
    async loadFallbackData() {
        try {
            const t = await Ul(`${bl.basePath}${bl.dataPath}fallback.json`);
            if (!t || 0 === t.length)
                throw new Error("WebGL Globe: fallback.json response was empty");
            return t
        } catch (t) {
            throw new Error(t)
        }
    }
    filterData(t) {
        const e = [];
        for (let r = 0; r < t.length; r++) {
            const n = t[r]
              , i = n.gop
              , s = n.gm;
            (i || s) && (n.gop = i || s,
            n.gm = s || i,
            n.uol = n.uol || n.uml,
            n.uml = n.uml || n.uol,
            n.gop.lat && n.gop.lon && n.gm.lat && n.gm.lon && (n.oa || n.ma) && e.splice(Math.floor(Math.random() * e.length), 0, n))
        }
        const n = e.slice(e.length - 60, e.length)
          , i = e.slice(0, 60);
        return n.concat(e, i)
    }
    trackPageVisibility() {
        let t, e;
        void 0 !== document.hidden ? (t = "hidden",
        e = "visibilitychange") : void 0 !== document.msHidden ? (t = "msHidden",
        e = "msvisibilitychange") : void 0 !== document.webkitHidden && (t = "webkitHidden",
        e = "webkitvisibilitychange"),
        this.documentHidden = t,
        this.visibilityChange = e,
        document.addEventListener(e, this.handleVisibilityChange, !1)
    }
    init() {
        return new Promise(((t,e)=>{
            this.loadAssets().then((n=>{
                bl.assets = n;
                const {parentNode: i=document.body} = bl;
                this.loadData().then((e=>{
                    bl.data = this.filterData(e),
                    this.webglController = new Stage(i),
                    this.webglController.initDataObjects(bl.data),
                    this.webglController.transitionIn(1.5, .6),
                    this.trackPageVisibility(),
                    t()
                }
                )).catch((t => {
                  console.error(t);
                    Ol(),
                    e(t)
                }
                ))
            }
            )).catch((t=>{
                e(t)
            }
            ))
        }
        ))
    }
    handleVisibilityChange() {
        document[this.documentHidden] ? _l_pause.dispatch() : _l_resume.dispatch()
    }
    get renderer() {
        return this.webglController ? this.webglController.renderer : null
    }
    get canvas() {
        return this.webglController ? this.webglController.renderer.domElement : null
    }
    dispose() {
        document.removeEventListener(this.visibilityChange, this.handleVisibilityChange),
        this.webglController.dispose(),
        this.webglController = null,
        this.visibilityChange = null,
        this.documentHidden = null,
        Object.keys(bl).forEach((t=>{
            delete bl[t]
        }
        ))
    }
}
