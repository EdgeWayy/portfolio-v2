/* Toxic goo on WebGL. Original code.
   Pass 1 writes a signed distance field (sheet + drips + drops, blended with smooth-min) to a
   low-resolution float texture. Pass 2 thresholds and cel-shades that field at full resolution, so
   the edges stay crisp even though the shapes are computed at 0.5 to 0.75 scale.
   Without float render targets (or on WebGL1) one pass evaluates the field directly.
   Coordinates in the shaders are CSS pixels with y pointing down. */
(function () {
  "use strict";

  const FIELD = (maxDrips) => `
#define MAXD ${maxDrips}
#define MAXP 3
uniform vec2 uSize;
uniform float uFront, uTime, uAmp, uRag;
uniform int uCount;
uniform vec4 uDrip[MAXD];  // x, tip y, neck radius, head radius
uniform vec4 uDrop[MAXP];  // x, top y, tail radius, head radius (radius 0 = off)
float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}
float teardrop(vec2 p, float r1, float r2, float h) {
  p.x = abs(p.x);
  float b = (r1 - r2) / h, a = sqrt(max(1.0 - b * b, 0.0));
  float k = dot(p, vec2(-b, a));
  if (k < 0.0) return length(p) - r1;
  if (k > a * h) return length(p - vec2(0.0, h)) - r2;
  return dot(p, vec2(a, b)) - r1;
}
float field(vec2 p) {
  float wave = sin(p.x * 0.013 + uTime * 0.11) * 0.5 + sin(p.x * 0.031 - uTime * 0.07 + 1.7) * 0.28 + sin(p.x * 0.0067 + 2.1) * 0.6;
  float rag = sin(p.x * 0.0041 + 0.7) * 0.6 + sin(p.x * 0.0113 + 3.1) * 0.4 + sin(p.x * 0.0277 + 5.3) * 0.22;
  float d = p.y - (uFront + wave * uAmp + rag * uRag);
  float top = uFront - 70.0;
  for (int i = 0; i < MAXD; i++) {
    if (i >= uCount) break;
    vec4 q = uDrip[i];
    float h = max(q.y - q.w - top, abs(q.z - q.w) + 1.0);
    d = smin(d, teardrop(p - vec2(q.x, top), q.z, q.w, h), 15.0 + q.w * 0.7);
  }
  for (int i = 0; i < MAXP; i++) {
    vec4 q = uDrop[i];
    if (q.w <= 0.0) continue;
    float h = max(q.w * 1.6, abs(q.z - q.w) + 1.0);
    d = smin(d, teardrop(p - vec2(q.x, q.y), q.z, q.w, h), 7.0);
  }
  return d;
}`;

  const VERT = `attribute vec2 aPos; void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

  const FRAG_FIELD = (maxDrips) => `precision highp float;
${FIELD(maxDrips)}
void main() {
  vec2 p = vec2(gl_FragCoord.x, uSize.y * ${"uRes"}.y - gl_FragCoord.y) / uRes;
  gl_FragColor = vec4(clamp(field(p), -200.0, 200.0), 0.0, 0.0, 1.0);
}`.replace("#define MAXP 3", "#define MAXP 3\nuniform vec2 uRes;");

  const SHADE = `
vec3 LIME = vec3(0.714, 1.0, 0.0), DEEP = vec3(0.431, 0.62, 0.0), PALE = vec3(0.91, 1.0, 0.62), THICK = vec3(0.60, 0.86, 0.0);
float wob(float x) { return sin(x * 0.0123 + 1.3) * 0.5 + sin(x * 0.0291 + uTimeS * 0.05) * 0.3 + sin(x * 0.0071 + 4.0) * 0.4; }
vec4 shade(float d, vec2 g, vec2 p, float aa) {
  float inside = smoothstep(aa, -aa, d);
  if (inside <= 0.0) return vec4(0.0);
  vec3 col = LIME;
  // soft darker rim where the liquid thickens toward its edge
  col = mix(col, THICK, smoothstep(-10.0, -3.0, d) * 0.8);
  // glossy highlights. Hard-edged, and they follow the surface because they are bands of the field.
  float side = smoothstep(0.55, 0.92, dot(g, normalize(vec2(-1.0, -0.3))));      // left flanks and shoulders
  float s1 = abs(d + 7.5) - 2.4 * side;
  float front = smoothstep(0.72, 0.96, g.y) * smoothstep(0.1, 0.5, wob(p.x));    // long dashes along the lower edge
  float s2 = abs(d + 15.0) - 3.2 * front;
  float hl = min(side > 0.01 ? s1 : 1.0, front > 0.01 ? s2 : 1.0);
  col = mix(col, PALE, smoothstep(aa, -aa, hl));
  // inner contour
  col = mix(col, DEEP, smoothstep(-2.5 - aa, -2.5 + aa, d));
  return vec4(col * inside, inside);
}`;

  const FRAG_SHADE = `precision highp float;
uniform sampler2D uField;
uniform vec2 uSize, uRes;
uniform float uTimeS;
${SHADE}
void main() {
  vec2 p = vec2(gl_FragCoord.x, uSize.y * uRes.y - gl_FragCoord.y) / uRes;
  vec2 uv = gl_FragCoord.xy / (uSize * uRes);
  vec2 e = 2.4 / uSize;
  float d = texture2D(uField, uv).r;
  vec2 g = vec2(texture2D(uField, uv + vec2(e.x, 0.0)).r - texture2D(uField, uv - vec2(e.x, 0.0)).r,
                texture2D(uField, uv - vec2(0.0, e.y)).r - texture2D(uField, uv + vec2(0.0, e.y)).r);
  g = g / max(length(g), 1e-4);
  gl_FragColor = shade(d, g, p, 0.75 / uRes.y);
}`;

  const FRAG_DIRECT = (maxDrips) => `precision highp float;
uniform vec2 uRes;
uniform float uTimeS;
${FIELD(maxDrips)}
${SHADE}
void main() {
  vec2 p = vec2(gl_FragCoord.x, uSize.y * uRes.y - gl_FragCoord.y) / uRes;
  float d = field(p);
  vec2 g = vec2(field(p + vec2(1.6, 0.0)) - field(p - vec2(1.6, 0.0)), field(p + vec2(0.0, 1.6)) - field(p - vec2(0.0, 1.6)));
  g = g / max(length(g), 1e-4);
  gl_FragColor = shade(d, g, p, 0.75 / uRes.y);
}`;

  /* small deterministic random, so a given size always pours the same way */
  function rng(seed) {
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (u) => { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); };

  function compile(gl, vs, fs) {
    const p = gl.createProgram();
    for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      gl.attachShader(p, s);
    }
    gl.bindAttribLocation(p, 0, "aPos");
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const cache = {};
    return { p, u: (n) => (n in cache ? cache[n] : (cache[n] = gl.getUniformLocation(p, n))) };
  }

  function supported() {
    try {
      const c = document.createElement("canvas");
      return !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch (e) { return false; }
  }

  /** opts: lite, scale, seed */
  function create(canvas, opts) {
    const attrs = { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: !!opts.preserve, powerPreference: opts.lite ? "low-power" : "default" };
    let gl = canvas.getContext("webgl2", attrs), two = !!gl;
    if (!gl) gl = canvas.getContext("webgl", attrs);
    if (!gl) return null;

    const lite = !!opts.lite;
    const maxDrips = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS) >= 64 ? 40 : 18;
    const floatOk = two && !!gl.getExtension("EXT_color_buffer_float");
    if (floatOk) gl.getExtension("OES_texture_float_linear");
    const twoPass = floatOk;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const progField = twoPass ? compile(gl, VERT, FRAG_FIELD(maxDrips)) : null;
    const progShade = twoPass ? compile(gl, VERT, FRAG_SHADE) : compile(gl, VERT, FRAG_DIRECT(maxDrips));
    const tex = twoPass ? gl.createTexture() : null, fbo = twoPass ? gl.createFramebuffer() : null;

    let W = 0, H = 0, dpr = 1, scale = opts.scale || (lite ? 0.5 : 0.7), fw = 0, fh = 0;
    let line = 0, floorAt = () => 1e9, drips = [], drops = [{ on: 0 }, { on: 0 }, { on: 0 }];
    let time = 0, T = 2.8, nextDrop = 6, raf = 0, lastFrame = 0, visible = true, running = false, frames = 0, idleCap = lite ? 30 : 30;
    const dripData = new Float32Array(maxDrips * 4), dropData = new Float32Array(12);

    function resize(w, h) {
      W = w; H = h;
      dpr = Math.min(devicePixelRatio || 1, lite ? 1.5 : 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.height = H + "px";
      if (twoPass) {
        const k = Math.max(0.5, scale * dpr > 1.1 ? 1.1 / dpr : scale); // no use computing the field finer than about a CSS pixel
        fw = Math.max(2, Math.round(W * dpr * k)); fh = Math.max(2, Math.round(H * dpr * k));
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, fw, fh, 0, gl.RGBA, gl.HALF_FLOAT, null);
        const f = gl.getExtension("OES_texture_float_linear") || true;
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f ? gl.LINEAR : gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f ? gl.LINEAR : gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
    }

    function buildDrips() {
      const r = rng(opts.seed || 7), list = [];
      const k = clamp(W / 1440, 0.8, 1.3);
      const lobeGap = lite ? [70, 125] : [95 * k, 190 * k], dripGap = lite ? [34, 66] : [40 * k, 96 * k];
      const noise = (x) => 0.5 + 0.28 * Math.sin(x * 0.0091 + 1.1) + 0.22 * Math.sin(x * 0.0237 + 4.2);
      // wide slow lobes make the ragged front; they arrive first and fuse into the sheet
      for (let x = -20; x < W + 20 && list.length < maxDrips * 0.34; x += lobeGap[0] + r() * (lobeGap[1] - lobeGap[0])) {
        const rad = (lite ? 16 : 24) + Math.pow(r(), 1.6) * (lite ? 30 : 52) * k;
        list.push({ x, kind: 0, neck: rad * 1.7, head: rad * 0.86, want: 2 + r() * (lite ? 34 : 56), delay: r() * 0.7, dur: T * (0.72 + r() * 0.24) });
      }
      for (let x = 10 + r() * 30; x < W && list.length < maxDrips; x += dripGap[0] + r() * (dripGap[1] - dripGap[0])) {
        const n = clamp(noise(x) * 0.55 + r() * 0.62, 0, 1), long = Math.pow(n, 2.4);
        list.push({
          x, kind: 1, neck: 2.8 + r() * 2.6, head: 8 + long * 11 + r() * 3.5,
          want: 14 + long * (lite ? 170 : 270), delay: 0.05 + r() * 1.25, dur: T * (0.5 + r() * 0.55),
        });
      }
      for (const d of list) Object.assign(d, { ph: r() * 6.28, w: 0.28 + r() * 0.34, sway: 0.5 + r() * 1.2, drag: 0, pinch: 1, stretch: 0, state: 0, tStart: 0, grow: 1, tip: -200 });
      drips = list;
      drops.forEach((p) => { p.on = 0; });
    }

    /** y0 is where the sheet rests; floor(x) is the lowest a tip may reach at x (text below stays clear). */
    function setLayout(y0, floorFn) {
      line = y0;
      floorAt = floorFn || (() => 1e9);
    }
    function room(d) {
      const reach = d.head + d.sway + 3;
      return Math.min(floorAt(d.x - reach), floorAt(d.x), floorAt(d.x + reach)) - line - 4;
    }

    function front(t) {
      const u = clamp(t / T, 0, 1), e = u * u * (3 - 2 * u);
      return -110 + (line + 110) * (0.16 * u + 0.84 * e);
    }

    function step(dt) {
      time += dt;
      const t = time, f = front(t);
      for (const d of drips) {
        const space = Math.max(6, room(d));
        const rest = line + Math.min(d.want, space) + Math.sin(t * d.w + d.ph) * (d.kind ? Math.min(4 + d.want * 0.035, space * 0.12) : 3);
        const u = clamp((t - d.delay) / d.dur, 0, 1);
        const pour = -80 + (rest + 80) * (u * u * (3 - 2 * u)) * (1 + 0.03 * Math.sin(u * 3.14));
        // the tip keeps creeping after the sheet has arrived, as heavy liquid does
        d.tip = Math.max(pour, f - 40) + d.stretch - d.drag;
        if (u >= 1) d.tip = rest + d.stretch - d.drag;
        // a stretched drip thins out, and the mass goes to its head
        const len = Math.max(0, d.tip - line);
        d.neckNow = d.kind ? (d.neck / Math.sqrt(1 + len / 110)) * d.pinch : d.neck;
        d.headNow = d.kind ? d.head * d.grow * (1 + Math.min(0.2, len / 900)) : d.head;
        // detaching: stretch, pinch, let go, then the stub creeps back
        if (d.state === 1) {
          const q = clamp((t - d.tStart) / 2.6, 0, 1);
          d.stretch = smooth(q) * d.extra;
          d.pinch = 1 - smooth(q) * 0.86;
          if (q >= 1) {
            const p = drops.find((x) => !x.on);
            if (p) Object.assign(p, { on: 1, x: d.x, y: d.tip - d.headNow * 2.2, v: 0, head: d.headNow * 0.92, born: t, dist: d.fall, y0: d.tip - d.headNow * 2.2 });
            d.state = 2; d.tStart = t; d.grow = 0.5; d.dragTo = d.head * 2.1 + d.extra;
          }
        } else if (d.state === 2) {
          const q = clamp((t - d.tStart) / 1.5, 0, 1), e = 1 - Math.pow(1 - q, 3);
          d.stretch = d.extra * (1 - e);
          d.drag = d.head * 2.1 * (1 - smooth(clamp((t - d.tStart - 1.2) / 3.2, 0, 1))) * smooth(q * 4);
          d.grow = 0.5 + 0.5 * smooth(clamp((t - d.tStart - 0.6) / 3.2, 0, 1));
          d.pinch = 0.14 + 0.86 * e;
          if (t - d.tStart > 4.5) { d.state = 0; d.stretch = 0; d.drag = 0; d.grow = 1; d.pinch = 1; }
        }
      }
      for (const p of drops) {
        if (!p.on) continue;
        // heavy liquid: slow start, low terminal speed, dissolves near the end of its fall
        p.v = Math.min(p.v + 95 * dt, 74);
        p.y += p.v * dt;
        const u = clamp((p.y - p.y0) / p.dist, 0, 1);
        p.r = p.head * (1 - smooth((u - 0.45) / 0.55));
        p.tail = Math.max(0.6, p.head * 0.22 * (1 - u));
        if (u >= 1 || p.r < 0.5) p.on = 0;
      }
      if (t > T + 2 && t > nextDrop) {
        nextDrop = t + (lite ? 8 : 5) + ((t * 13.37) % 1) * 5;
        const free = drips.filter((d) => d.kind && d.state === 0 && d.want > 45 && room(d) - d.want > 70 && d.x > 8 && d.x < W - 8);
        if (free.length && drops.some((x) => !x.on)) {
          const d = free[Math.floor(((t * 7.13) % 1) * free.length)];
          d.state = 1; d.tStart = t;
          d.extra = Math.min(46, (room(d) - d.want) * 0.35);
          d.fall = clamp(room(d) - d.want - d.extra, 40, 170);
        }
      }
    }

    function draw() {
      const t = time, f = front(t);
      const rest = t >= T;
      const breathe = rest ? Math.sin(t * 0.42) * 2.4 : 0;
      for (let i = 0; i < maxDrips; i++) {
        const d = drips[i];
        if (!d) break;
        dripData[i * 4] = d.x + Math.sin(t * 0.3 + d.ph) * d.sway;
        dripData[i * 4 + 1] = d.tip;
        dripData[i * 4 + 2] = d.neckNow;
        dripData[i * 4 + 3] = d.headNow;
      }
      drops.forEach((p, i) => {
        dropData[i * 4] = p.x || 0;
        dropData[i * 4 + 1] = p.y || 0;
        dropData[i * 4 + 2] = p.on ? p.tail : 0;
        dropData[i * 4 + 3] = p.on ? p.r : 0;
      });
      gl.disable(gl.BLEND);
      const setField = (pr, res) => {
        gl.uniform2f(pr.u("uSize"), W, H);
        gl.uniform2f(pr.u("uRes"), res, res);
        gl.uniform1f(pr.u("uFront"), f + breathe);
        gl.uniform1f(pr.u("uTime"), t);
        gl.uniform1f(pr.u("uAmp"), lite ? 7 : 11);
        const uu = clamp(t / (T + 0.5), 0, 1);
        gl.uniform1f(pr.u("uRag"), (lite ? 60 : 120) * (1 - uu * uu) * smooth(t * 2) );
        gl.uniform1i(pr.u("uCount"), Math.min(drips.length, maxDrips));
        gl.uniform4fv(pr.u("uDrip"), dripData);
        gl.uniform4fv(pr.u("uDrop"), dropData);
      };
      if (twoPass) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.viewport(0, 0, fw, fh);
        gl.useProgram(progField.p);
        setField(progField, fw / W);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.useProgram(progShade.p);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(progShade.u("uField"), 0);
        gl.uniform2f(progShade.u("uSize"), W, H);
        gl.uniform2f(progShade.u("uRes"), dpr, dpr);
        gl.uniform1f(progShade.u("uTimeS"), t);
      } else {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.useProgram(progShade.p);
        setField(progShade, dpr);
        gl.uniform1f(progShade.u("uTimeS"), t);
      }
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frames++;
    }

    function loop(now) {
      raf = 0;
      if (!running || !visible || document.hidden) return;
      const pouring = time < T + 1.2;
      const cap = lite ? 30 : pouring ? 60 : idleCap; // the idle life is slow: 30 fps looks the same and costs half
      const min = 1000 / cap - 2;
      if (now - lastFrame >= min) {
        const dt = Math.min(0.05, (now - lastFrame) / 1000 || 0.016);
        lastFrame = now;
        step(dt);
        draw();
      }
      raf = requestAnimationFrame(loop);
    }
    function wake() { if (running && visible && !document.hidden && !raf) { lastFrame = performance.now(); raf = requestAnimationFrame(loop); } }
    const onVis = () => wake();
    document.addEventListener("visibilitychange", onVis);
    let io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; wake(); });
      io.observe(canvas);
    }

    return {
      twoPass, webgl2: two,
      resize,
      rebuild() { buildDrips(); },
      setLayout,
      /** deterministic jump, used by tests and the finished state */
      seek(t) { buildDrips(); time = 0; nextDrop = 6; step(0); const n = Math.ceil(t * 60); for (let i = 0; i < n; i++) step(1 / 60); draw(); },
      settle() { const was = time; time = Math.max(was, T + 2); for (const d of drips) { d.delay = 0; } step(0.001); draw(); },
      redraw() { step(0.0001); draw(); },
      start(fromRest) {
        running = true;
        if (fromRest) time = T + 2;
        wake();
      },
      stop() { running = false; cancelAnimationFrame(raf); raf = 0; },
      /** test hooks */
      stepForTest(dt) { step(dt); },
      get frontY() { return front(time); },
      get dropsOn() { return drops.filter((p) => p.on).length; },
      get dropAge() { const p = drops.find((x) => x.on); return p ? time - p.born : 0; },
      get time() { return time; },
      get frames() { return frames; },
      destroy() {
        running = false;
        cancelAnimationFrame(raf);
        document.removeEventListener("visibilitychange", onVis);
        if (io) io.disconnect();
        const lose = gl.getExtension("WEBGL_lose_context");
        if (lose) lose.loseContext();
      },
    };
  }

  window.AcidGL = { create, supported };
})();
