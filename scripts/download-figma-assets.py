"""Fetch only exact asset URLs provided by the Figma design context."""
from pathlib import Path
import json,subprocess,concurrent.futures,time,hashlib
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'brief/figma-source/assets.json').read_text())
out=root/'public/figma';out.mkdir(parents=True,exist_ok=True)
def fetch(item):
    url,target=item;path=root/'public'/target.lstrip('/')
    if path.is_file() and path.stat().st_size:return target
    for attempt in range(3):
        try:
            subprocess.run(['curl','-f','-L','-sS','--max-time','90','-o',str(path),url],check=True,capture_output=True)
            assert path.stat().st_size>0
            return target
        except Exception:
            if attempt==2:raise
            time.sleep(1+attempt)
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    for i,name in enumerate(pool.map(fetch,manifest.items())):
        if i%25==0:print('ASSET_READY',i,name,flush=True)
report={name:{'bytes':(root/'public'/name.lstrip('/')).stat().st_size} for name in manifest.values()}
(root/'brief/figma-source/asset-verification.json').write_text(json.dumps(report,indent=2))
print('ALL_ASSETS_READY',len(report),flush=True)
