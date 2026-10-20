#!/usr/bin/env python3
"""Publish the supplied Poly Tourismo game without modifying its contents."""
from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "game" / "Poly-Tourismo.html"


def main():
    outputs = [Path(sys.argv[1])] if len(sys.argv) > 1 else [
        ROOT / "dist" / "Poly-Tourismo.html",
        ROOT / "dist" / "index.html",
        ROOT / "index.html",
    ]
    for output in outputs:
        output.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(SOURCE, output)
        print(f"Wrote {output}")


if __name__ == "__main__":
    main()
