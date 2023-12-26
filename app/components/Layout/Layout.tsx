import { Outlet, useLocation } from "@remix-run/react";

export function Layout() {
  const location = useLocation();
  const randomNumber = Math.floor(Math.random() * 899) + 101; // random number between 101 and 999
  const number = location.pathname === '/' ? 100 : randomNumber;

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
          <span>{number}</span>
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
