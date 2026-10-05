export const useVentajas = () => {
    const { getItems } = useDirectusItems();
    const ventajas = ref(null);

    const getVentajas = async () =>{
        ventajas.value = await useCargarDatos('ventajas', () => getItems({
            collection: "Ventajas"
        }));
        return ventajas; 
    }

    return {
        ventajas,
        getVentajas
    }
}
