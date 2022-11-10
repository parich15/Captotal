export const useCursoData = () => {
    const { getItems } = useDirectusItems();

    const curso     = ref(null);
    const cursos    = ref(null);

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
        getCursoData,
        getAllCursos
    }

}