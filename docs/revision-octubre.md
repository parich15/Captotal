# Revisión de octubre de 2026

## Entrega

| Punto | Implementación y evidencia | Pendiente externo |
| --- | --- | --- |
| 1 Banners | Diseño existente con botones a #Precios y llamada; teléfono desde Directus | — |
| 2 Garantía | Eliminada propiedad sin consumidores | — |
| 3 Consentimiento | Voluntario y desmarcado; etiqueta por curso; decisión, fecha y copia del texto en Interesados | — |
| 4 Newsletter | API privada, reCAPTCHA v3, acción newsletter, puntuación mínima 0,5, honeypot, deduplicación y límite 5 intentos/10 minutos/IP | Verificado con Google: success, action newsletter, hostname captotal.com y score 0,9; monitorizar tráfico real |
| 5 Metatítulos | Meta_Titulo en title/meta/og:title, respaldo actual; Posts sin campo SEO conserva título; retirado script Clickrank que sobrescribía el title tras hidratar | — |
| 6 Título pago | Layout adaptable; comprobado 360/768/1440 sin overflow | — |
| 7 Redsys | Secretos servidor, firma/correspondencia verificada, revisión parcial de logs | Export del TPV y prueba en entorno bancario de pruebas |
| 8 Datos pago | Validación compartida, estado persistido, alta idempotente y Total decimal | — |
| 9 Legacy | Inventario HTTP, 14 redirects nginx contrastados y 2 añadidos hacia Online | Search Console y acceso a logs nginx |
| 10 FAQ | Respuesta presente en HTML inicial, acordeón con teclado/ARIA | — |
| 11 Eventos | Contrato inferior y deduplicación por pedido con consentimiento | GTM/Tag Assistant y recepción GA4/Ads |
| 12 Cookies | Reabrir, aceptar/rechazar, retirar consentimiento y limpiar cookies propias identificadas | Auditoría del contenedor GTM cuando se facilite |
| 13 Fechas | dd/mm/aaaa; date-only preservado y timestamps Europe/Madrid | — |

No se afirma indexación a partir de respuestas HTTP. El inventario está en `urls-legacy.csv`.
Los últimos 2 MB de cada log accesible de frontend contenían dos respuestas 9915: cancelación por el usuario según https://pagosonline.redsys.es/desarrolladores-inicio/integrate-con-nosotros/parametros-de-entrada-y-salida/ . Esta muestra no explica el conjunto de las denegaciones reportadas.

## Eventos

| Evento | Emisión |
| --- | --- |
| generate_lead | Alta confirmada del contacto o interesado |
| sign_up | Suscripción nueva confirmada; no duplicado |
| begin_checkout | Entrada con curso disponible |
| add_payment_info | Firma obtenida, antes de enviar a Redsys; mide salida a pasarela |
| purchase | Pedido autorizado y consentimiento; transaction_id y deduplicación local |

GTM-KXG3CPPH es el único cargador de etiquetas. Revisado que no existe vue-gtag en package.json, lockfile ni código, ni carga directa de gtag.js. Las órdenes de Consent Mode usan el mismo dataLayer y no instalan otro tracker. Sin consentimiento no se envían eventos. Añadir en GTM disparadores de evento personalizado con estos nombres y etiquetas GA4/ecommerce; verificar en Preview antes de publicar el contenedor. No enviar nombre, email, teléfono o documento a Analytics.
`add_payment_info` no observa la introducción de tarjeta, que sucede en Redsys.

## Operación y recuperación

Node 22.19 o posterior. Copiar `.env.example` a `.env` y completar solo en el servidor. PM2 carga NUXT_* al arrancar; no se embeben secretos en el cliente. El token de servidor es de un usuario sin acceso administrativo al CMS. `NUXT_PUBLIC_RECAPTCHA_SITE_KEY` es pública, `NUXT_RECAPTCHA_SECRET` es privada. V3 ejecuta la acción newsletter al enviar; el servidor exige success, hostname, action y score >= NUXT_RECAPTCHA_MIN_SCORE (0,5 por defecto), además del límite por IP. No usa casilla v2. Google valida caducidad y uso único del token.

Preparación Directus: `DIRECTUS_ADMIN_TOKEN=... node scripts/directus-octubre.mjs --prepare` desde el checkout del VPS, con token en entorno privado. Crea campos, convierte Total a decimal(12,2), añade Pedido_Verificado único nullable y prepara usuario/rol Web Captotal. Guarda copia de campos y permisos en `.data/migraciones` o DIRECTUS_MIGRATION_BACKUP. La etiqueta se inicializa solo si estaba vacía. La preparación rota únicamente el token del usuario de servicio propio: reiniciar PM2 si se repite tras activar la web.

Antes del primer despliegue respaldar `.env`, configuración, build y `.data/pagos` fuera de Git. Instalar el ajuste mínimo del proxy con `sudo python3 scripts/configurar-proxy.py` y configurar NUXT_TRUSTED_PROXY_IPS solo para loopback después de verificarlo.

Despliegue por revisión exacta disponible localmente en el VPS:

```bash
./desplegar.sh SHA --solo-preparar
./desplegar.sh --activar SHA
# Solo después de comprobar el frontend y las APIs privadas:
node scripts/directus-octubre.mjs --close
```

La última orden requiere el token administrador en entorno. Retira accesos públicos a Alumnos, Interesados, Newsletter, Mensajes y notificaciones; mantiene lecturas públicas de contenido. Una prueba POST pública con cuerpo vacío debe recibir 403, sin crear filas. Se conserva la build actual durante compilación/prueba de puerto 3001. Los pedidos están fuera de `.output`.

`./desplegar.sh --rollback` solo restaura builds de esquema 2 compatibles con pagos y permisos. En la primera entrega conserva una copia de recuperación de la nueva build comprobada; esa copia recupera archivos, no revierte defectos del mismo código. El respaldo antiguo requiere una restauración coordinada de aplicación/permisos y revisión de los pedidos nuevos: no se activa automáticamente. Las nuevas columnas, importes y evidencias no se borran para recuperar una build.

Reconciliación (vista previa predeterminada):

```bash
node --env-file=.env --experimental-strip-types scripts/reconciliar-pagos.mjs --limite 10
node --env-file=.env --experimental-strip-types scripts/reconciliar-pagos.mjs --pedido NUMERO --aplicar
```

Solo reintenta autorizaciones con evidencia firmada verificable. Pedidos antiguos sin prueba permanecen pendientes. Si un legado tiene alumno coherente se vincula; si es ambiguo no crea otro. Ante rotación bancaria de clave, conciliar previamente las evidencias pendientes con la clave anterior; no sustituirla sin coordinar TPV y servidor. La clave anteriormente versionada debe sustituirse con el titular del comercio si era activa.

Los JSON usan permisos 600 y directorio 700. Solo pendientes nuevos sin evidencia caducan a los siete días; conservar pagos verificados y legados hasta acordar retención. Una guardia `.recovery` abandonada requiere comprobar que no hay proceso activo y retirarla con la aplicación detenida; no borrar bloqueos por antigüedad mientras haya escritores.

## Verificación

`npm test`: 20 casos críticos de validación, firma/correspondencia, concurrencia, fallo recuperable Directus, legados y antibots. Sin framework añadido. Build de producción y pruebas de HTML SSR y navegador: title SEO, FAQ, fechas, 404 reales, cookies y checkout responsive. No se han ejecutado cobros reales.

Para repetir inventario: `node scripts/auditar-urls.mjs https://captotal.com - /ruta/config-nginx.txt > /tmp/urls-legacy.csv`. Comprobar que los dos alias de Online respondan 301 después del despliegue.
