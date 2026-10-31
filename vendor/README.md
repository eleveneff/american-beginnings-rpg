# Vendored libraries

Served from the game itself, so the 3D world no longer depends on a CDN being reachable.

| File | Source | Version | md5 |
|---|---|---|---|
| `three.module.min.js` | npm `three@0.160.0`, `build/three.module.min.js` | r160 | 4d8e72afd9639e074547992bce6a3de3 |
| `BufferGeometryUtils.js` | npm `three@0.160.0`, `examples/jsm/utils/BufferGeometryUtils.js` | r160 | 00ecb96beafe657ac52dc49813220212 |

Both are byte-identical to `https://cdn.jsdelivr.net/npm/three@0.160.0/...` (checked with md5 on 2026-10-31).
License: MIT, see `LICENSE-three.txt`. `index.html` maps the bare specifier `three` to
`vendor/three.module.min.js` with an import map, so every module (world.js, world/*.js and
BufferGeometryUtils.js) shares the same single copy of three.js.
