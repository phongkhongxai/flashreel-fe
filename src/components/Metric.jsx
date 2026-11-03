import PropTypes from "prop-types";
export default function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

Metric.propTypes = { label: PropTypes.node, value: PropTypes.node };
