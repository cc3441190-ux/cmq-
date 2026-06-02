from pathlib import Path
from PIL import Image
import shutil

src = Path(r"d:\Users\86133\Desktop\cmq个人网站\assets\hardware\aura\source")
out = Path(r"d:\Users\86133\Desktop\cmq个人网站\assets\hardware\aura")
out.mkdir(parents=True, exist_ok=True)


def copy_page(page: str, name: str) -> None:
    shutil.copy2(src / page, out / name)
    print("copied", name)


copy_page("page-05.png", "priority-pyramid.png")
copy_page("page-11.png", "flow-chain.png")
copy_page("page-37.png", "cmf-material.png")
copy_page("page-40.png", "sensor-breakdown.png")

img31 = Image.open(src / "page-31.png").convert("RGB")
w, h = img31.size
box_top = int(h * 0.28)
box_bottom = int(h * 0.92)
box_left = int(w * 0.04)
box_right = int(w * 0.96)
crop = img31.crop((box_left, box_top, box_right, box_bottom))
cw, ch = crop.size
seg = cw // 4
for i in range(4):
    x1 = i * seg
    x2 = cw if i == 3 else (i + 1) * seg
    part = crop.crop((x1, 0, x2, ch))
    part.save(out / f"proto-0{i + 1}.png", optimize=True)
    print("proto", i + 1, part.size)

img32 = Image.open(src / "page-32.png").convert("RGB")
w, h = img32.size
grid_top = int(h * 0.22)
grid_bottom = int(h * 0.95)
grid_left = int(w * 0.03)
grid_right = int(w * 0.97)
grid = img32.crop((grid_left, grid_top, grid_right, grid_bottom))
gw, gh = grid.size
half_w, half_h = gw // 2, gh // 2
quads = [
    (0, 0, half_w, half_h),
    (half_w, 0, gw, half_h),
    (0, half_h, half_w, gh),
    (half_w, half_h, gw, gh),
]
for i, box in enumerate(quads, 1):
    part = grid.crop(box)
    part.save(out / f"test-0{i}.png", optimize=True)
    print("test", i, part.size)

print("done")
