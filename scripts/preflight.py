#!/usr/bin/env python3
"""Read-only poster input/disk checks and deterministic resume key. No deletion."""
import argparse,hashlib,json,math,os,shutil,sys
from pathlib import Path

def digest(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
    return h.hexdigest()

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--source',required=True);p.add_argument('--manifest',required=True)
    p.add_argument('--output',required=True);p.add_argument('--asset',action='append',default=[])
    p.add_argument('--script',action='append',required=True)
    p.add_argument('--scratch',default='/');p.add_argument('--min-free-gb',type=float,default=10)
    a=p.parse_args();issues=[];files={};out=Path(a.output)
    for value in [a.source,a.manifest]+a.asset+a.script:
        f=Path(value)
        if not f.is_file():issues.append('MISSING_INPUT '+str(f));continue
        files[str(f.resolve())]=digest(f)
    try:
        m=json.loads(Path(a.manifest).read_text(encoding='utf-8'));seen=set()
        if not isinstance(m,dict):raise ValueError('manifest must be one object')
        for t in m.get('texts',[]):
            n=t.get('name');box=t.get('box',[])
            if not n or n in seen:issues.append('INVALID_OR_DUPLICATE_TEXT_NAME '+str(n))
            seen.add(n)
            if len(box)!=4 or any(not isinstance(x,(int,float)) or not math.isfinite(x) for x in box) or box[2]<=0 or box[3]<=0:issues.append('INVALID_BOX '+str(n))
            if not isinstance(t.get('text'),str) or not t['text'].strip():issues.append('EMPTY_COPY '+str(n))
            if not t.get('font'):issues.append('FONT_UNSPECIFIED '+str(n))
        if not m.get('texts'):issues.append('EMPTY_TEXT_INVENTORY')
    except (OSError,ValueError,TypeError,KeyError) as e:issues.append('INVALID_MANIFEST '+str(e))
    disks={}
    for label,raw in [('output',out),('scratch',Path(a.scratch))]:
        # Do not create directories or mask disconnected drives/broken symlinks.
        f=raw
        if f.is_symlink() and not f.exists():issues.append('BROKEN_LINK '+str(f));continue
        resolved=f.resolve()
        if str(resolved).startswith('/Volumes/'):
            volume=Path('/Volumes')/resolved.parts[2]
            if not volume.is_mount():issues.append('VOLUME_NOT_MOUNTED '+str(volume));continue
        while not f.exists() and f!=f.parent:
            if f.is_symlink():issues.append('BROKEN_LINK '+str(f));break
            f=f.parent
        if not f.exists():continue
        free=shutil.disk_usage(f).free;disks[label]={'path':str(f.resolve()),'free_bytes':free}
        if free<a.min_free_gb*1024**3:issues.append('LOW_DISK_SPACE '+label)
    canonical=json.dumps({'inputs':files},sort_keys=True,separators=(',',':')).encode()
    result={'status':'FAIL' if issues else 'PASS','run_key':hashlib.sha256(canonical).hexdigest(),'inputs':files,'disks':disks,'issues':issues,'note':'Preflight does not verify Photoshop scratch configuration, visual fidelity, or element completeness.'}
    print(json.dumps(result,ensure_ascii=False,indent=2));return 2 if issues else 0
if __name__=='__main__':sys.exit(main())
