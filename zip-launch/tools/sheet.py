import sys, glob
from PIL import Image, ImageDraw
files = sorted(glob.glob('out/wf/f*.jpg')); step = float(sys.argv[1]) if len(sys.argv) > 1 else .5
per, cols = 45, 5
for s in range(0, len(files), per):
    chunk = files[s:s + per]; w, h = Image.open(chunk[0]).size
    rows = (len(chunk) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * w, rows * (h + 18)), (30, 30, 30)); d = ImageDraw.Draw(sheet)
    for i, f in enumerate(chunk):
        x, y = (i % cols) * w, (i // cols) * (h + 18)
        sheet.paste(Image.open(f), (x, y + 18)); d.text((x + 4, y + 3), f'{(s + i) * step:.1f}s', fill=(255, 255, 255))
    sheet.save(f'out/check/watch_{s // per}.jpg', quality=85)
print('ok')
