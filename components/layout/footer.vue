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
          <img class="w-auto h-20" width="200" height="85" src="~~/src/logo.webp" alt="Logo Cap Total Footer">
        </div>

        <div class="mt-12 space-y-4 lg:mt-0">
          <span class="rounded bg-orange-500 lg:block lg:h-1 lg:w-10"></span>

          <div class="text-center lg:text-left">
            <h5 class="font-medium text-white font-titulo text-3xl">Únete a nuestra newsletter!</h5>

            <p
              class="mx-auto mt-4 max-w-md text-sm leading-relaxed text-gray-400 lg:mx-0 font-texto"
            >
            Súmate a nuestra newsletter para conocer todas nuestras ofertas y enterarte de todo lo que pasa en el sector. Suscríbete y enterate de todas las novedades en materia de transportes.
            </p>
          </div>

          <form class="mt-6 font-titulo" @submit="enviarForm">
            <div class="relative mx-auto max-w-lg lg:mx-0">
              <label class="sr-only" for="email"> Email </label>

              <input
                v-model="Email"
                class="w-full rounded-md border-none bg-gray-800 py-4 pl-3 pr-16 text-sm text-white"
                id="email"
                type="email"
                placeholder="Introduce tu email"
              />

              <button
                aria-label="Boton Subscripcion sNewsletter"
                class="absolute top-1/2 right-1.5 -translate-y-1/2 rounded bg-orange-400 p-3 text-white transition enabled:hover:bg-orange-500 enabled:hover:scale-105"
                type="submit"
                :disabled="comprobarCampo"
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
            <p v-if="Enviado" class="text-white font-texto text-sm ml-1 mt-2">Añadido a nuestra newsletter!</p>
            <p v-if="Error" class="text-red-500 font-texto text-sm ml-1 mt-2">Email ya en uso</p>

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
            <img src="~~/src/logo.webp" alt="Logo Cap Total Footer PC">
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
          <p class="text-xs text-center lg:text-left text-gray-800 mt-5 opacity-80 font-titulo">Made with &lt3 by Paric.io </p>
        </div>
      </div>
    </div>
  </div>
</footer>

</template>

<script setup>
import { useMenu } from '~~/composables/useMenu';

const {data, getMenu} = useMenu();
const { createItems } = useDirectusItems();
const Email = ref(null);
const Error = ref(false);
const Enviado = ref(false);

const enviarForm = async (e) => {
  e.preventDefault();
  try {
    Error.value = false;
    let items = {
      Email: Email.value
    }
    await createItems({collection:'Newsletter', items});
    Enviado.value = true;
    setTimeout(() => {
      Enviado.value = false,
      Email.value = null
    }, 3000);
  } catch (error) {
    Error.value = true;
    setTimeout(() => {
      Error.value = false;
    }, 3000);
  }
}

const comprobarCampo = computed(()=> {
  if(Email.value != null){
    return false
  }else{
    return true
  }
})

await getMenu(2);
</script>