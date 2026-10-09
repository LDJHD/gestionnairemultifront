import {
  Card,
  Typography,
} from "@material-tailwind/react";
import PropTypes from "prop-types";
import Chart from "react-apexcharts";
import { ChartBarIcon } from "@heroicons/react/24/outline";

/** Correspondance entre les couleurs Material (prop `color`) et le design system */
const ACCENTS = {
  white: "bg-ink-100 text-ink-600 ring-ink-200",
  blue: "bg-brand-50 text-brand-700 ring-brand-100",
  indigo: "bg-brand-50 text-brand-700 ring-brand-100",
  "light-blue": "bg-sky-50 text-sky-700 ring-sky-100",
  cyan: "bg-sky-50 text-sky-700 ring-sky-100",
  teal: "bg-accent-50 text-accent-700 ring-accent-100",
  green: "bg-accent-50 text-accent-700 ring-accent-100",
  "light-green": "bg-accent-50 text-accent-700 ring-accent-100",
  lime: "bg-accent-50 text-accent-700 ring-accent-100",
  yellow: "bg-amber-50 text-amber-700 ring-amber-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  orange: "bg-amber-50 text-amber-700 ring-amber-100",
  "deep-orange": "bg-red-50 text-red-700 ring-red-100",
  red: "bg-red-50 text-red-700 ring-red-100",
  pink: "bg-rose-50 text-rose-700 ring-rose-100",
  purple: "bg-violet-50 text-violet-700 ring-violet-100",
  "deep-purple": "bg-violet-50 text-violet-700 ring-violet-100",
  brown: "bg-amber-50 text-amber-700 ring-amber-100",
};

export function StatisticsChart({ color, chart, title, description, footer }) {
  const ton = ACCENTS[color] || ACCENTS.blue;

  return (
    <Card className="lg-card overflow-hidden p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Typography
            variant="h6"
            className="font-display text-base font-extrabold text-ink-900"
          >
            {title}
          </Typography>
          <Typography variant="small" className="text-[13px] text-ink-500">
            {description}
          </Typography>
        </div>
        <span className={`lg-badge ring-1 ring-inset ${ton}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          Tendance
        </span>
      </div>

      <div className="mt-4">
        {chart ? (
          <Chart {...chart} />
        ) : (
          <div className="py-10 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-ink-100 text-ink-400">
              <ChartBarIcon className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-semibold text-ink-700">
              Aucune donnée à afficher
            </p>
            <p className="mt-1 text-[13px] text-ink-500">
              Le graphique sera disponible dès que les statistiques seront
              chargées.
            </p>
          </div>
        )}
      </div>

      {footer && (
        <div className="mt-5 border-t border-ink-100 pt-4 text-[13px] text-ink-500">
          {footer}
        </div>
      )}
    </Card>
  );
}

StatisticsChart.defaultProps = {
  color: "blue",
  footer: null,
};

StatisticsChart.propTypes = {
  color: PropTypes.oneOf([
    "white",
    "blue-gray",
    "gray",
    "brown",
    "deep-orange",
    "orange",
    "amber",
    "yellow",
    "lime",
    "light-green",
    "green",
    "teal",
    "cyan",
    "light-blue",
    "blue",
    "indigo",
    "deep-purple",
    "purple",
    "pink",
    "red",
  ]),
  chart: PropTypes.object,
  title: PropTypes.node.isRequired,
  description: PropTypes.node.isRequired,
  footer: PropTypes.node,
};

StatisticsChart.displayName = "/src/widgets/charts/statistics-chart.jsx";

export default StatisticsChart;
