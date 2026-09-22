/* Single source of truth for this app's version.
   The home screen and the corner badge show it, the service worker names its
   cache after it, and build.js stamps it into index.html — so what an iPad is
   running is always identifiable, and it always matches the published artifact.
   Bump with ../bump.sh ragdoll-drop, then `node build.js` — never edit the
   number in two places. */
self.APP_VERSION = "45";
self.APP_DATE = "2026-09-23";
