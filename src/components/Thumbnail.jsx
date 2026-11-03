import PropTypes from "prop-types";
import { Play } from "lucide-react";
export default function Thumbnail({ palette, coverUrl }) {
  return (
    <div className={`thumb ${palette}`}>
      {coverUrl && <img src={coverUrl} alt="" loading="lazy" />}
      <Play size={12} fill="currentColor" />
    </div>
  );
}

Thumbnail.propTypes = { palette: PropTypes.string, coverUrl: PropTypes.string };
