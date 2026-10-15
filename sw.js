/* App shell only. data.js and any authenticated response stay on the network. */
var CACHE = "inbox-shell-v1";
var SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/apple-touch-icon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(SHELL);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE; }).map(function (key) {
          return caches.delete(key);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function isShell(pathname) {
  return SHELL.indexOf(pathname) !== -1;
}

function isNetworkOnly(pathname) {
  var file = pathname.split("/").pop();
  return (
    file === "data.js" ||
    file === "work.js" ||
    pathname === "/api" ||
    pathname.indexOf("/api/") === 0 ||
    pathname.indexOf("/auth") !== -1
  );
}

function mayStore(request, response) {
  if (!response || !response.ok || response.type !== "basic") return false;
  if (request.headers.has("authorization")) return false;
  if (response.headers.has("set-cookie")) return false;
  var cacheControl = (response.headers.get("cache-control") || "").toLowerCase();
  if (cacheControl.indexOf("no-store") !== -1) return false;
  if (cacheControl.indexOf("private") !== -1) return false;
  return true;
}

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;

  var url;
  try {
    url = new URL(request.url);
  } catch (err) {
    return;
  }
  if (url.origin !== self.location.origin) return;

  // Data, API, and auth always hit the network and are never stored.
  if (isNetworkOnly(url.pathname) || request.headers.has("authorization")) {
    event.respondWith(fetch(request, { cache: "no-store" }));
    return;
  }
  if (!isShell(url.pathname)) return;

  event.respondWith(
    fetch(request).then(function (response) {
      if (mayStore(request, response)) {
        var copy = response.clone();
        caches.open(CACHE).then(function (cache) {
          return cache.put(request, copy);
        });
      }
      return response;
    }).catch(function () {
      return caches.match(request).then(function (cached) {
        return cached || new Response("", { status: 504, statusText: "Offline" });
      });
    })
  );
});
