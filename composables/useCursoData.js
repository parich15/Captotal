export const useCursoData = () => {
    const { getItems } = useDirectusItems();

    const curso         = ref(null);
    const secciones     = ref(null);
    const cursos        = ref(null);

    const getCursoData = async (slug) =>{
        try {
            const res = await getItems({
                collection: 'Cursos',
                params: {
                    filter:{
                        Slug: slug
                    }
                },
            });
            curso.value = res[0];
            return curso;
        } catch (e) {
            console.log(e);
        }
    }

    const getCursoContenido = async (slug) =>{
        const res = await getItems({
            collection: 'Cursos',
            params:{
                filter: {
                    Slug: slug
                 },
                fields: 'Secciones.Content.item.*'
            }
        });
        secciones.value = res[0].Secciones;
        return secciones;
    }

    const getAllCursos = async (params = {}) =>{
        try {
            const res = await getItems({
                collection: 'Cursos',
                params: params,
            })
            cursos.value = res;
            return cursos;
        } catch (e) {
            console.log(e);
        }
    }

    return {
        curso,
        cursos,
        secciones,
        getCursoData,
        getCursoContenido,
        getAllCursos
    }

}