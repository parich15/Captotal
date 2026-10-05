export const useContactoData = () => {
    const { getItems } = useDirectusItems();
    const data = ref(null);
    
    const getContactoData = async (id) =>{
        data.value = await useCargarDatos(`contacto-${id}`, () => getItems({
            collection: 'Contacto/' + id,
        }));
        return data;
    }

    const getContactoBasico = async (id) =>{
        data.value = await useCargarDatos(`contacto-basico-${id}`, () => getItems({
            collection: 'Contacto/'+id,
            params:{
                fields: 'Telefono,Email'
            }
        }));
        return data;
    }

    const getTopbarInfo = async (id) =>{
        return await useCargarDatos(`topbar-${id}`, () => getItems({
            collection: 'Topbar/'+id,
        }));
    }

    return {
        data,
        getContactoData,
        getContactoBasico,
        getTopbarInfo
    }
}
