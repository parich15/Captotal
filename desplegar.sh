#!/usr/bin/env bash
# ./desplegar.sh SHA [--solo-preparar] | --activar SHA | --rollback
set -euo pipefail
cd "$(dirname "$0")"
source ~/.nvm/nvm.sh >/dev/null
NODE22="$(ls -d ~/.nvm/versions/node/v22.* | sort -V | tail -1)/bin"
APP="Front Captotal"
reiniciar() {
    pm2 delete "$APP" >/dev/null 2>&1 || true
    pm2 start ecosystem.config.js
    pm2 save >/dev/null
}
responde() {
    local puerto=$1 ruta codigo
    shift
    for ruta in "$@"; do
        codigo=$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 "http://127.0.0.1:$puerto$ruta") || return 1
        echo "  $ruta -> $codigo"
        [ "$codigo" = 200 ] || return 1
    done
}
esperar() {
    for _ in $(seq 1 30); do
        if curl --fail -s -o /dev/null --max-time 2 "http://127.0.0.1:$1/"; then return 0; fi
        sleep 1
    done
    return 1
}
compatible() {
    "$NODE22/node" -e 'const f=require("fs");try{process.exit(JSON.parse(f.readFileSync(process.argv[1]+"/captotal-release.json")).esquema===2?0:1)}catch{process.exit(1)}' "$1"
}
activar() {
    local sha=$1
    "$NODE22/node" -e 'const r=require("./.output-nueva/captotal-release.json");if(r.sha!==process.argv[1]||r.esquema!==2)process.exit(1)' "$sha"
    rm -rf .output-anterior
    [ ! -d .output ] || mv .output .output-anterior
    mv .output-nueva .output
    reiniciar
    if esperar 3000 && responde 3000 / /Cursos /Curso/cap-inicial-mercancias /sitemap.xml; then
        # Primera recuperación: copia de esta build comprobada. En siguientes
        # entregas, --rollback puede restaurar la anterior compatible.
        if ! compatible .output-anterior; then
            rm -rf .output-recuperacion
            cp -a .output .output-recuperacion
        fi
        echo "Desplegado $sha"
    else
        if compatible .output-anterior; then
            rm -rf .output-fallida
            mv .output .output-fallida
            mv .output-anterior .output
            reiniciar
        fi
        echo 'Fallo tras activar. No se restaura una build incompatible con pagos/permisos.' >&2
        return 1
    fi
}
if [ "${1:-}" = '--rollback' ]; then
    origen=.output-anterior
    compatible "$origen" || origen=.output-recuperacion
    compatible "$origen" || { echo 'No existe build de recuperación compatible' >&2; exit 1; }
    rm -rf .output-fallida
    mv .output .output-fallida
    cp -a "$origen" .output
    reiniciar
    esperar 3000 && responde 3000 / /Cursos
    exit
fi
if [ "${1:-}" = '--activar' ]; then
    activar "$(git rev-parse "${2:?Falta SHA}^{commit}")"
    exit
fi
ref=${1:?Uso: ./desplegar.sh SHA [--solo-preparar]}
[ -z "$(git status --porcelain --untracked-files=no)" ] || { echo 'El checkout tiene cambios; no se despliega' >&2; exit 1; }
sha=$(git rev-parse "$ref^{commit}")
git checkout --detach "$sha"
PATH="$NODE22:$PATH" npm ci --no-audit --no-fund >/dev/null
rm -rf .output-nueva
NITRO_OUTPUT_DIR=.output-nueva PATH="$NODE22:$PATH" npm run build
"$NODE22/node" -e 'require("fs").writeFileSync(".output-nueva/captotal-release.json",JSON.stringify({sha:process.argv[1],esquema:2}))' "$sha"
HOST=127.0.0.1 PORT=3001 "$NODE22/node" --env-file=.env .output-nueva/server/index.mjs > /tmp/captotal-prueba.log 2>&1 &
prueba=$!
trap 'kill "$prueba" 2>/dev/null || true' EXIT
if ! { esperar 3001 && responde 3001 / /Cursos /Curso/cap-inicial-mercancias /sitemap.xml; }; then
    echo 'Candidato rechazado; la web actual sigue activa' >&2
    exit 1
fi
kill "$prueba" 2>/dev/null || true
trap - EXIT
if [ "${2:-}" != '--solo-preparar' ]; then activar "$sha"; fi
