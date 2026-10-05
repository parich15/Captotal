export const useCursoData = () => {
    const { getItems } = useDirectusItems();

    const curso         = ref(null);
    const secciones     = ref(null);
    const cursos        = ref(null);

    const getCursoData = async (slug) =>{
        curso.value = await useCargarDatos(`curso-${slug}`, async () => {
            const res = await getItems({
                collection: 'Cursos',
                params: {
                    filter:{
                        Slug: slug
                    }
                },
            });
            return res[0];
        });
        return curso;
    }

    const getCursoContenido = async (slug) =>{
        secciones.value = await useCargarDatos(`curso-contenido-${slug}`, async () => {
            const res = await getItems({
                collection: 'Cursos',
                params:{
                    filter: {
                        Slug: slug
                     },
                    fields: 'Secciones.Content.item.*'
                }
            });
            return res[0].Secciones;
        });
        return secciones;
    }

    const getAllCursos = async (params = {}) =>{
        cursos.value = await useCargarDatos(`cursos-${JSON.stringify(params)}`, () => getItems({
            collection: 'Cursos',
            params: params,
        }));
        return cursos;
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
