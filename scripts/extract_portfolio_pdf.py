import fitz
from pathlib import Path

pdf = Path("assets/hardware/portfolio.pdf")
base = Path("assets/hardware")
for name in ("bond", "safety", "portfolio-source"):
    (base / name).mkdir(parents=True, exist_ok=True)

doc = fitz.open(pdf)
out = base / "portfolio-source"
for i in range(len(doc)):
    doc[i].get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False).save(out / f"page-{i+1:02d}.png")

print("pages", len(doc))
keywords = ("BOND", "bond", "PLAY", "SAFETY", "??", "??", "??", "90.5", "??", "Aura", "??")
for i, p in enumerate(doc, 1):
    t = p.get_text("text")
    if any(k in t for k in keywords):
        print(f"{i:02d}", t.replace("\n", " ")[:140])
