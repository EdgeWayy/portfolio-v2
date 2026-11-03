// node tools/serve.mjs <dir> <port>  — tiny static server
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const dir = path.resolve(process.argv[2] || "."); const port = +(process.argv[3] || 5173);
const T = {".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2",".mp4":"video/mp4",".webm":"video/webm",".txt":"text/plain",".xml":"application/xml"};
http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
  const f = path.join(dir, p);
  if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404, {"content-type":T[".html"]}); return r.end(fs.existsSync(path.join(dir,"404.html")) ? fs.readFileSync(path.join(dir,"404.html")) : "404"); }
  r.writeHead(200, {"content-type": T[path.extname(f).toLowerCase()] || "application/octet-stream"}); fs.createReadStream(f).pipe(r);
}).listen(port, () => console.log("serving", dir, "on", port));
