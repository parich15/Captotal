import {RenderResponse} from "nitropack";

export default defineNitroPlugin((nitroApp) => {
    nitroApp.hooks.hook('render:response', (response: RenderResponse) => {
        delete response.headers['x-powered-by'];
    })
})