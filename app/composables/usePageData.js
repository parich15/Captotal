export const usePageData = () =>{
    const { getItems } = useDirectusItems();
    const datos = ref(null);
    const secciones = ref(null);
    const datosCarousel = ref(null);

    const getPageData = async (id) => {
        datos.value = await useCargarDatos(`pagina-${id}`, () => getItems({
            collection: 'Paginas/'+ id
        }));
        return datos;
    }

    const getPageSections = async (id) => {
        secciones.value = await useCargarDatos(`pagina-secciones-${id}`, async () => {
            const res = await getItems({
                collection: 'Paginas/'+ id,
                params:{
                    fields: 'Secciones.Content.item.*'
                }
            });
            return res.Secciones;
        });
        return secciones;
    }

    const getBloquesSections = async (id) => {
        return await useCargarDatos(`bloque-${id}`, () => getItems({
            collection: 'Bloques_Estaticos/' + id,
            params:{
                fields: 'Contenido.Content.item.*'
            }
        }));
    }

    const getCarouselData = async (id) =>{
        datosCarousel.value = await useCargarDatos(`carousel-${id}`, async () => {
            const res = await getItems({
                collection: '/Carousel/' + id,
                params: {
                    fields: "Slide"
                }
            });
            return res.Slide;
        });
    }


    return {
        datos,
        secciones,
        datosCarousel,
        getPageData,
        getPageSections,
        getBloquesSections,
        getCarouselData
    }
}
