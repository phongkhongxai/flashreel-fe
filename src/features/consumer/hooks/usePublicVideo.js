import { useEffect, useRef, useState } from "react";
import { consumerApi } from "../services/consumerApi";
import { trackViewOnce } from "../utils/trackViewOnce";

export default function usePublicVideo(id, user) {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [text, setText] = useState("");
  const [page, setPage] = useState({ hasNext: false });
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const viewed = useRef(new Set());
  const mediaRetried = useRef(false);
  const activeId = useRef(id);
  activeId.current = id;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setVideo(null);
    consumerApi.playback(id).then((result) => {
      if (!result.videoUrl) throw new Error("Video chưa có đường dẫn phát.");
      if (active) setVideo(result);
    }).catch((e) => active && setError(e.message || "Không thể tải video."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id, attempt]);

  useEffect(() => {
    mediaRetried.current = false;
    setCommentsOpen(false);
    setText("");
  }, [id]);

  useEffect(() => {
    if (!commentsOpen || !user) return;
    let active = true;
    setCommentError("");
    consumerApi.comments(id, user.id).then((result) => {
      if (!active) return;
      setPage(result);
      setVideo((old) => old?.id === id ? { ...old, comments: result.data } : old);
    }).catch((e) => active && setCommentError(e.message || "Không thể tải bình luận."));
    return () => { active = false; };
  }, [commentsOpen, id, user?.id]);

  useEffect(() => {
    const close = (event) => { if (event.key === "Escape") setCommentsOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  async function act(action) {
    if (busy) return false;
    setBusy(true);
    setActionError("");
    setCommentError("");
    try {
      await action();
      const [fresh, result] = await Promise.all([
        consumerApi.playback(id),
        commentsOpen ? consumerApi.comments(id, user.id) : Promise.resolve(null),
      ]);
      if (activeId.current === id) {
        setVideo((old) => old?.id === id ? { ...fresh, videoUrl: old.videoUrl, coverUrl: old.coverUrl, views: Math.max(old.views, fresh.views), comments: result?.data || old.comments } : old);
        if (result) setPage(result);
      }
      return true;
    } catch (e) {
      if (activeId.current === id) setActionError(e.message || "Không thể thực hiện thao tác.");
      return false;
    } finally { setBusy(false); }
  }

  async function loadMoreComments() {
    if (!page.hasNext || !user) return;
    try {
      const result = await consumerApi.comments(id, user.id, page.nextCursor);
      if (activeId.current !== id) return;
      setPage(result);
      setVideo((old) => old?.id === id ? { ...old, comments: [...old.comments, ...result.data] } : old);
    } catch (e) { setCommentError(e.message || "Không thể tải bình luận."); }
  }
  function onPlaying() {
    trackViewOnce(id, viewed.current, consumerApi).then((views) => {
      if (views !== undefined && activeId.current === id)
        setVideo((old) => old?.id === id ? { ...old, views: Math.max(old.views, views) } : old);
    }).catch(() => {});
  }
  function onMediaError() {
    if (!mediaRetried.current) { mediaRetried.current = true; setAttempt((n) => n + 1); }
    else setError("Không thể phát video. Vui lòng kiểm tra kết nối hoặc thử lại.");
  }
  function retry() { mediaRetried.current = false; setAttempt((n) => n + 1); }
  return { video, loading, error, actionError, commentError, commentsOpen, setCommentsOpen, text, setText, page, busy, act, loadMoreComments, onPlaying, onMediaError, retry };
}

