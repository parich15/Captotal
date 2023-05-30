export const useCheckout = () => {
    const { getItems } = useDirectusItems();

    const stock = ref(null);
    //Para indicar tiempos de carga
    const carga = ref(false);
    const datos = reactive({
        Nombre: null,
        Apellidos: null,
        Email: null,
        Telefono: null,
        NieNif: null,
        Curso: null,
        NombreCurso: null,
        Order: {
            numOrder:null,
            precio:null,
        },
    });

    const getStock = async (ruta) => {
        carga.value = true;
        try {
            const res = await getItems({
                collection: 'Cursos',
                params:{
                    filter: {
                        Slug: ruta
                    },
                    fields: 'Aforo'
                }
            })
            stock.value = res[0].Aforo
            carga.value = false
            return stock
        } catch (e) {
            carga.value = false
            console.log(e);
        }
    }

    return {
        stock, 
        datos,
        carga,
        getStock
    }
}