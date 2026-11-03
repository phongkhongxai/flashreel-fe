import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Grid2X2, UserRoundPlus, Check } from "lucide-react";
import PropTypes from "prop-types";
import Avatar from "../../../components/Avatar";
import { consumerApi } from "../services/consumerApi";
import CreatorVideoCard from "./CreatorVideoCard";
import useCreatorProfile from "../hooks/useCreatorProfile";
import { fmt } from "../utils/formatCount";
import styles from "./CreatorProfile.module.css";
export default function CreatorProfile({ user }) {
  const { userId } = useParams();
  const {
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
    retry,
  } = useCreatorProfile(userId, user?.id);
  return (
    <div className={styles.page}>
      <Link className={styles.back} to="/">
        <ArrowLeft size={17} /> Quay lại khám phá
      </Link>
      {loading && <p role="status">Đang tải hồ sơ...</p>}
      {error && (
        <div role="alert">
          <p>{error}</p>
          <button className={styles.secondary} onClick={retry}>
            Thử lại
          </button>
        </div>
      )}
      {profile && (
        <>
          <header className={styles.header}>
            <Avatar
              key={profile.id}
              className={styles.avatar}
              name={profile.nickname || profile.displayName || profile.username}
              src={profile.avatarUrl}
              onRefresh={async () =>
                (await consumerApi.profile(userId)).avatarUrl
              }
            />
            <div className={styles.identity}>
              <p className={styles.handle}>@{profile.username}</p>
              <h1>
                {profile.nickname || profile.displayName || profile.username}
              </h1>
              <div className={styles.stats}>
                <div>
                  <strong>{fmt(profile.followingCount || 0)}</strong>
                  <span>Đang theo dõi</span>
                </div>
                <div>
                  <strong>{fmt(profile.followerCount || 0)}</strong>
                  <span>Người theo dõi</span>
                </div>
                <div>
                  <strong>{fmt(profile.videoCount || 0)}</strong>
                  <span>Video</span>
                </div>
              </div>
              <p className={styles.bio}>
                {profile.bio || "Chào mừng bạn đến với trang cá nhân của mình."}
              </p>
              <div className={styles.actions}>
                {user?.id === userId ? (
                  <Link className={styles.secondary} to="/profile">
                    Chỉnh sửa hồ sơ
                  </Link>
                ) : (
                  <button
                    className={following ? styles.secondary : styles.follow}
                    disabled={following === null || followingBusy}
                    onClick={toggleFollow}
                  >
                    {following ? (
                      <>
                        <Check size={17} /> Đang theo dõi
                      </>
                    ) : (
                      <>
                        <UserRoundPlus size={17} /> Theo dõi
                      </>
                    )}
                  </button>
                )}
              </div>
              {followError && (
                <p className={styles.error} role="alert">
                  {followError} <button onClick={retry}>Thử lại</button>
                </p>
              )}
            </div>
          </header>
          <section className={styles.videos}>
            <div className={styles.tabs}>
              <span>
                <Grid2X2 size={17} /> Video
              </span>
            </div>
            {videoError && (
              <p className={styles.error} role="alert">
                {videoError}{" "}
                <button onClick={page.nextCursor ? loadMore : retry}>
                  Thử lại
                </button>
              </p>
            )}
            {videosLoading && (
              <p className={styles.empty} role="status">
                Đang tải video...
              </p>
            )}
            {!videosLoading && !videoError && items.length === 0 && (
              <p className={styles.empty}>Chưa có video công khai.</p>
            )}
            <div className={styles.grid}>
              {items.map((v) => (
                <CreatorVideoCard key={v.id} video={v} userId={userId} />
              ))}
            </div>
            {page.hasNext && (
              <button
                className={styles.loadMore}
                disabled={loadingMore}
                onClick={loadMore}
              >
                {loadingMore ? "Đang tải..." : "Xem thêm"}
              </button>
            )}
          </section>
        </>
      )}
    </div>
  );
}
CreatorProfile.propTypes = { user: PropTypes.object };
