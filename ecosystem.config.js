const fs = require('fs')
const os = require('os')
const path = require('path')

// Nuxt 4 necesita Node >= 22.19, pero la versión por defecto del VPS sigue siendo la 18 (la usa Directus 9).
// La web arranca con la v22 de nvm; va en modo fork porque en cluster PM2 ignora `interpreter`.
const nvm = path.join(os.homedir(), '.nvm/versions/node')
const node22 = fs.existsSync(nvm) && fs.readdirSync(nvm)
    .filter(v => v.startsWith('v22.'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .pop()

// El token de Directus se lee del .env al arrancar: para cambiarlo basta con editar .env y
// `pm2 restart ecosystem.config.js --update-env` (sin recompilar)
const fichero = path.join(__dirname, '.env')
const dotenv = fs.existsSync(fichero) ? Object.fromEntries(fs.readFileSync(fichero, 'utf8').split('\n')
    .map(linea => linea.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/))
    .filter(Boolean)
    .map(([, clave, valor]) => [clave, valor.replace(/^(['"])(.*)\1$/, '$2')])) : {}

module.exports = {
    apps: [
      {
        name: 'Front Captotal',
        exec_mode: 'fork',
        interpreter: node22 ? path.join(nvm, node22, 'bin/node') : 'node',
        // Los pedidos pendientes de pago se guardan en .data/pagos (relativo a esta carpeta)
        cwd: __dirname,
        script: './.output/server/index.mjs',
        env: {
          ...(dotenv.NOTIFICATION_TOKEN && { NUXT_DIRECTUS_TOKEN: dotenv.NOTIFICATION_TOKEN })
        }
      }
    ]
}
