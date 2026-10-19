#!/usr/bin/env python3
"""Ejecutar con sudo en el VPS. Solo configura IP real en el frontend de Captotal."""
from pathlib import Path
import re, subprocess, shutil
p = Path('/etc/nginx/sites-available/captotal.com')
s = p.read_text()
patron = r'(location\s+/\s*\{\s*proxy_pass\s+http://localhost:3000;)(.*?)(\n\s*\})'
m = re.search(patron, s, re.S)
if not m:
    raise SystemExit('No se encuentra el bloque esperado del frontend; no se modifica nginx')
if 'proxy_set_header X-Real-IP $remote_addr;' in m[2]:
    print('El frontend ya transmite la IP real')
else:
    copia = p.with_name('captotal.com.antes-octubre')
    if not copia.exists():
        shutil.copy2(p, copia)
    nuevo = s[:m.start()] + m[1] + m[2] + '\n        proxy_set_header X-Real-IP $remote_addr;' + m[3] + s[m.end():]
    p.write_text(nuevo)
    try:
        subprocess.run(['nginx', '-t'], check=True)
        subprocess.run(['systemctl', 'reload', 'nginx'], check=True)
    except Exception:
        p.write_text(s)
        raise
    print('Proxy validado y recargado')
