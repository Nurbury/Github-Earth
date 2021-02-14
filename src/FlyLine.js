import { bl, _l_pause, _l_resume } from './GlobalData.js'
import { Rl, Dl,Cl,Ll,Pl } from './Tool3d.js'

export default class FlyLine {
    constructor(t) {
        this.props = t,
        this.init()
    }
    init() {
        const {data: t, radius: e=1, camera: n, maxAmount: i=t.length, maxIndexDistance: r, visibleIndex: s, colors: o} = this.props
          , {parentNode: c, lineWidth: h, pixelRatio: u} = bl;
        this.mesh = new THREE.Group(),
        this.mesh.name = "FlyLine"
        this.isAnimating = [],
        this.animatingLandingsOut = [],
        this.landings = [],
        this.lineMeshes = [],
        this.lineHitMeshes = [],
        this.highlightedMesh,
        this.colors = o,
        this.landingGeo = new THREE.CircleBufferGeometry(.35,8),
        this.TUBE_RADIUS_SEGMENTS = 3,
        this.HIT_DETAIL_FRACTION = 4,
        this.DATA_INCREMENT_SPEED = 1.5,
        this.PAUSE_LENGTH_FACTOR = 2,
        this.MIN_PAUSE = 3e3,
        this.visibleIndex = 0,
        this.lineAnimationSpeed = 600;
        const d = new THREE.Vector3
          , f = new THREE.Vector3;
        this.tubeMaterial = new THREE.MeshBasicMaterial({
            blending: 2,
            opacity: .95,
            transparent: !0,
            color: this.colors.mergedPrColor
        }),
        this.highlightMaterial = new THREE.MeshBasicMaterial({
            opacity: 1,
            transparent: !1,
            color: this.colors.mergedPrColorHighlight
        }),
        this.hiddenMaterial = new THREE.MeshBasicMaterial({
            visible: !1
        });
        for (let x = 0; x < i; x++) {
            const {gop: n, gm: i} = t[x]
              , r = n
              , s = i
              , o = Rl(r.lat, r.lon, e)
              , c = Rl(s.lat, s.lon, e)
              , h = o.distanceTo(c);
            if (h > 1.5) {
                let t;
                t = Dl(h, 0, 2 * e, 1, h > 1.85 * e ? 3.25 : h > 1.4 * e ? 2.3 : 1.5);
                const n = Cl(r.lat, r.lon, s.lat, s.lon)
                  , i = Rl(n[0], n[1], e * t);
                d.copy(i),
                f.copy(i);
                const u = Dl(h, 10, 30, .2, .15)
                  , m = Dl(h, 10, 30, .8, .85);
                t = Dl(h, 0, 2 * e, 1, 1.7);
                const y = new THREE.CubicBezierCurve3(o,d,f,c);
                y.getPoint(u, d),
                y.getPoint(m, f),
                d.multiplyScalar(t),
                f.multiplyScalar(t);
                const b = new THREE.CubicBezierCurve3(o,d,f,c)
                  , w = Rl(s.lat, s.lon, e + x / 1e4)
                  , M = Rl(s.lat, s.lon, e + 5);
                this.landings.push({
                    pos: w,
                    lookAt: M
                });
                const S = 20 + parseInt(b.getLength())
                  , E = new THREE.TubeBufferGeometry(b,S,.08,this.TUBE_RADIUS_SEGMENTS,!1)
                  , T = new THREE.TubeBufferGeometry(b,parseInt(S / this.HIT_DETAIL_FRACTION),.6,this.TUBE_RADIUS_SEGMENTS,!1);
                E.setDrawRange(0, 0),
                T.setDrawRange(0, 0);
                const A = new THREE.Mesh(E,this.tubeMaterial)
                  , L = new THREE.Mesh(T,this.hiddenMaterial);
                L.name = "lineMesh",
                A.userData = {
                    dataIndex: x
                },
                L.userData = {
                    dataIndex: x,
                    lineMeshIndex: this.lineMeshes.length
                }
                // this.lineMeshes.push(A),
                // this.lineHitMeshes.push(L)
            }
        }
        const {width: m, height: y} = c.getBoundingClientRect()
    }
    resetHighlight() {
        null != this.highlightedMesh && (this.highlightedMesh.material = this.tubeMaterial,
        this.highlightedMesh = null)
    }
    setHighlightObject(t) {
        const e = parseInt(t.userData.lineMeshIndex)
          , n = this.lineMeshes[e];
        n != this.highlightedMesh && (n.material = this.highlightMaterial,
        this.resetHighlight(),
        this.highlightedMesh = n)
    }
    update(t=.01, e) {
        let n = parseInt(this.visibleIndex + t * this.DATA_INCREMENT_SPEED);
        n >= this.lineMeshes.length && (n = 0,
        this.visibleIndex = 0),
        n > this.visibleIndex && this.isAnimating.push(this.animatedObjectForIndex(n));
        let i = []
          , r = [];
        for (const s of this.isAnimating) {
            const e = s.line.geometry.index.count
              , n = s.line.geometry.drawRange.count + t * this.lineAnimationSpeed;
            let r = s.line.geometry.drawRange.start + t * this.lineAnimationSpeed;
            if (n >= e && r < e && this.animateLandingIn(s),
            n >= e * this.PAUSE_LENGTH_FACTOR + this.MIN_PAUSE && r < e) {
                if (s.line == this.highlightedMesh) {
                    i.push(s);
                    continue
                }
                r = this.TUBE_RADIUS_SEGMENTS * Math.ceil(r / this.TUBE_RADIUS_SEGMENTS);
                const t = this.TUBE_RADIUS_SEGMENTS * Math.ceil(r / this.HIT_DETAIL_FRACTION / this.TUBE_RADIUS_SEGMENTS);
                s.line.geometry.setDrawRange(r, n),
                s.lineHit.geometry.setDrawRange(t, n / this.HIT_DETAIL_FRACTION),
                i.push(s)
            } else
                r < e ? (s.line.geometry.setDrawRange(0, n),
                s.lineHit.geometry.setDrawRange(0, n / this.HIT_DETAIL_FRACTION),
                i.push(s)) : this.endAnimation(s)
        }
        for (let s = 0; s < this.animatingLandingsOut.length; s++)
            this.animateLandingOut(this.animatingLandingsOut[s]) && r.push(this.animatingLandingsOut[s]);
        this.isAnimating = i,
        this.animatingLandingsOut = r,
        this.visibleIndex = this.visibleIndex + t * this.DATA_INCREMENT_SPEED
    }
    endAnimation(t) {
        t.line.geometry.setDrawRange(0, 0),
        t.lineHit.geometry.setDrawRange(0, 0),
        this.mesh.remove(t.line),
        this.mesh.remove(t.lineHit),
        t.line = null,
        t.lineHit = null,
        this.animatingLandingsOut.push(t)
    }
    animateLandingIn(t) {
        if (t.dot.scale.x > .99) {
            if (null == t.dotFade)
                return;
            return t.dotFade.material.opacity = 0,
            this.mesh.remove(t.dotFade),
            Ll(t.dotFade),
            void (t.dotFade = null)
        }
        const e = t.dot.scale.x + .06 * (1 - t.dot.scale.x);
        t.dot.scale.set(e, e, 1);
        const n = t.dotFade.scale.x + .06 * (1 - t.dotFade.scale.x);
        t.dotFade.scale.set(n, n, 1),
        t.dotFade.material.opacity = 1 - n
    }
    animateLandingOut(t) {
        if (t.dot.scale.x < .01)
            return this.mesh.remove(t.dot),
            t.dot = null,
            Ll(t.dot),
            null != t.dotFade && (this.mesh.remove(t.dotFade),
            Ll(t.dotFade),
            t.dotFade = null),
            !1;
        const e = t.dot.scale.x - .15 * t.dot.scale.x;
        return t.dot.scale.set(e, e, 1),
        !0
    }
    animatedObjectForIndex(t) {
        const e = this.lineMeshes[t];
        this.mesh.add(e);
        const n = this.lineHitMeshes[t];
        this.mesh.add(n);
        const i = this.landingFromPositionData(this.landings[t]);
        this.mesh.add(i);
        const r = this.fadingLandingMeshFromMesh(i);
        return this.mesh.add(r),
        {
            line: e,
            lineHit: n,
            dot: i,
            dotFade: r
        }
    }
    landingFromPositionData(t) {
        const e = new THREE.Mesh(this.landingGeo,this.tubeMaterial);
        return e.position.set(t.pos.x, t.pos.y, t.pos.z),
        e.lookAt(t.lookAt.x, t.lookAt.y, t.lookAt.z),
        e.scale.set(0, 0, 1),
        e
    }
    fadingLandingMeshFromMesh(t) {
        const e = t.clone();
        return e.geometry = new THREE.RingBufferGeometry(1.55,1.8,16),
        e.material = new THREE.MeshBasicMaterial({
            color: this.colors.mergedPrColor,
            blending: 2,
            transparent: !0,
            opacity: 0,
            alphaTest: .02,
            visible: !0
        }),
        e.scale.set(0, 0, 1),
        e.renderOrder = 5,
        e
    }
    dispose() {
        this.mesh && Pl(this.mesh, Ll),
        this.mesh && this.mesh.parent && this.mesh.parent.remove(this.mesh),
        this.mesh = null
    }
}
