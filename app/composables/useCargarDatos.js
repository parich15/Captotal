// Envuelve una petición en useAsyncData: lo que se pide en el servidor viaja en el payload
// y el cliente no lo vuelve a pedir al hidratar. Devuelve el valor (o null si falla).
// Llamar siempre desde setup (directamente o desde un composable), nunca desde un evento.
export const useCargarDatos = async (key, handler) => {
    const { data, error } = await useAsyncData(key, async () => (await handler()) ?? null);
    if (error.value) {
        console.log(error.value);
    }
    return data.value ?? null;
}
