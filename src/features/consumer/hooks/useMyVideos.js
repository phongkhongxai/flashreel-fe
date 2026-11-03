import { useEffect, useState, useRef } from "react";
import { consumerApi } from "../services/consumerApi";
function useMyVideos({ version }) {
  const [items, setItems] = useState([]),
    [filter, setFilter] = useState("ALL"),
    [page, setPage] = useState({ hasNext: false, nextCursor: null }),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const generation = useRef(0);
  useEffect(() => {
    let active = true;
    ++generation.current;
    setItems([]);
    setLoading(true);
    setError("");
    consumerApi
      .myVideos(filter)
      .then((p) => {
        if (active) {
          setItems(p.data);
          setPage(p);
        }
      })
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [version, filter]);
  async function loadMore() {
    if (!page.hasNext || loading) return;
    const id = generation.current;
    setLoading(true);
    try {
      const p = await consumerApi.myVideos(filter, page.nextCursor);
      if (id === generation.current) {
        setItems((old) => [...old, ...p.data]);
        setPage(p);
      }
    } catch (e) {
      if (id === generation.current) setError(e.message);
    } finally {
      if (id === generation.current) setLoading(false);
    }
  }
  return { items, filter, setFilter, page, loading, error, loadMore };
}
export default useMyVideos;
