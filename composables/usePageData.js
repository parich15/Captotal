export const usePageData = () =>{
    const { getItems } = useDirectusItems();
    const datos = ref(null);
    const secciones = ref(null);

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

    return {
        datos,
        secciones,
        getPageData,
        getPageSections
    }
}