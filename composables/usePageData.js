export const usePageData = () =>{
    const { getItems } = useDirectusItems();
    const datos = ref(null);
    const secciones = ref(null);
    const datosCarousel = ref(null);

    const getPageData = async (id) => {
        const res = await getItems({
            collection: 'Paginas/'+ id
        });
        datos.value = res;
        return datos;
    }

    const getPageSections = async (id) => {
        const res = await getItems({
            collection: 'Paginas/'+ id,
            params:{
                fields: 'Secciones.Content.item.*'
            }
        });
        secciones.value = res.Secciones;
        return secciones;
        
    }

    const getCarouselData = async (id) =>{
        try {
            const res = await getItems({
                collection: '/Carousel/' + id,
                params: {
                    fields: "Slide"
                }
            })
            datosCarousel.value = res.Slide;
        } catch (e) {
            console.log(e);
        }
    }


    return {
        datos,
        secciones,
        datosCarousel,
        getPageData,
        getPageSections,
        getCarouselData
    }
}