from pathlib import Path
from PIL import Image
import shutil

src = Path("assets/hardware/portfolio-source")
bond = Path("assets/hardware/bond")
safety = Path("assets/hardware/safety")
bond.mkdir(parents=True, exist_ok=True)
safety.mkdir(parents=True, exist_ok=True)


def copy_page(page: str, name: str, folder: Path) -> None:
    shutil.copy2(src / page, folder / name)


copy_page("page-30.png", "hero-scene.png", bond)
copy_page("page-26.png", "products.png", bond)
copy_page("page-33.png", "journey-full.png", bond)
copy_page("page-31.png", "journey-flow.png", bond)
copy_page("page-28.png", "interaction.png", bond)

copy_page("page-35.png", "research.png", safety)
copy_page("page-39.png", "exploded.png", safety)
copy_page("page-40.png", "usage-scenes.png", safety)
copy_page("page-38.png", "details.png", safety)

# Crop journey into 3 horizontal panels from page-33
j = Image.open(bond / "journey-full.png").convert("RGB")
w, h = j.size
# bottom journey grid starts ~38% from top
top = int(h * 0.36)
grid = j.crop((0, top, w, int(h * 0.92)))
gw, gh = grid.size
seg = gw // 7
for i in range(7):
    part = grid.crop((i * seg, 0, (i + 1) * seg if i < 6 else gw, gh))
    part.save(bond / f"journey-stage-{i+1}.png", optimize=True)

# Group stages into 3 cards: 1-2 work, 3-5 home, 6-7 night
groups = [(0, 2, "work"), (2, 5, "home"), (5, 7, "night")]
for a, b, name in groups:
    slice_w = sum(grid.crop((i * seg, 0, min((i + 1) * seg, gw), gh)).size[0] for i in range(a, b))
    out = Image.new("RGB", (slice_w, gh), (245, 245, 245))
    x = 0
    for i in range(a, b):
        part = grid.crop((i * seg, 0, min((i + 1) * seg, gw), gh))
        out.paste(part, (x, 0))
        x += part.size[0]
    out.save(bond / f"journey-{name}.png", optimize=True)

# Crop phones from page-31 for hero app floats
flow = Image.open(bond / "journey-flow.png").convert("RGB")
fw, fh = flow.size
# left phone area approx
phone1 = flow.crop((int(fw * 0.02), int(fh * 0.12), int(fw * 0.22), int(fh * 0.55)))
phone2 = flow.crop((int(fw * 0.22), int(fh * 0.12), int(fw * 0.42), int(fh * 0.55)))
phone1.save(bond / "app-01.png", optimize=True)
phone2.save(bond / "app-02.png", optimize=True)

# Crop hero toy from page-26 (center carrot product)
prod = Image.open(bond / "products.png").convert("RGB")
pw, ph = prod.size
toy = prod.crop((int(pw * 0.35), int(ph * 0.08), int(pw * 0.68), int(ph * 0.92)))
toy.save(bond / "toy-hero.png", optimize=True)

# Safety exploded layers (rough vertical bands)
exp = Image.open(safety / "exploded.png").convert("RGB")
ew, eh = exp.size
# content area
box = exp.crop((int(ew * 0.05), int(eh * 0.08), int(ew * 0.95), int(eh * 0.92)))
bw, bh = box.size
layers = [
    (0.0, 0.22, "layer-base"),
    (0.18, 0.45, "layer-mid"),
    (0.40, 0.68, "layer-upper"),
    (0.62, 0.88, "layer-top"),
]
for y1r, y2r, name in layers:
    y1, y2 = int(bh * y1r), int(bh * y2r)
    layer = box.crop((0, y1, bw, y2))
    layer.save(safety / f"{name}.png", optimize=True)

print("bond + safety assets ready")
