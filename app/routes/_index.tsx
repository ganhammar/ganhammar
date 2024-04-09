import { json, type LoaderFunction, type MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

const REPOSITORY = "ganhammar/ganhammar-posts";

type ContentsResponse = {
  path: string;
  type: string;
  name: string;
  download_url: string;
};

type Post = {
  id: string;
  title: string;
  date: string;
  status: string;
};

type LoaderResponse = {
  posts: Post[];
};

const metadataCache = new Map<string, Post>();

async function fetchAndExtractMetadata(
  file: ContentsResponse,
  token: string
): Promise<Post> {
  if (metadataCache.has(file.path)) {
    return metadataCache.get(file.path)!;
  }

  const response = await fetch(file.download_url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const content = await response.text();
  const metadataMatch = content.match(
    /---\ntitle: (?<title>.*)\nid: (?<id>.*)\ndate: (?<date>.*)\nstatus: (?<status>.*)\n---/
  );
  const metadata = {
    title: metadataMatch?.groups?.title.replace(/^"|"$/g, '') || "",
    id: metadataMatch?.groups?.id || "",
    date: metadataMatch?.groups?.date || "",
    status: metadataMatch?.groups?.status || "draft",
  };

  metadataCache.set(file.path, metadata);

  return metadata;
}

export const loader: LoaderFunction = async ({ params }) => {
  const token = process.env.API_TOKEN!;
  const response = await fetch(
    `https://api.github.com/repos/${REPOSITORY}/contents/posts`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    return json({ message: "Not found" }, { status: 404 });
  }

  const data = (await response.json()) as ContentsResponse[];
  const posts = await Promise.all(
    data
      .filter((file) => file.type === "file")
      .map((file) => fetchAndExtractMetadata(file, token))
  );

  const sortedPosts = posts
    .filter((post) => post.status === "published")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return json({ posts: sortedPosts });
};

export const meta: MetaFunction = () => {
  return [
    { title: "Ganhammar" },
    {
      name: "description",
      content:
        "Hey! I'm Anton Ganhammar. I do dev stuff, here is some random thoughts and experiments.",
    },
  ];
};

export default function Index() {
  const { posts } = useLoaderData() as LoaderResponse;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h2>Hey! I'm Anton Ganhammar.</h2>
      <p>I do dev stuff, here is some random thoughts and experiments:</p>
      <ul>
        {posts.map(({ id, date, title }) => (
          <li key={id}>
            <Link className="title" to={`/posts/${id}`}>{title}</Link>
            <span className="date">{date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
