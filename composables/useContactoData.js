export const useContactoData = () => {
    const { getItems } = useDirectusItems();
    const data = ref(null);
    
    const getContactoData = async (id) =>{
        try {
            const res = await getItems({
                collection: 'Contacto/' + id,
            })
            data.value = res;
            return data;
        } catch (e) {
            console.log(e)
        }
    }

    const getContactoBasico = async (id) =>{
        try {
            const res = await getItems({
                collection: 'Contacto/'+id,
                params:{
                    fields: 'Telefono,Email'
                }
            });
            data.value = res;
            return data;
        } catch (e) {
            console.log(e);
        }
    }

    const getTopbarInfo = async (id) =>{
        try {
            const res = await getItems({
                collection: 'Topbar/'+id,
            })
            return res;
        } catch (e) {
            console.log(e);
        }
    }

    return {
        data,
        getContactoData,
        getContactoBasico,
        getTopbarInfo
    }
}