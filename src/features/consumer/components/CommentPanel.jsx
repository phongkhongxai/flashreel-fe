import { X } from "lucide-react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { consumerApi } from "../services/consumerApi";
import Avatar from "../../../components/Avatar";
function CommentPanel({
  current,
  setComments,
  act,
  text,
  setText,
  user,
  commentError,
  commentPage,
  loadMoreComments,
}) {
  return (
    <div className="fr-comment-backdrop" onClick={() => setComments(false)}>
      <section className="fr-comments" onClick={(e) => e.stopPropagation()}>
        <header>
          <div>
            <h2>
              Bình luận{" "}
              <span>{current.commentCount ?? current.comments.length}</span>
            </h2>
            <p>Cùng trò chuyện nào</p>
          </div>
          <button onClick={() => setComments(false)} aria-label="Đóng">
            <X />
          </button>
        </header>
        <div className="fr-comment-list">
          {commentError && <p className="fr-error">{commentError}</p>}
          {current.comments.map((c) => (
            <div className="fr-comment" key={c.id}>
              {c.authorId ? (
                <Link
                  to={
                    c.authorId === user?.id
                      ? "/profile"
                      : `/users/${encodeURIComponent(c.authorId)}`
                  }
                  aria-label={`Xem trang cá nhân của ${c.author}`}
                >
                  <Avatar
                    name={c.author}
                    src={c.authorAvatar}
                    onRefresh={async () =>
                      (await consumerApi.profile(c.authorId)).avatarUrl
                    }
                  />
                </Link>
              ) : (
                <Avatar name={c.author} src={c.authorAvatar} />
              )}
              <div>
                {c.authorId ? (
                  <Link
                    to={
                      c.authorId === user?.id
                        ? "/profile"
                        : `/users/${encodeURIComponent(c.authorId)}`
                    }
                  >
                    <b>{c.author}</b>
                  </Link>
                ) : (
                  <b>{c.author}</b>
                )}
                <p>{c.text}</p>
                <small>Vừa xong</small>
              </div>
              {c.own && (
                <button
                  onClick={() =>
                    act(() => consumerApi.deleteComment(current.id, c.id))
                  }
                >
                  Xóa
                </button>
              )}
            </div>
          ))}
          {commentPage?.hasNext && (
            <button onClick={loadMoreComments}>Xem thêm</button>
          )}
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!text.trim()) return;
            if (await act(() => consumerApi.comment(current.id, text.trim())))
              setText("");
          }}
        >
          <input
            value={text}
            maxLength={500}
            onChange={(e) => setText(e.target.value)}
            placeholder="Thêm bình luận..."
          />
          <button>Gửi</button>
        </form>
      </section>
    </div>
  );
}
CommentPanel.propTypes = {
  current: PropTypes.object.isRequired,
  setComments: PropTypes.func.isRequired,
  act: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
  setText: PropTypes.func.isRequired,
  user: PropTypes.object,
};
export default CommentPanel;
