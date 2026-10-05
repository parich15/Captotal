import { defineSitemapEventHandler } from '#imports'

// Cursos y posts del blog desde Directus. Se ignoran los registros sin Slug (p.ej. el curso Online).
export default defineSitemapEventHandler(async () => {
    const directus = 'https://admin.captotal.com/items'
    const [cursos, posts] = await Promise.all([
        $fetch<{ data: { Slug: string | null }[] }>(`${directus}/Cursos`, { query: { fields: 'Slug', limit: -1 } }),
        $fetch<{ data: { Slug: string | null, date_updated?: string | null, date_created?: string | null }[] }>(`${directus}/Posts`, { query: { fields: 'Slug,date_created,date_updated', limit: -1 } }),
    ])

    return [
        ...cursos.data.filter(c => c.Slug).map(c => ({ loc: `/Curso/${c.Slug}` })),
        ...posts.data.filter(p => p.Slug).map(p => ({ loc: `/Blog/${p.Slug}`, lastmod: p.date_updated || p.date_created || undefined })),
    ]
})
