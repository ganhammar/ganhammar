import { json, type LoaderFunction, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

type Post = {
  slug: string;
  title: string;
  content: string;
};

export const loader: LoaderFunction = async ({ params }) => {
  return json({ name: params.slug, content: "Hello there!" });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{
    title: `Post ${data.name}`,
  }];
};

export default function Post() {
  let post = useLoaderData() as Post;

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </div>
  );
}