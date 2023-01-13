export const useContactoData = () => {
    const { getItems } = useDirectusItems();
    
    const getContactoData = async (id) =>{
        try {
            const res = await getItems({
                collection: 'Contacto/' + id,
            })
            return res;
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
            return res;
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
        getContactoData,
        getContactoBasico,
        getTopbarInfo
    }
}