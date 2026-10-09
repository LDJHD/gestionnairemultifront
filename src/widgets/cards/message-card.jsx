import PropTypes from "prop-types";

export function MessageCard({ img, name, message, action }) {
  return (
    <div className="lg-card flex items-center justify-between gap-4 p-5">
      <div className="flex min-w-0 items-center gap-3.5">
        <span className="lg-icon-chip h-10 w-10 overflow-hidden bg-ink-100 text-ink-500 ring-1 ring-inset ring-ink-200">
          <img src={img} alt={name} loading="lazy" className="h-full w-full object-cover" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-sm font-extrabold text-ink-900 lg-clamp-1">
            {name}
          </p>
          <p className="text-[13px] leading-relaxed text-ink-600">{message}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

MessageCard.defaultProps = {
  action: null,
};

MessageCard.propTypes = {
  img: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  message: PropTypes.node.isRequired,
  action: PropTypes.node,
};

MessageCard.displayName = "/src/widgets/cards/message-card.jsx";

export default MessageCard;
