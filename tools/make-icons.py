#!/usr/bin/env python3
"""Generate the extension PNG icons.

Draws a small word-clock matrix: a dark panel with three lit rows of cells,
which reads as a word clock even at 16 px. Pure stdlib, no image library.

Usage:  python3 tools/make-icons.py
"""

import os
import struct
import zlib

BG = (8, 16, 31)
OFF = (26, 35, 56)
ON = (255, 170, 60)

# Cells lit in the 8x8 preview, as (x, y). Three staggered runs look like
# words rather than a random sprinkle.
LIT = (
    [(x, 1) for x in range(0, 4)]
    + [(x, 3) for x in range(3, 7)]
    + [(x, 5) for x in range(1, 5)]
    + [(x, 6) for x in range(5, 8)]
)


def png(path, size):
    """Write a size x size RGB PNG of the matrix."""
    lit = set(LIT)
    pad = max(1, round(size * 0.055))
    span = size - 2 * pad
    step = span / 8.0
    gap = max(1, round(step * 0.16))

    rows = []
    for py in range(size):
        row = bytearray()
        for px in range(size):
            color = BG
            gx = (px - pad) / step
            gy = (py - pad) / step
            if 0 <= gx < 8 and 0 <= gy < 8:
                cx, cy = int(gx), int(gy)
                # Inset each cell so the grid reads as separate pixels.
                ox = (px - pad) - cx * step
                oy = (py - pad) - cy * step
                if ox >= gap / 2 and oy >= gap / 2 and \
                        ox <= step - gap / 2 and oy <= step - gap / 2:
                    color = ON if (cx, cy) in lit else OFF
            row += bytes(color)
        rows.append(row)

    raw = b"".join(b"\x00" + bytes(r) for r in rows)

    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))

    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)))
        f.write(chunk(b"IDAT", zlib.compress(raw, 9)))
        f.write(chunk(b"IEND", b""))


def main():
    here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out = os.path.join(here, "icons")
    os.makedirs(out, exist_ok=True)
    for size in (16, 32, 48, 128):
        path = os.path.join(out, "icon%d.png" % size)
        png(path, size)
        print("wrote %s (%d bytes)" % (path, os.path.getsize(path)))


if __name__ == "__main__":
    main()
