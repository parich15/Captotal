# Captotal

Web de [captotal.com](https://captotal.com) hecha con [Nuxt 4](https://nuxt.com/docs) y Directus como CMS.

## Setup

```bash
npm install
```

## Desarrollo

Servidor en http://localhost:3000

```bash
npm run dev
```

## Producción

```bash
npm run build
pm2 start ecosystem.config.js
```

Previsualizar la build en local:

```bash
npm run preview
```

## Pagos (Redsys)

La firma de Redsys se hace en el servidor (`server/api/pago/`); el precio sale siempre de Directus.

1. `POST /api/pago/firmar`: crea el pedido pendiente en `.data/pagos/` (se borra a los 7 días) y devuelve la firma.
2. Redsys notifica el pago a `POST /api/pago/notificacion` y devuelve al usuario a `/Pago/Completo?status=ok&order=…`.
3. El alumno se da de alta en Directus una sola vez por pedido, con lo primero que llegue de los dos.

Variables de entorno opcionales (solo servidor):

- `NUXT_PAGO_VERIFICACION`: `flexible` (por defecto, da de alta aunque Redsys no mande respuesta firmada) o `estricta` (solo con respuesta firmada de Redsys).
- `NUXT_DIRECTUS_TOKEN`: token de Directus (por defecto `NOTIFICATION_TOKEN` del `.env` en el build).
- `NUXT_REDSYS_SECRETO`: clave del comercio en Redsys.

En los logs (`pm2 logs`) las líneas `[pagos]` indican si llegan las notificaciones y la respuesta firmada en la URL.
