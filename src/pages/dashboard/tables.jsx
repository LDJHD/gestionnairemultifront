import { Tooltip } from "@material-tailwind/react";
import {
  BriefcaseIcon,
  EllipsisVerticalIcon,
  PencilSquareIcon,
  Squares2X2Icon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { authorsTableData, projectsTableData } from "@/data";

export function Tables() {
  return (
    <div className="mt-6 mb-10 flex flex-col gap-6 animate-fade-in">
      {/* ══════════════════ EN-TÊTE DE PAGE ══════════════════ */}
      <header>
        <p className="text-[13px] font-semibold text-brand-600">Jeu de démonstration</p>
        <h1 className="lg-page-title">Tableaux de bord</h1>
        <p className="lg-page-sub">
          Exemples de tableaux de données servis par le design system.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        {/* ══════════════════ COLLABORATEURS ══════════════════ */}
        <section className="lg-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="lg-icon-chip h-9 w-9 bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
                <UserGroupIcon className="h-[18px] w-[18px]" />
              </span>
              <div>
                <p className="font-display text-base font-extrabold text-ink-900">
                  Collaborateurs
                </p>
                <p className="text-[13px] text-ink-500">
                  {authorsTableData.length} personnes enregistrées
                </p>
              </div>
            </div>
          </div>

          <div className="lg-table-wrap">
            <table className="lg-table w-full min-w-[720px]">
              <thead>
                <tr>
                  {["Collaborateur", "Fonction", "Statut", "Embauché le", ""].map((el) => (
                    <th key={el}>{el}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {authorsTableData.map(({ img, name, email, job, online, date }) => (
                  <tr key={name}>
                    <td className="lg-td">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={img}
                          alt={name}
                          loading="lazy"
                          className="h-9 w-9 shrink-0 rounded-xl object-cover ring-1 ring-inset ring-ink-200"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-ink-800">{name}</p>
                          <p className="text-[13px] text-ink-500">{email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="lg-td">
                      <p className="text-[13px] font-semibold text-ink-700">{job[0]}</p>
                      <p className="text-[13px] text-ink-500">{job[1]}</p>
                    </td>
                    <td className="lg-td">
                      {online ? (
                        <span className="lg-badge-accent">En ligne</span>
                      ) : (
                        <span className="lg-badge-neutral">Hors ligne</span>
                      )}
                    </td>
                    <td className="lg-td text-[13px] font-medium text-ink-600 tabular">
                      {date}
                    </td>
                    <td className="lg-td text-right">
                      <a
                        href="#"
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-brand-600 transition-colors hover:bg-brand-50 hover:text-brand-800"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        Modifier
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ══════════════════ PROJETS ══════════════════ */}
        <section className="lg-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="lg-icon-chip h-9 w-9 bg-accent-50 text-accent-600 ring-1 ring-inset ring-accent-100">
                <Squares2X2Icon className="h-[18px] w-[18px]" />
              </span>
              <div>
                <p className="font-display text-base font-extrabold text-ink-900">Projets</p>
                <p className="text-[13px] text-ink-500">
                  {projectsTableData.length} projets et leur avancement
                </p>
              </div>
            </div>
            <span className="lg-badge-brand">
              <BriefcaseIcon className="h-3.5 w-3.5" />
              Portfolio
            </span>
          </div>

          <div className="lg-table-wrap">
            <table className="lg-table w-full min-w-[720px]">
              <thead>
                <tr>
                  {["Projet", "Membres", "Budget", "Avancement", ""].map((el) => (
                    <th key={el} className={el === "Budget" ? "text-right" : ""}>
                      {el}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projectsTableData.map(({ img, name, members, budget, completion }) => (
                  <tr key={name}>
                    <td className="lg-td">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={img}
                          alt={name}
                          loading="lazy"
                          className="h-9 w-9 shrink-0 rounded-xl bg-ink-50 object-contain p-1 ring-1 ring-inset ring-ink-200"
                        />
                        <p className="font-semibold text-ink-800">{name}</p>
                      </div>
                    </td>
                    <td className="lg-td">
                      <div className="flex items-center">
                        {members.map((membre, index) => (
                          <Tooltip key={membre.name} content={membre.name}>
                            <img
                              src={membre.img}
                              alt={membre.name}
                              loading="lazy"
                              className={`h-8 w-8 cursor-pointer rounded-full object-cover ring-2 ring-white ${
                                index === 0 ? "" : "-ml-2.5"
                              }`}
                            />
                          </Tooltip>
                        ))}
                      </div>
                    </td>
                    <td className="lg-td text-right text-[13px] font-semibold text-ink-800 tabular">
                      {budget}
                    </td>
                    <td className="lg-td">
                      <div className="w-40">
                        <p className="mb-1.5 text-[13px] font-semibold text-ink-700 tabular">
                          {completion}%
                        </p>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                          <div
                            className={`h-full rounded-full ${
                              completion === 100 ? "bg-accent-500" : "bg-brand-gradient"
                            }`}
                            style={{ width: `${completion}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="lg-td text-right">
                      <a
                        href="#"
                        aria-label={`Actions pour ${name}`}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
                      >
                        <EllipsisVerticalIcon strokeWidth={2} className="h-5 w-5" />
                        Actions
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Tables;
