export default defineNitroPlugin((nitroApp) => {
    nitroApp.hooks.hook('render:response', (response) => {
        delete response.headers['x-powered-by'];
    })
})
