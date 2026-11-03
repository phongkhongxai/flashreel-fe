import useUpload from "../hooks/useUpload.js";
import { Link } from "react-router-dom";
import { UploadCloud } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { consumerApi } from "../services/consumerApi";
import PropTypes from "prop-types";
function Upload({ refresh, resubmit }) {
  const {
    nav,
    id,
    title,
    setTitle,
    file,
    url,
    error,
    setError,
    pick,
    isSubmitting,
    setIsSubmitting,
  } = useUpload({
    refresh,
    resubmit,
  });
  return (
    <div className="fr-page fr-form-page">
      <Link className="fr-back" to={resubmit ? "/my-videos" : "/"}>
        <ArrowLeft size={16} /> Quay lại
      </Link>
      <span className="fr-eyebrow">CHIA SẺ KHOẢNH KHẮC</span>
      <h1>{resubmit ? "Gửi lại video" : "Đăng video mới"}</h1>
      <p>Mỗi câu chuyện đều có một nơi thuộc về.</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!resubmit && !file) {
            setError("Vui lòng chọn video.");
            return;
          }
          if (file && error) return;
          if (isSubmitting) return;
          setIsSubmitting(true);
          try {
            await (resubmit
              ? consumerApi.resubmit(id, title.trim(), file)
              : consumerApi.upload(title.trim(), file));
            refresh();
            nav("/my-videos");
          } catch (error) {
            setError(error.message || "Không thể gửi video.");
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <label
          className="fr-upload-zone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            pick(e.dataTransfer.files[0]);
          }}
        >
          {url ? (
            <video
              src={url}
              controls
              onLoadedMetadata={(e) => {
                let d = e.currentTarget.duration;
                if (d < 5 || d > 180)
                  setError("Video phải dài từ 5 giây đến 3 phút.");
              }}
              onError={() =>
                setError(
                  "Trình duyệt không đọc được video này. Hãy thử MP4 khác.",
                )
              }
            />
          ) : (
            <>
              <span>
                <UploadCloud size={28} />
              </span>
              <b>Chọn video để tải lên</b>
              <small>hoặc kéo và thả video vào đây</small>
              <em>MP4 hoặc MOV · 5 giây – 3 phút · tối đa 300 MB</em>
            </>
          )}
          <input
            type="file"
            accept="video/mp4,video/quicktime,.mov"
            onChange={(e) => pick(e.target.files[0])}
          />
        </label>
        {file && <p>{file.name}</p>}
        <label>
          Tiêu đề video <small>{title.length}/60</small>
          <input
            required
            maxLength={60}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Thêm một dòng mô tả cho video..."
          />
        </label>
        <div className="fr-note">
          ✦ &nbsp; Video của bạn sẽ được xét duyệt trước khi xuất hiện trên
          FlashReel.
        </div>
        {error && <p className="fr-error">{error}</p>}
        <button
          className="fr-primary"
          disabled={isSubmitting || !!error || !title.trim()}
        >
          {isSubmitting
            ? "Đang gửi..."
            : resubmit
              ? "Gửi lại để duyệt"
              : "Gửi video để duyệt"}{" "}
          <span>→</span>
        </button>
      </form>
    </div>
  );
}
Upload.propTypes = {
  refresh: PropTypes.func,
  resubmit: PropTypes.bool,
};
export default Upload;
