import { Outlet } from "@remix-run/react";

export function Layout() {
  const formattedDate = new Date().toLocaleDateString("sv-SE", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <header>
        <div className="info">
          <span>100</span>
          <span className="yellow">Ganhammar</span>
          <span>{formattedDate}</span>
        </div>
        <div className="banner">
          <h1><a href="/">Ganhammar</a></h1>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <div className="content">
          Copyright © 2023. All rights reserved.
        </div>
      </footer>
    </>
  );
}
