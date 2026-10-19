<template>
    <!--
  This component uses @tailwindcss/forms

  yarn add @tailwindcss/forms
  npm install @tailwindcss/forms

  plugins: [require('@tailwindcss/forms')]
-->

<footer id="footer" class="bg-gray-900">
  <div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
    <div class="lg:grid lg:grid-cols-2">
      <div
        class="border-b border-gray-800 py-16 lg:order-last lg:border-b-0 lg:border-l lg:py-24 lg:pl-12"
      >
        <div class="flex justify-center lg:hidden">
          <img class="w-auto h-20" width="200" height="85" src="~/assets/img/logo.webp" alt="Logo Cap Total Footer">
        </div>

        <div class="mt-12 space-y-4 lg:mt-0">
          <span class="rounded bg-orange-500 lg:block lg:h-1 lg:w-10"></span>

          <div class="text-center lg:text-left">
            <p class="font-medium text-white font-titulo text-3xl">Únete a nuestra newsletter!</p>

            <p
              class="mx-auto mt-4 max-w-md text-sm leading-relaxed text-gray-400 lg:mx-0 font-texto"
            >
            Súmate a nuestra newsletter para conocer todas nuestras ofertas y enterarte de todo lo que pasa en el sector. Suscríbete y enterate de todas las novedades en materia de transportes.
            </p>
          </div>

          <form class="mt-6 font-titulo" @submit.prevent="enviarForm">
            <div class="relative mx-auto max-w-lg lg:mx-0">
              <label class="sr-only" for="email"> Email </label>

              <input
                v-model="Email"
                @focus="prepararCaptcha"
                required maxlength="254" autocomplete="email"
                class="w-full rounded-md border-none bg-gray-800 py-4 pl-3 pr-16 text-sm text-white"
                id="email"
                type="email"
                placeholder="Introduce tu email"
              />

              <button
                aria-label="Suscribirme a la newsletter"
                class="absolute top-1/2 right-1.5 -translate-y-1/2 rounded bg-orange-400 p-3 text-white transition enabled:hover:bg-orange-500 enabled:hover:scale-105"
                type="submit"
                :disabled="enviando || !Email || !captchaToken"
              >
                <svg
                  class="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>
            </div>
            <div class="absolute -left-[10000px]" aria-hidden="true">
              <label for="newsletter-website">Web</label>
              <input id="newsletter-website" v-model="website" type="text" tabindex="-1" autocomplete="off">
            </div>
            <div ref="captchaContenedor" class="mt-3"></div>
            <p v-if="cargandoCaptcha" class="text-white text-sm mt-2" role="status">Cargando verificación…</p>
            <button v-if="errorMensaje && !captchaToken && !cargandoCaptcha" type="button" class="text-white text-sm underline mt-2" @click="prepararCaptcha">Volver a cargar la verificación</button>
            <p v-if="Enviado" class="text-white font-texto text-sm ml-1 mt-2">Tu suscripción a la newsletter está activa.</p>
            <p v-if="errorMensaje" class="text-red-500 font-texto text-sm ml-1 mt-2" role="alert">{{ errorMensaje }}</p>

          </form>
          <div class="flex ml-1">
            <a href="https://www.facebook.com/captotal/" rel="nofollow" target="_blank" class="group">
              <div class="group-hover:bg-orange-500 rounded-full transition duration-300">
                <img loading="lazy" src="../../assets/img/Facebook.svg" class="h-6 w-6 " alt="Logo Facebook">
              </div>
            </a>
            <a href="https://www.instagram.com/captotal/" rel="nofollow" target="_blank" class="group mx-5">
              <div class="group-hover:bg-orange-500 rounded-full transition duration-300">
                <img loading="lazy" src="../../assets/img/Instagram.svg" class="h-6 w-6 " alt="Logo Instagram">
              </div>
            </a>
            <a href="https://www.linkedin.com/in/captotal/" rel="nofollow" target="_blank" class="group">
              <div class="group-hover:bg-orange-500 rounded-full transition duration-300">
                <img loading="lazy" src="../../assets/img/Linkedin.svg" class="h-6 w-6 " alt="Logo Linkedin">
              </div>
            </a>
            
          </div>
        </div>
      </div>

      <div class="pt-16 pb-8 lg:pt-24 lg:pr-12">
        <div class="hidden lg:flex">
            <img src="~/assets/img/logo.webp" alt="Logo Cap Total Footer PC" width="200" height="85">
        </div>

        <div class="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:mt-12">
          
          <div class="text-center lg:text-left" v-for="enlace in data">
            <p class="text-lg  text-white font-titulo font-bold">{{enlace.Nombre}}</p>
            
            <nav class="mt-4">
              <ul class="space-y-1.5 text-sm">
                <li v-for="submenu in enlace.Submenu">
                  <NuxtLink :to="submenu.Url" class="text-white font-texto transition hover:text-white/75">
                    {{ submenu.Nombre }}
                  </NuxtLink>
                </li>
              </ul>
            </nav>
          </div>
        </div>


        <div
          class="mt-16 border-t border-gray-800 pt-8 text-sm text-white lg:mt-24"
        >

          <p class="mt-4 text-center lg:text-left">
            &copy; {{new Date().getFullYear()}} Cap Total S.L , Todos los derechos reservados.
          </p>
          <button type="button" class="block mx-auto lg:mx-0 mt-4 underline hover:text-orange-400 font-texto" @click="abrirCookies">Configurar cookies</button>
          <p class="text-xs text-center lg:text-left text-gray-800 mt-5 opacity-80 font-titulo">Made with &lt3 by Paric.io </p>
        </div>
      </div>
    </div>
  </div>
