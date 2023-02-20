module.exports = {
    apps: [
      {
        name: 'Front Captotal',
        exec_mode: 'cluster',
        instances: 'max',
        script: './.output/server/index.mjs'
      }
    ]
}