# Poly Tourismo

The project serves the supplied **Poly-Tourismo-v9m.html** game at `/`.
The original attachment is preserved byte for byte in `game/Poly-Tourismo.html`,
which is now the authoritative game source. Edit that file to update the game.

## Publishing

`python3 build.py` copies the game to `dist/index.html` and
`dist/Poly-Tourismo.html`. Netlify publishes `dist` and runs this command on deploy.
The published files are also included in the repository.

The game embeds its models, textures, styles and game code. It loads Three.js r128
from cdnjs, so an internet connection is needed for that library.

## Earlier source

The previous layered sources remain in `base/`, `src/` and `assets/` for reference.
Their original build script is preserved as `build_legacy.py`; it is not used for
publishing the supplied game. Running it overwrites the published game files.
