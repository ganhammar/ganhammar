import { json, type LoaderFunction, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import parseFrontMatter from "front-matter";
import ReactMarkdown from "react-markdown";

type Post = {
  title: string;
  content: string;
  date: string;
};

type Attributes = {
  title: string;
  id: string;
  date: string;
};

const REPOSITORY = "ganhammar/ganhammar-posts";

export const loader: LoaderFunction = async ({ params }) => {
  const token = process.env.API_TOKEN;
  const response = await fetch(`https://api.github.com/repos/${REPOSITORY}/contents/posts/${params.slug}.mdx`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return json({ message: "Not found" }, { status: 404 });
  }

  const data = await response.json();
  const content = Buffer.from(data.content, "base64").toString();

  const { attributes, body } = parseFrontMatter<Attributes>(content, { allowUnsafe: true });

  return json({ title: attributes.title, content: body });
};

export const meta: MetaFunction<typeof loader> = ({ data: { title } }) => {
  return [{
    title,
  }];
};

export default function Post() {
  let post = useLoaderData() as Post;

  return <ReactMarkdown>{post.content}</ReactMarkdown>;
}