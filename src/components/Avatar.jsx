import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

export default function Avatar({
  name,
  src,
  className = "fr-avatar",
  onRefresh,
}) {
  const [imageSrc, setImageSrc] = useState(src || "");
  const [failed, setFailed] = useState(false);
  const attemptedRefresh = useRef(false);
  const generation = useRef(0);

  useEffect(() => {
    generation.current++;
    attemptedRefresh.current = false;
    setImageSrc(src || "");
    setFailed(false);
    return () => {
      generation.current++;
    };
  }, [src]);

  async function handleError() {
    setFailed(true);
    if (!onRefresh || attemptedRefresh.current) return;
    attemptedRefresh.current = true;
    const requestGeneration = generation.current;
    try {
      const freshUrl = await onRefresh();
      if (
        generation.current === requestGeneration &&
        freshUrl &&
        freshUrl !== imageSrc
      ) {
        setImageSrc(freshUrl);
        setFailed(false);
      }
    } catch {
      // Keep the initials if the source API cannot provide a fresh URL.
    }
  }

  return (
    <span className={className}>
      {imageSrc && !failed ? (
        <img src={imageSrc} alt="" onError={handleError} />
      ) : (
        String(name || "?").charAt(0)
      )}
    </span>
  );
}
Avatar.propTypes = {
  name: PropTypes.string,
  src: PropTypes.string,
  className: PropTypes.string,
  onRefresh: PropTypes.func,
};
