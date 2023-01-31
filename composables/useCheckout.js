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
        pago: {
            NumTjt: null,
            FechaTjt: null,
            Cvc: null
        }
    })

    const getStock = async (id) => {
        carga.value = true;
        try {
            const res = await getItems({
                collection: 'Cursos/' + id,
                params:{
                    fields: 'Aforo'
                }
            })
            stock.value = res.Aforo
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