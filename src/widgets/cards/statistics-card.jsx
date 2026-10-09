import PropTypes from "prop-types";

/* ===========================================================================
   « LE GESTIONNAIRE » — CARTE KPI (Statistical tile)
   Remplace l'ancienne carte du template (icône flottante + fond « gray »)
   par une tuile moderne : pastille colorée, valeur tabulaire, delta optionnel.
   =========================================================================== */

// Dégradés de pastilles : chaque ton a son halo assorti.
const TONS = {
  brand: "bg-brand-50 text-brand-600 ring-brand-100",
  accent: "bg-accent-50 text-accent-600 ring-accent-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
  rose: "bg-rose-50 text-rose-600 ring-rose-100",
  sky: "bg-sky-50 text-sky-600 ring-sky-100",
  violet: "bg-violet-50 text-violet-600 ring-violet-100",
  slate: "bg-ink-100 text-ink-600 ring-ink-200",
};

const TONES_DELTA = {
  up: "bg-accent-50 text-accent-700",
  down: "bg-red-50 text-red-700",
  neutral: "bg-ink-100 text-ink-600",
};

export function StatisticsCard({
  ton = "brand",
  icon,
  title,
  value,
  suffixe,
  delta,
  deltaTon = "up",
  footer,
  onClick,
}) {
  const Balise = onClick ? "button" : "div";

  return (
    <Balise
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={[
        "group relative w-full overflow-hidden rounded-2xl border border-ink-200/80 bg-white p-5",
        "text-left shadow-card transition-all duration-300",
        onClick
          ? "cursor-pointer hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
          : "",
      ].join(" ")}
    >
      {/* Halo décoratif qui s'éveille au survol */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full bg-brand-100/50 blur-2xl transition-opacity duration-500 group-hover:opacity-100 sm:opacity-0"
      />

      <div className="relative flex items-start justify-between gap-4">
        <p className="text-[13px] leading-snug font-semibold text-ink-500">{title}</p>
        {icon ? (
          <span
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 ring-inset transition-transform duration-300 group-hover:scale-105 ${TONS[ton] || TONS.brand}`}
          >
            {icon}
          </span>
        ) : null}
      </div>

      <div className="relative mt-3 flex items-end gap-2">
        <span className="font-display text-[30px] leading-none font-extrabold tracking-tight text-ink-900 tabular">
          {value ?? "—"}
        </span>
        {suffixe ? (
          <span className="pb-0.5 text-sm font-semibold text-ink-400">{suffixe}</span>
        ) : null}
        {delta ? (
          <span
            className={`mb-0.5 ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold tabular ${TONES_DELTA[deltaTon] || TONES_DELTA.neutral}`}
          >
            {delta}
          </span>
        ) : null}
      </div>

      {footer ? <div className="relative mt-3 text-[13px] text-ink-500">{footer}</div> : null}
    </Balise>
  );
}

StatisticsCard.defaultProps = {
  ton: "brand",
  suffixe: null,
  delta: null,
  deltaTon: "up",
  footer: null,
  onClick: null,
};

StatisticsCard.propTypes = {
  ton: PropTypes.oneOf([
    "brand",
    "accent",
    "amber",
    "rose",
    "sky",
    "violet",
    "slate",
  ]),
  icon: PropTypes.node,
  title: PropTypes.node.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.node]),
  suffixe: PropTypes.string,
  delta: PropTypes.string,
  deltaTon: PropTypes.oneOf(["up", "down", "neutral"]),
  footer: PropTypes.node,
  onClick: PropTypes.func,
};

StatisticsCard.displayName = "StatisticsCard";

export default StatisticsCard;