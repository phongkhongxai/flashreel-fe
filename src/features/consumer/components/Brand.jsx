import { Link } from "react-router-dom";
import { Play } from "lucide-react";
function Brand() {
  return (
    <Link className="fr-brand" to="/">
      <span className="fr-logo">
        <Play size={16} fill="currentColor" />
      </span>
      <span>
        Flash<span>Reel</span>
      </span>
    </Link>
  );
}
export default Brand;
