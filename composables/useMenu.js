export const useMenu = () => {
    const { getItems } = useDirectusItems();
    const data = ref(null);

    const getMenu = async (id) => {
        try {
            const res = await getItems({
                collection: 'Menus/' + id,
                params:{
                    fields: 'Menu'
                }
            })
            data.value = res.Menu;
            return data;
        } catch (e) {
            console.log(e)
        }
    }

    return {
        data,
        getMenu
    }
}