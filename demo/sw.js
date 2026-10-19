'use strict';
const CACHE='oneul-demo-shell-v13';
const BASE=new URL('./',self.location.href).href;
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'].map(p=>new URL(p,BASE).href);
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await cache.addAll(SHELL.map(url=>new Request(url,{cache:'reload'})));
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  for(const key of await caches.keys())if(key.startsWith('oneul-demo-shell-')&&key!==CACHE)await caches.delete(key);
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin||!url.href.startsWith(BASE))return;
 // Serve the installed shell offline; future deployments update the cache version.
 if(request.mode==='navigate'&&(url.pathname===new URL(BASE).pathname||url.pathname===new URL('index.html',BASE).pathname)){
  event.respondWith((async()=>{const cache=await caches.open(CACHE);return await cache.match(BASE)||fetch(request);})());return;
 }
 if(SHELL.includes(url.href))event.respondWith((async()=>{const cache=await caches.open(CACHE);return await cache.match(request)||fetch(request);})());
});
