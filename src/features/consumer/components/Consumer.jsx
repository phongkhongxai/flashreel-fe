import PasswordRecovery from "./PasswordRecovery";
import ConsumerBottomNav from "./ConsumerBottomNav.jsx";
import ConsumerSidebar from "./ConsumerSidebar.jsx";
import styles from "./Consumer.module.css";
import useConsumer from "../hooks/useConsumer.js";
import { Routes } from "react-router-dom";
import { Route } from "react-router-dom";
import { Link } from "react-router-dom";
import Guard from "../components/Guard.jsx";
import Feed from "../components/Feed.jsx";
import Auth from "../components/Auth.jsx";
import Verify from "../components/Verify.jsx";
import Upload from "../components/Upload.jsx";
import MyVideos from "../components/MyVideos.jsx";
import MyVideoPlayer from "../components/MyVideoPlayer.jsx";
import PublicVideoPlayer from "../components/PublicVideoPlayer.jsx";
import Profile from "../components/Profile.jsx";
import CreatorProfile from "../components/CreatorProfile.jsx";
function Consumer() {
  const { loc, requireUser, common } = useConsumer();
  return (
    <div className={`fr ${styles.scope}`}>
      <div className="fr-shell">
        <ConsumerSidebar loc={loc} requireUser={requireUser} />
        <main className="fr-main">
          <Routes>
            <Route path="/" element={<Feed {...common} />} />
            <Route path="/login" element={<Auth {...common} />} />
            <Route path="/register" element={<Auth {...common} register />} />
            <Route path="/verify-email" element={<Verify />} />
            <Route path="/forgot-password" element={<PasswordRecovery />} />
            <Route
              path="/upload"
              element={
                <Guard {...common}>
                  <Upload {...common} />
                </Guard>
              }
            />
            <Route
              path="/my-videos"
              element={
                <Guard {...common}>
                  <MyVideos {...common} />
                </Guard>
              }
            />
            <Route
              path="/my-videos/:id"
              element={
                <Guard {...common}>
                  <MyVideoPlayer />
                </Guard>
              }
            />
            <Route
              path="/my-videos/:id/resubmit"
              element={
                <Guard {...common}>
                  <Upload {...common} resubmit />
                </Guard>
              }
            />
            <Route
              path="/users/:userId"
              element={
                <Guard {...common}>
                  <CreatorProfile user={common.user} />
                </Guard>
              }
            />
            <Route
              path="/users/:userId/video/:id"
              element={
                <Guard {...common}>
                  <PublicVideoPlayer user={common.user} />
                </Guard>
              }
            />
            <Route
              path="/profile"
              element={
                <Guard {...common}>
                  <Profile {...common} />
                </Guard>
              }
            />
            <Route
              path="*"
              element={
                <div className="fr-page">
                  <h1>Không tìm thấy trang</h1>
                  <Link to="/">Về trang chủ</Link>
                </div>
              }
            />
          </Routes>
        </main>
        <ConsumerBottomNav requireUser={requireUser} />
      </div>
    </div>
  );
}
export default Consumer;

