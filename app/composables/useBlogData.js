export const useBlogData = () => {
    const { getItems } = useDirectusItems();

    const post = ref(null);
    const posts = ref(null);

    const getPostData = async (slug) => {
        post.value = await useCargarDatos(`post-${slug}`, async () => {
            const res = await getItems({
                collection: 'Posts',
                params: {
                    filter: {
                        Slug: slug
                    }
                },
            });
            return res[0];
        });
        return post;
    }

    const getAllPosts = async (params = {}) => {
        const defaultParams = {
            sort: ['-date_created']
        };

        const mergedParams = { ...defaultParams, ...params };

        posts.value = await useCargarDatos(`posts-${JSON.stringify(mergedParams)}`, () => getItems({
            collection: 'Posts',
            params: mergedParams
        }));
        return posts;
    }

    return {
        post,
        posts,
        getPostData,
        getAllPosts
    }
}
