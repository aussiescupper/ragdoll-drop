# Ragdoll Drop

A 3D ragdoll game built for Henry. Four modes, one blocky noob, no happy endings.

**Play:** https://aussiescupper.github.io/ragdoll-drop/

Add it to the iPad home screen from Safari (Share → Add to Home Screen) and it
runs full screen and offline.

## The modes

- **Tower Drop** — leap off the crate at the top of a sealed tower and go limp.
  Every part you smack on the way down pays out and x‑rays your bones for a
  second; consecutive hits build a chain multiplier. Land on the ground to clear
  the level. Every level after that is longer, tighter and worth more.
- **Slice Lab** — a room of loose noobs, a sword cursor and a grabbing hand.
  Swipe to take limbs off, or grab one and slam it into the floor.
- **Colosseum** — pick a weapon and armour for two noobs and set them on each
  other. Sword, axe, spear or club; bare, leather or iron.
- **Last Noob Standing** — first-person. Pick who you are fighting from a roster
  of procedurally named noobs with a skill rating out of 99, or hit **Triple
  mode** for six of them and take on three at once. Knives, pistols, SMGs,
  shotguns and rifles lie about the colosseum sand; walk over one to take it.
- **A Noob's Day Out** — a choose‑your‑own‑adventure with eighteen endings. The
  room changes with the scene, he acts out whatever you pick, and there is a
  read‑aloud button.

## Layout

    src/game.html         the source of truth — the whole game, one file
    build.js              emits index.html from it, and stamps the version
    index.html            generated; the installable PWA (committed, Pages serves it)
    version.js            APP_VERSION / APP_DATE — single source of truth
    sw.js                 service worker, cache named from version.js
    vendor/three.min.js   Three.js r128, vendored so the game works offline
    icons/                app icons + make-icons.py that draws them

`src/game.html` has no `<!doctype>` and no `<head>` because it is also published
as a Claude artifact, and that platform supplies them. `build.js` adds a real
head, the iPad meta and the service worker for the web version, and swaps
Three.js from the CDN to the vendored copy.

## Deploying

    ../bump.sh ragdoll-drop     # version.js: 33 -> 34
    node build.js               # restamps index.html and the version badges
    git commit -am "..." && git push

The version shows on the home screen and in the bottom-right corner in game, and
names the service worker cache — so what an iPad is running is always
identifiable, and it always matches the published artifact.

The service worker is network-first for the app shell, so a deploy reaches an
installed iPad on its next online launch. Its cleanup only ever deletes caches
prefixed `ragdoll-drop-`: the sibling ScupperLab apps share this origin.

## Notes

- Saves (wallet, level, colours, settings) live in `localStorage` under
  `ragdolldrop.v1`.
- Google Fonts are the only remaining third-party fetch. They are cached on the
  first online launch and fall back to the system stack before that; everything
  else, Three.js included, is served from this repo.
