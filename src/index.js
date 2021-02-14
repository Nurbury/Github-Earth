import Device from './Device.js'
import { cl } from './ConstantDefinition.js'

function Ol() {
    const t = document.querySelector(".js-webgl-globe");
    if (!t)
        return;
    if (!t.hasChildNodes())
        return;
    const e = t.parentNode;
    e && e.classList.remove("home-globe-container-webgl");
    const n = t.querySelector(".js-webgl-globe-loading");
    n && t.removeChild(n);
    const i = t.querySelector(".js-globe-canvas");
    i && t.removeChild(i);
    const r = t.querySelector(".js-globe-popup");
    r && t.removeChild(r),
    t.querySelector(".js-globe-fallback-image").removeAttribute("hidden")
}


window.onload = () => {
    const t = new Device({
        basePath: "webgl-globe/",
        parentNode: document.querySelector(".js-webgl-globe"),
        globeRadius: cl,
        lineWidth: 1.5,
        spikeRadius: .06
    });
    window.lm = t
    t.init().then((()=>{
        t.canvas.addEventListener("webglcontextlost", Ol, !1)
    }
    ))
}
