import Avatar from "../../../components/Avatar";
import useProfile from "../hooks/useProfile.js";
import { LogOut } from "lucide-react";
import { Globe } from "lucide-react";
import { getMyProfile, updateMyProfile } from "../../../services/userApi";
import {
  requestAccountCancellation,
  confirmAccountCancellation,
} from "../../../services/accountApi";
import PropTypes from "prop-types";
function Profile({ user, setUser, refresh, language, setLanguage, logout }) {
  const { nav, name, setName, avatar, setAvatar, edit, setEdit } = useProfile({
    user,
    setUser,
    refresh,
    language,
    setLanguage,
  });
  return (
    <div className="fr-page fr-profile">
      <span className="fr-eyebrow">KHÔNG GIAN CỦA BẠN</span>
      <h1>Hồ sơ</h1>
      <div className="fr-profile-card">
        <div className="fr-profile-banner">
          <span>YOUR STORY, YOUR WAY.</span>
          <div>
            <Avatar
              key={user?.id}
              className="fr-avatar fr-big-avatar"
              name={user?.name}
              src={user?.avatar}
              onRefresh={async () => (await getMyProfile()).avatarUrl}
            />
            <section>
              <h2>{user?.name}</h2>
              <p>{user?.email}</p>
            </section>
          </div>
        </div>
        <div className="fr-stats">
          <div>
            <b>{user?.videoCount ?? 0}</b>
            <span>Video</span>
          </div>
          <div>
            <b>{user?.followerCount ?? 0}</b>
            <span>Người theo dõi</span>
          </div>
          <div>
            <b>{user?.followingCount ?? 0}</b>
            <span>Đang theo dõi</span>
          </div>
        </div>
        <div className="fr-profile-body">
          <button className="fr-outline" onClick={() => setEdit(!edit)}>
            Chỉnh sửa hồ sơ
          </button>
          {edit && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const updated = await updateMyProfile({
                    nickname: name,
                    ...(avatar && { avatarFile: avatar }),
                  });
                  setUser(updated);
                  setEdit(false);
                  refresh();
                } catch (error) {
                  window.alert(error.message || "Không thể cập nhật hồ sơ.");
                }
              }}
            >
              <label>
                Tên hiển thị
                <input
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label>
                Ảnh đại diện
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    let f = e.target.files[0];
                    if (f) setAvatar(f);
                  }}
                />
              </label>
              <button className="fr-primary">Lưu thay đổi</button>
            </form>
          )}
          <div className="fr-setting">
            <span>
              <Globe size={19} /> Ngôn ngữ
            </span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
              <option value="zh">繁體中文</option>
            </select>
          </div>
          <div className="fr-setting">
            <span>Điều khoản & quyền riêng tư</span>
            <span>→</span>
          </div>
          <button
            className="fr-text-button"
            onClick={async () => {
              try {
                await logout();
              } catch {
                window.alert(
                  "Không thể xác nhận đăng xuất trên máy chủ. Phiên trên thiết bị đã được xóa.",
                );
              }
              nav("/");
            }}
          >
            <LogOut size={17} /> Đăng xuất
          </button>
          <button
            className="fr-text-button danger"
            onClick={async () => {
              try {
                await requestAccountCancellation();
                if (
                  window.confirm("Bạn muốn xác nhận vô hiệu hóa tài khoản?")
                ) {
                  await confirmAccountCancellation();
                  try {
                    await logout();
                  } catch {}
                  nav("/");
                }
              } catch (error) {
                window.alert(
                  error.message || "Không thể vô hiệu hóa tài khoản.",
                );
              }
            }}
          >
            Vô hiệu hóa tài khoản
          </button>
        </div>
      </div>
    </div>
  );
}
Profile.propTypes = {
  user: PropTypes.object,
  setUser: PropTypes.func,
  refresh: PropTypes.func,
  language: PropTypes.string,
  setLanguage: PropTypes.func,
};
export default Profile;
