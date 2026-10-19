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

## Revisión de octubre y despliegue

Los pagos se firman en servidor con precio y disponibilidad de Directus. El alta del alumno requiere una respuesta bancaria verificada; el retorno del navegador no acredita el cobro. Los pedidos se conservan en `.data/pagos`, separados de la build.

Variables y operación: [.env.example](.env.example) y [revisión de octubre](docs/revision-octubre.md). El VPS carga NUXT_* desde `.env` al arrancar PM2. No guardar secretos en Git.

```bash
npm test
./desplegar.sh SHA --solo-preparar
./desplegar.sh --activar SHA
```

El despliegue exige una revisión exacta, prueba la build en el puerto 3001 y conserva recuperación compatible. Directus requiere preparar los campos y el rol privado antes de activar, y cerrar permisos públicos después de comprobar las APIs.
