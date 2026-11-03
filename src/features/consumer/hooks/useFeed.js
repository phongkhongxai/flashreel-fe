import { useEffect, useRef, useState } from "react";
import { consumerApi } from "../services/consumerApi";
import { trackViewOnce } from "../utils/trackViewOnce";

function mergePlayback(video, playback) {
  const views = Math.max(video.views ?? 0, playback.views ?? 0);
  return {
    ...video,
    ...playback,
    views,
    viewCount: views,
    comments: video.comments,
  };
}
function useFeed({ user, version, requireUser }) {
  const [items, setItems] = useState([]),
    [order, setOrder] = useState("hot"),
    [index, setIndex] = useState(0),
    [comments, setComments] = useState(false),
    [text, setText] = useState(""),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [muted, setMuted] = useState(true),
    [playing, setPlaying] = useState(true),
    [page, setPage] = useState({ nextCursor: null, hasNext: false }),
    [commentPage, setCommentPage] = useState({
      nextCursor: null,
      hasNext: false,
    }),
    [commentError, setCommentError] = useState("");
  const [actionError, setActionError] = useState("");
  const video = useRef(null),
    startY = useRef(0),
    loadingMore = useRef(null),
    generation = useRef(0),
    viewed = useRef(new Set()),
    mediaRetries = useRef(new Set());
  const current = items[index];
  useEffect(() => {
    let alive = true;
    const id = ++generation.current;
    loadingMore.current = null;
    setLoading(true);
    setError("");
    setIndex(0);
    setItems([]);
    setPage({ nextCursor: null, hasNext: false });
    consumerApi
      .feed(order)
      .then((p) => {
        if (alive && id === generation.current) {
          setItems(p.data);
          setPage(p);
        }
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [order, version]);
  useEffect(() => {
    if (
      !current ||
      !page.hasNext ||
      index < items.length - 2 ||
      loadingMore.current === generation.current
    )
      return;
    const id = generation.current;
    loadingMore.current = id;
    consumerApi
      .feed(order, page.nextCursor)
      .then((p) => {
        if (id === generation.current) {
          setItems((old) => [
            ...old,
            ...p.data.filter((v) => !old.some((x) => x.id === v.id)),
          ]);
          setPage(p);
        }
      })
      .catch((e) => {
        if (id === generation.current) setError(e.message);
      })
      .finally(() => {
        if (loadingMore.current === id) loadingMore.current = null;
      });
  }, [index, items.length, order, page]);
  useEffect(() => {
    if (!current) return;
    let active = true;
    setPlaying(true);
    consumerApi
      .playback(current.id)
      .then((p) => {
        if (active)
          setItems((old) =>
            old.map((x) => (x.id === p.id ? mergePlayback(x, p) : x)),
          );
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [current?.id, user?.id]);
  useEffect(() => {
    if (!current || !comments) return;
    if (!user) {
      setCommentError("Đăng nhập để xem bình luận.");
      return;
    }
    let active = true;
    setCommentError("");
    consumerApi
      .comments(current.id, user.id)
      .then((p) => {
        if (active) {
          setCommentPage(p);
          setItems((old) =>
            old.map((x) =>
              x.id === current.id ? { ...x, comments: p.data } : x,
            ),
          );
        }
      })
      .catch((e) => active && setCommentError(e.message));
    return () => {
      active = false;
    };
  }, [comments, current?.id, user?.id]);
  useEffect(() => {
    const el = video.current;
    if (el) {
      el.currentTime = 0;
      el.play().catch(() => setPlaying(false));
    }
  }, [current?.id, current?.videoUrl]);
  useEffect(() => {
    const key = (e) => {
      if (e.key === "Escape") setComments(false);
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName))
        return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIndex((i) => Math.min(i + 1, items.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setIndex((i) => Math.max(i - 1, 0));
      }
    };
    const vis = () => {
      if (document.hidden) {
        video.current?.pause();
        setPlaying(false);
      }
    };
    window.addEventListener("keydown", key);
    document.addEventListener("visibilitychange", vis);
    return () => {
      window.removeEventListener("keydown", key);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [items.length]);
  const act = async (fn) => {
    if (!user) {
      requireUser("/");
      return false;
    }
    try {
      setActionError("");
      await fn();
      if (current) {
        const p = await consumerApi.playback(current.id);
        let result;
        if (comments) result = await consumerApi.comments(current.id, user.id);
        setItems((old) =>
          old.map((x) =>
            x.id === current.id
              ? { ...mergePlayback(x, p), comments: result?.data || x.comments }
              : x,
          ),
        );
        if (result) setCommentPage(result);
      }
      return true;
    } catch (e) {
      setCommentError(e.message);
      setActionError(e.message || "Không thể thực hiện thao tác.");
      return false;
    }
  };
  const loadMoreComments = async () => {
    if (!current || !user || !commentPage.hasNext) return;
    try {
      const p = await consumerApi.comments(
        current.id,
        user.id,
        commentPage.nextCursor,
      );
      setCommentPage(p);
      setItems((old) =>
        old.map((x) =>
          x.id === current.id
            ? { ...x, comments: [...x.comments, ...p.data] }
            : x,
        ),
      );
    } catch (e) {
      setCommentError(e.message);
    }
  };
  const toggle = () => {
    if (video.current?.paused)
      video.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    else {
      video.current?.pause();
      setPlaying(false);
    }
  };
  const onPlaying = () => {
    setPlaying(true);
    if (current) {
      const videoId = current.id;
      trackViewOnce(videoId, viewed.current, consumerApi)
        .then((views) => {
          if (views === undefined) return;
          setItems((old) =>
            old.map((item) => {
              if (item.id !== videoId) return item;
              const count = Math.max(item.views ?? 0, views);
              return { ...item, views: count, viewCount: count };
            }),
          );
        })
        .catch(() => {});
    }
  };
  const onMediaError = async () => {
    setPlaying(false);
    if (!current || mediaRetries.current.has(current.id)) return;
    mediaRetries.current.add(current.id);
    try {
      const p = await consumerApi.playback(current.id);
      setItems((old) =>
        old.map((x) => (x.id === p.id ? mergePlayback(x, p) : x)),
      );
    } catch (e) {
      setError(e.message);
    }
  };
  return {
    items,
    order,
    setOrder,
    index,
    setIndex,
    comments,
    setComments,
    text,
    setText,
    loading,
    error,
    muted,
    setMuted,
    playing,
    setPlaying,
    video,
    startY,
    current,
    act,
    toggle,
    onPlaying,
    onMediaError,
    commentError,
    actionError,
    commentPage,
    loadMoreComments,
  };
}
export default useFeed;
