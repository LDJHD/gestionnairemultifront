import PropTypes from "prop-types";
import { HeartIcon } from "@heroicons/react/24/solid";

/* ===========================================================================
   « LE GESTIONNAIRE » — PIED DE PAGE
   =========================================================================== */

export function Footer({ brandName, brandLink }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink-200/70 py-6">
      <div className="flex w-full flex-col items-center gap-2 px-2 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-[13px] text-ink-500">
          © {year} — <strong className="font-semibold text-ink-700">Le Gestionnaire</strong>
          <span className="hidden sm:inline"> · Gestion &amp; boutique en ligne</span>
        </p>
        <p className="flex items-center gap-1.5 text-[13px] text-ink-400">
          Conçu avec
          <HeartIcon className="h-3.5 w-3.5 text-red-500" />
          par
          <a
            href={brandLink}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-brand-600 transition-colors hover:text-brand-800"
          >
            {brandName}
          </a>
        </p>
      </div>
    </footer>
  );
}

Footer.defaultProps = {
  brandName: "TO CONNECT",
  brandLink: "https://www.to-connect.com",
};
Footer.propTypes = {
  brandName: PropTypes.string,
  brandLink: PropTypes.string,
};
Footer.displayName = "Footer";

export default Footer;
