export const useBlogData = () => {
    const { getItems } = useDirectusItems();

    const post = ref(null);
    const posts = ref(null);

    const getPostData = async (slug) => {
        try {
            const res = await getItems({
                collection: 'Posts',
                params: {
                    filter: {
                        Slug: slug
                    }
                },
            });
            post.value = res[0];
            return post;
        } catch (e) {
            console.log(e);
        }
    }

    const getAllPosts = async (params = {}) => {
        try {
            const defaultParams = {
                sort: ['-date_created']
            };
            
            const mergedParams = { ...defaultParams, ...params };
            
            const res = await getItems({
                collection: 'Posts',
                params: mergedParams
            });
            posts.value = res;
            return posts;
        } catch (e) {
            console.log(e);
        }
    }

    return {
        post,
        posts,
        getPostData,
        getAllPosts
    }
}
