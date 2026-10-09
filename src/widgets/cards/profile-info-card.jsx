import PropTypes from "prop-types";

export function ProfileInfoCard({ title, description, details, action }) {
  const keys = Object.keys(details || {});
  const roleKey = keys.find((k) =>
    ["role", "rôle", "fonction", "poste"].includes(String(k).toLowerCase())
  );
  const role = roleKey ? details[roleKey] : null;
  const initiales = String(title || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="lg-card p-6">
      {/* ── Identité ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-brand-gradient font-display text-2xl font-extrabold text-white shadow-glow ring-4 ring-brand-50">
            {initiales}
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-extrabold text-ink-900 lg-clamp-1">
              {title}
            </h3>
            {role ? (
              <span className="lg-badge-brand mt-2">
                {typeof role === "string" ? role : ""}
              </span>
            ) : null}
          </div>
        </div>
        {action}
      </div>

      {/* ── Description ── */}
      {description ? (
        <p className="mt-5 text-[13px] leading-relaxed text-ink-600">{description}</p>
      ) : null}

      {/* ── Paires label / valeur ── */}
      {keys.length ? (
        <>
          <hr className="my-6 border-ink-100" />
          <ul className="flex flex-col gap-3.5 p-0">
            {keys.map((el) => (
              <li
                key={el}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-ink-50/70 px-3.5 py-2.5"
              >
                <span className="min-w-[140px] text-[13px] font-semibold capitalize text-ink-700">
                  {el} :
                </span>
                {typeof details[el] === "string" ? (
                  <span className="text-[13px] font-normal text-ink-600">
                    {details[el]}
                  </span>
                ) : (
                  details[el]
                )}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

ProfileInfoCard.defaultProps = {
  action: null,
  description: null,
  details: {},
};

ProfileInfoCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
  details: PropTypes.object,
};

ProfileInfoCard.displayName = "/src/widgets/cards/profile-info-card.jsx";

export default ProfileInfoCard;
