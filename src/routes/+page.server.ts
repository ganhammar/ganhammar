import { getPosts } from '$lib/github';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { posts: await getPosts() };
};
