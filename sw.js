/* Alistamiento – Chequeador · Service Worker
   Red primero (siempre trae la versión nueva); si no hay red, usa la copia guardada.
   Sube el número de VERSION cada vez que cambies index.html para forzar la actualización. */
const VERSION='2026-11-11-franja-traslape';
const CACHE='alistamiento-'+VERSION;
const BASE=['./','./index.html','./manifest.json','./icon-192.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(BASE.map(u=>c.add(u)))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('alistamiento-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;   // Supabase, fuentes y CDN van directo a la red
  e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{
    if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp)).catch(()=>{})}
    return res;
  }).catch(()=>caches.match(r).then(m=>m||(r.mode==='navigate'?caches.match('./index.html'):undefined))));
});
