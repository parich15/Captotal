module.exports = {
    apps: [
      {
        name: 'Front Captotal',
        exec_mode: 'cluster',
        instances: 'max',
        // Los pedidos pendientes de pago se guardan en .data/pagos (relativo a esta carpeta)
        cwd: __dirname,
        script: './.output/server/index.mjs'
      }
    ]
}