</footer>

</template>

<script setup>
import { useMenu } from '~/composables/useMenu';

const { data, getMenu } = useMenu();
const { enviar } = useDataLayer();
const config = useRuntimeConfig();
const Email = ref('');
const errorMensaje = ref('');
const Enviado = ref(false);
const enviando = ref(false);
const website = ref('');
const captchaToken = ref('');
const captchaContenedor = ref(null);
const cargandoCaptcha = ref(false);
let captchaId;
let cargaCaptcha;
let desmontado = false;

const abrirCookies = () => window.dispatchEvent(new Event('captotal:configurar-cookies'));

// La API y el widget sólo se cargan al interactuar con el formulario.
const prepararCaptcha = async () => {
  if (desmontado || cargandoCaptcha.value) return;
  if (captchaId !== undefined) {
    errorMensaje.value = '';
    reiniciarCaptcha();
    return;
  }
  errorMensaje.value = '';
  if (!config.public.recaptchaSiteKey) {
    errorMensaje.value = 'La suscripción no está disponible. Inténtalo más tarde.';
    return;
  }
  cargandoCaptcha.value = true;
  try {
    if (!window.grecaptcha?.render) {
      cargaCaptcha ||= new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const timeout = setTimeout(() => {
          script.remove();
          delete window.captotalCaptchaReady;
          reject(new Error('timeout'));
        }, 12000);
        window.captotalCaptchaReady = () => {
          clearTimeout(timeout);
          delete window.captotalCaptchaReady;
          resolve();
        };
        script.src = 'https://www.google.com/recaptcha/api.js?onload=captotalCaptchaReady&render=explicit&hl=es';
        script.async = true;
        script.onerror = () => {
          clearTimeout(timeout);
          script.remove();
          delete window.captotalCaptchaReady;
          reject(new Error('captcha'));
        };
        document.head.appendChild(script);
      });
      await cargaCaptcha;
    }
    if (desmontado) return;
    captchaId = window.grecaptcha.render(captchaContenedor.value, {
      sitekey: config.public.recaptchaSiteKey,
      size: 'compact',
      callback: token => { captchaToken.value = token; errorMensaje.value = ''; },
      'expired-callback': () => { captchaToken.value = ''; },
      'error-callback': () => { captchaToken.value = ''; errorMensaje.value = 'No se pudo verificar. Inténtalo de nuevo.'; },
    });
  } catch {
    cargaCaptcha = undefined;
    errorMensaje.value = 'No se pudo cargar la verificación. Comprueba tu conexión y vuelve a intentarlo.';
  } finally {
    cargandoCaptcha.value = false;
  }
};

const reiniciarCaptcha = () => {
  captchaToken.value = '';
  if (captchaId !== undefined) window.grecaptcha?.reset(captchaId);
};

const enviarForm = async () => {
  if (enviando.value) return;
  if (!captchaToken.value) { await prepararCaptcha(); return; }
  enviando.value = true;
  errorMensaje.value = '';
  Enviado.value = false;
  try {
    const respuesta = await $fetch('/api/newsletter', {
      method: 'POST',
      body: { Email: Email.value, recaptchaToken: captchaToken.value, website: website.value },
    });
    if (respuesta.created) enviar({ event: 'sign_up', method: 'newsletter' });
    Enviado.value = true;
    Email.value = '';
  } catch (error) {
    errorMensaje.value = error?.data?.statusMessage || 'No se pudo guardar la suscripción. Vuelve a intentarlo.';
  } finally {
    enviando.value = false;
    reiniciarCaptcha();
  }
};

onBeforeUnmount(() => { desmontado = true; });
await getMenu(2);
</script>
