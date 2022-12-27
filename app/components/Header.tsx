import { NavLink } from "@remix-run/react";
import { cx } from "~/utils";

function HeaderLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  // whether the current page is the link's destination
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cx(
          "px-6 py-2 rounded-md",
          isActive
            ? "bg-stone-900 text-stone-50"
            : "text-stone-300 hover:bg-stone-700 hover:text-stone-50"
        )
      }
    >
      {children}
    </NavLink>
  );
}

export function Header() {
  return (
    <header className="flex flex-row max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 items-center">
      <div className="flex flex-row justify-center items-center relative select-none py-2">
        <img
          className="h-48 w-48 drop-shadow-lg"
          src="/assets/logo.png"
          alt="Luanbia Home"
        />
        <span className="absolute left-24 top-17 text-4xl font-medieval text-orange-50 drop-shadow-lg">
          uanbia
        </span>
      </div>
      <nav className="flex items-center justify-between h-16">
        <div className="flex items-center">
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4 text-lg font-bold">
              <HeaderLink to="/">Home</HeaderLink>
              <HeaderLink to="/players">Players</HeaderLink>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
