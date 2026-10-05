#!/usr/bin/env bash
# Despliegue en el VPS, desde ~/Captotal:
#   ./desplegar.sh             actualiza desde git, compila aparte, prueba la build nueva y la activa
#   ./desplegar.sh --rollback  vuelve a la build anterior
# Mientras compila, la web sigue sirviendo la build actual: el corte es solo el reinicio de PM2 (segundos).
set -euo pipefail

APP="Front Captotal"

# PM2 y Directus siguen con la Node por defecto de nvm (18); la web se compila y ejecuta con la 22
source ~/.nvm/nvm.sh >/dev/null
NODE22="$(ls -d ~/.nvm/versions/node/v22.* | sort -V | tail -1)/bin"

reiniciar() {
    pm2 delete "$APP" >/dev/null 2>&1 || true
    pm2 start ecosystem.config.js
    pm2 save
}

esperar() {
    for _ in $(seq 1 30); do
        curl -s -o /dev/null --max-time 2 "http://127.0.0.1:$1/" && return 0
        sleep 1
    done
    return 1
}

responde() {
    local puerto=$1 ruta codigo
    shift
    for ruta in "$@"; do
        codigo=$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 "http://127.0.0.1:$puerto$ruta")
        echo "  $ruta -> $codigo"
        [ "$codigo" = 200 ] || return 1
    done
}

intercambiar() {
    mv .output .output-tmp && mv .output-anterior .output && mv .output-tmp .output-anterior
}

main() {
    cd "$(dirname "$0")"

    if [ "${1:-}" = "--rollback" ]; then
        [ -d .output-anterior ] || { echo "No hay build anterior"; exit 1; }
        intercambiar
        reiniciar
        exit 0
    fi

    git pull --ff-only
    PATH="$NODE22:$PATH" npm ci --no-audit --no-fund
    rm -rf .output-nueva
    NITRO_OUTPUT_DIR=.output-nueva PATH="$NODE22:$PATH" npm run build

    echo "Probando la build nueva en 127.0.0.1:3001..."
    HOST=127.0.0.1 PORT=3001 "$NODE22/node" .output-nueva/server/index.mjs > /tmp/captotal-prueba.log 2>&1 &
    local prueba=$!
    if ! { esperar 3001 && responde 3001 / /Cursos /Curso/cap-inicial-mercancias /sitemap.xml; }; then
        kill $prueba 2>/dev/null || true
        echo "La build nueva falla: no se activa"
        tail -20 /tmp/captotal-prueba.log
        exit 1
    fi
    kill $prueba

    rm -rf .output-anterior
    mv .output .output-anterior
    mv .output-nueva .output
    reiniciar

    if esperar 3000 && responde 3000 / /Cursos; then
        echo "Desplegado. Para volver atrás: ./desplegar.sh --rollback"
    else
        echo "La web no responde tras el cambio: vuelvo a la build anterior"
        intercambiar
        reiniciar
        exit 1
    fi
}

# Todo dentro de main: bash lee el script entero antes de que git pull lo pueda modificar
main "$@"
