export const useMenu = () => {
    const { getItems } = useDirectusItems();
    const data = ref(null);

    const getMenu = async (id) => {
        data.value = await useCargarDatos(`menu-${id}`, async () => {
            const res = await getItems({
                collection: 'Menus/' + id,
                params:{
                    fields: 'Menu'
                }
            });
            return res.Menu;
        });
        return data;
    }

    return {
        data,
        getMenu
    }
}
