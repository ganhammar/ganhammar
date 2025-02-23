import { type LoaderFunction } from "@remix-run/node";

const REPOSITORY = "ganhammar/ganhammar-posts";

export const loader: LoaderFunction = async ({ params }) => {
  const token = process.env.API_TOKEN;
  const response = await fetch(
    `https://api.github.com/repos/${REPOSITORY}/contents/posts/assets/${params.slug}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    return Response.json({ message: "Not found" }, { status: 404 });
  }

  const data = await response.json();
  const content = Buffer.from(data.content, "base64");

  let contentType = "text/plain";
  if (data.name.endsWith(".png")) {
    contentType = "image/png";
  } else if (data.name.endsWith(".jpg") || data.name.endsWith(".jpeg")) {
    contentType = "image/jpeg";
  } else if (data.name.endsWith(".gif")) {
    contentType = "image/gif";
  }

  return new Response(content, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": content.length.toString(),
    },
  });
};
