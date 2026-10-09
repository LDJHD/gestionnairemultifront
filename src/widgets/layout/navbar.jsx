import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Bars3Icon, BoltIcon, XMarkIcon } from "@heroicons/react/24/outline";

export function Navbar({ brandName, routes, action }) {
  const [openNav, setOpenNav] = React.useState(false);

  React.useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpenNav(false)
    );
  }, []);

  const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      {(routes || []).map(({ name, path, icon }) => (
        <li key={name}>
          <Link
            to={path}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold capitalize text-ink-600 transition-colors duration-200 hover:bg-ink-100 hover:text-ink-900"
          >
            {icon &&
              React.createElement(icon, {
                className: "h-[18px] w-[18px] opacity-60",
              })}
            {name}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <nav className="sticky top-0 z-40 border-b border-ink-200/70 bg-white/85 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-5 py-3.5">
        <Link to="/" className="lg-btn-ghost -ml-2 gap-2.5">
          <span className="lg-icon-chip h-9 w-9 bg-brand-gradient text-white shadow-glow">
            <BoltIcon className="h-[18px] w-[18px]" />
          </span>
          <span className="font-display text-base font-extrabold text-ink-900">
            {brandName}
          </span>
        </Link>

        <div className="hidden lg:block">{navList}</div>

        {React.cloneElement(action, {
          className: ["hidden lg:inline-flex", action.props.className]
            .filter(Boolean)
            .join(" "),
        })}

        <button
          type="button"
          aria-label={openNav ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={openNav}
          onClick={() => setOpenNav(!openNav)}
          className="ml-auto grid h-10 w-10 place-items-center rounded-xl text-ink-600 transition-colors duration-200 hover:bg-ink-100 hover:text-ink-900 lg:hidden"
        >
          {openNav ? (
            <XMarkIcon strokeWidth={2} className="h-6 w-6" />
          ) : (
            <Bars3Icon strokeWidth={2} className="h-6 w-6" />
          )}
        </button>
      </div>

      {openNav && (
        <div className="border-t border-ink-100 bg-white px-5 py-4 animate-slide-down lg:hidden">
          {navList}
          {React.cloneElement(action, {
            className: ["w-full", action.props.className].filter(Boolean).join(" "),
          })}
        </div>
      )}
    </nav>
  );
}

Navbar.defaultProps = {
  brandName: "",
  routes: [],
  action: (
    <a
      href="https://www.creative-tim.com/product/material-tailwind-dashboard-react"
      target="_blank"
      rel="noreferrer"
      className="lg-btn-primary lg-btn-sm"
    >
      Guide de démarrage
    </a>
  ),
};

Navbar.propTypes = {
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
  action: PropTypes.node,
};

Navbar.displayName = "/src/widgets/layout/navbar.jsx";

export default Navbar;
