"""Build the web animation from the existing 4K transparent render masters.

Only resample, rotate and crop transparent padding. No generated detail or
changes to the cable model, frame order, timing, or loop.
"""
from pathlib import Path
import json
import math
from PIL import Image

project = Path(__file__).resolve().parents[1]
masters = project.parent / 'output/cable-animation-pvc-smooth/frames-4k'
assets = project / 'src/assets/figma'
parts = []
union = None
for index in range(100):
    path = masters / f'unique_{index:03}.png'
    with Image.open(path) as original:
        assert original.size == (3840, 2160), path
        frame = original.convert('RGBA').resize((1920, 1080), Image.Resampling.LANCZOS)
    frame = frame.transpose(Image.Transpose.ROTATE_90)
    box = frame.getbbox()
    assert box
    union = box if union is None else (
        min(union[0], box[0]), min(union[1], box[1]),
        max(union[2], box[2]), max(union[3], box[3]),
    )
    parts.append((frame.crop(box), box))

# Keep a small transparent guard around every frame, aligned to even pixels.
left = max(0, math.floor((union[0] - 4) / 2) * 2)
top = max(0, math.floor((union[1] - 4) / 2) * 2)
right = min(1080, math.ceil((union[2] + 4) / 2) * 2)
bottom = min(1920, math.ceil((union[3] + 4) / 2) * 2)
frames = []
for image, box in parts:
    frame = Image.new('RGBA', (right - left, bottom - top))
    frame.paste(image, (box[0] - left, box[1] - top))
    frames.append(frame)
loop = frames + frames[-2::-1]
assert len(loop) == 199
print(f'Encoding {len(loop)} frames at {loop[0].size}', flush=True)
loop[0].save(assets / 'hero-cable-retina-poster.webp', lossless=True, method=6)
loop[0].save('/private/tmp/jingyuan-qa/cable-retina-master-first.png')
loop[0].save(
    assets / 'hero-cable-retina.webp', save_all=True, append_images=loop[1:],
    duration=40, loop=0, quality=96, alpha_quality=100, method=4,
    minimize_size=True,
)
metadata = {
    'source': '../output/cable-animation-pvc-smooth/frames-4k/unique_000.png … unique_099.png',
    'fullWidth': 1080, 'fullHeight': 1920,
    'crop': {'left': left, 'top': top, 'width': right - left, 'height': bottom - top},
    'frames': 199, 'frameDurationMs': 40, 'durationMs': 7960,
    'quality': 96, 'alphaQuality': 100,
}
(project / 'src/data/hero-cable.json').write_text(json.dumps(metadata, indent=2) + '\n')
print(json.dumps({**metadata, 'bytes': (assets / 'hero-cable-retina.webp').stat().st_size}), flush=True)
