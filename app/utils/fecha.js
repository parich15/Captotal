const formatoFecha = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Europe/Madrid',
});

// Directus también devuelve fechas sin zona: se interpretan como UTC en ambos renders.
export const fechaISO = (valor) => {
    if (typeof valor !== 'string' || !valor.trim()) return '';
    const texto = valor.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
        const fecha = new Date(`${texto}T00:00:00Z`);
        return Number.isFinite(fecha.getTime()) && fecha.toISOString().startsWith(texto) ? texto : '';
    }
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(texto)) return '';
    const conZona = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(texto) ? texto : `${texto}Z`;
    const fecha = new Date(conZona);
    return Number.isFinite(fecha.getTime()) ? fecha.toISOString() : '';
};

export const mostrarFecha = (valor) => {
    const iso = fechaISO(valor);
    if (!iso) return '';
    // Una fecha de calendario no se desplaza según la zona horaria del navegador.
    if (iso.length === 10) return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
    return formatoFecha.format(new Date(iso));
};
