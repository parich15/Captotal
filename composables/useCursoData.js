export const useCursoData = () => {
    const { getItems } = useDirectusItems();

    const curso         = ref(null);
    const secciones     = ref(null);
    const cursos        = ref(null);

    const getCursoData = async (id, params) =>{
        try {
            const res = await getItems({
                collection: 'Cursos/' + id,
                params: params,
            });
            curso.value = res;
            return curso;
        } catch (e) {
            console.log(e);
        }
    }

    const getCursoContenido = async (id) =>{
        const res = await getItems({
            collection: 'Cursos/' + id,
            params:{
                fields: 'Secciones.Content.item.*'
            }
        });
        secciones.value = res.Secciones;
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