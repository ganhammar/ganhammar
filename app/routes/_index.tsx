import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Ganhammar" },
    { name: "description", content: "Hey! I'm Anton Ganhammar. I do dev stuff, here is some random thoughts and experiments." },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h2>Hey! I'm Anton Ganhammar.</h2>
      <p>I do dev stuff, here is some random thoughts and experiments:</p>
      <ul>
        <li>
          <Link to="/posts/dotnet-8-aot-aws-lambda">
            Dotnet 8 AOT (ahead-of-time) compilation hosted on AWS Lambda
          </Link>
        </li>
      </ul>
    </div>
  );
}
