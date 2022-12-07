export const useVentajas = () => {
    const { getItems } = useDirectusItems();
    const ventajas = ref(null);

    const getVentajas = async () =>{
        const res = await getItems({
            collection: "Ventajas"
        });
        ventajas.value = res;
        return ventajas; 
    }

    return {
        ventajas,
        getVentajas
    }
}