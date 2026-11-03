import { useEffect, useRef, useState } from "react";
import { consumerApi } from "../services/consumerApi";
export default function useCreatorProfile(userId, viewerId) {
  const [profile, setProfile] = useState(null),
    [items, setItems] = useState([]),
    [page, setPage] = useState({ hasNext: false, nextCursor: null }),
    [loading, setLoading] = useState(true),
    [videosLoading, setVideosLoading] = useState(true),
    [loadingMore, setLoadingMore] = useState(false),
    [error, setError] = useState(""),
    [videoError, setVideoError] = useState(""),
    [following, setFollowing] = useState(null),
    [followError, setFollowError] = useState(""),
    [followingBusy, setFollowingBusy] = useState(false),
    [revision, setRevision] = useState(0);
  const generation = useRef(0),
    pageLock = useRef(false);
  useEffect(() => {
    let active = true;
    const request = ++generation.current;
    pageLock.current = false;
    setProfile(null);
    setItems([]);
    setPage({ hasNext: false, nextCursor: null });
    setLoading(true);
    setVideosLoading(true);
    setLoadingMore(false);
    setFollowingBusy(false);
    setError("");
    setVideoError("");
    setFollowError("");
    setFollowing(null);
    consumerApi
      .profile(userId)
      .then((p) => {
        if (active) setProfile(p);
      })
      .catch((e) => {
        if (active) setError(e.message || "Không thể tải hồ sơ.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    consumerApi
      .userVideos(userId)
      .then((p) => {
        if (active && request === generation.current) {
          setItems(p.data);
          setPage(p);
        }
      })
      .catch((e) => {
        if (active) setVideoError(e.message || "Không thể tải video.");
      })
      .finally(() => {
        if (active) setVideosLoading(false);
      });
    if (viewerId !== userId)
      consumerApi
        .followStatus(userId)
        .then((s) => {
          if (active) setFollowing(s.following);
        })
        .catch((e) => {
          if (active)
            setFollowError(e.message || "Không thể tải trạng thái theo dõi.");
        });
    return () => {
      active = false;
    };
  }, [userId, viewerId, revision]);
  async function loadMore() {
    if (!page.hasNext || pageLock.current) return;
    const request = generation.current;
    pageLock.current = true;
    setLoadingMore(true);
    setVideoError("");
    try {
      const p = await consumerApi.userVideos(userId, page.nextCursor);
      if (request === generation.current) {
        setItems((old) => [
          ...old,
          ...p.data.filter((v) => !old.some((x) => x.id === v.id)),
        ]);
        setPage(p);
      }
    } catch (e) {
      if (request === generation.current)
        setVideoError(e.message || "Không thể tải thêm video.");
    } finally {
      if (request === generation.current) {
        pageLock.current = false;
        setLoadingMore(false);
      }
    }
  }
  async function toggleFollow() {
    if (following === null || followingBusy) return;
    const request = generation.current;
    let changed = false;
    setFollowingBusy(true);
    setFollowError("");
    try {
      await (following
        ? consumerApi.unfollowAuthor(userId)
        : consumerApi.followAuthor(userId));
      changed = true;
      const [status, updated] = await Promise.all([
        consumerApi.followStatus(userId),
        consumerApi.profile(userId),
      ]);
      if (request === generation.current) {
        setFollowing(status.following);
        setProfile(updated);
      }
    } catch (e) {
      if (request === generation.current) {
        if (changed) setFollowing(null);
        setFollowError(e.message || "Không thể cập nhật theo dõi.");
      }
    } finally {
      if (request === generation.current) setFollowingBusy(false);
    }
  }
  return {
    profile,
    items,
    page,
    loading,
    videosLoading,
    loadingMore,
    error,
    videoError,
    following,
    followingBusy,
    followError,
    loadMore,
    toggleFollow,
    retry: () => setRevision((v) => v + 1),
  };
}
