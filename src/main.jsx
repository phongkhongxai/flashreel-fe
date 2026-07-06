import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Check,
  ChevronLeft,
  ListFilter,
  Play,
  Trash2,
  X
} from 'lucide-react';
import './i18n';
import { AuthProvider, useAuth } from './auth';
import { adminApproveVideo, adminGetVideos, adminRejectVideo, adminTakeDownVideo } from './api/adminVideoApi';
import { initialVideos, reasonCodes, statusCodes, statusToApi } from './constants/reviewConfig';
import { formatNumber } from './utils/formatters';
import { createEmptyVideo, getVideoTitle, mapReviewVideo } from './utils/reviewVideo';
import Header from './components/Header';
import Metric from './components/Metric';
import Sidebar from './components/Sidebar';
import StatusBadge from './components/StatusBadge';
import Thumbnail from './components/Thumbnail';
import LoginPage from './LoginPage';
import AuthenticatePage from './AuthenticatePage';
import './styles.css';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/authenticate" element={<AuthenticatePage />} />
      <Route path="/mobile/oauth/callback" element={<AuthenticatePage />} />
      <Route path="/" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AdminDashboard() {
  const { t } = useTranslation();
  const [videos, setVideos] = useState(initialVideos);
  const [view, setView] = useState('review');
  const [status, setStatus] = useState('REVIEWING');
  const [selectedId, setSelectedId] = useState(initialVideos[0].id);
  const [selectedReason, setSelectedReason] = useState('SPAM');
  const [customReason, setCustomReason] = useState(t('detail.defaultCustomReason'));
  const [detailMode, setDetailMode] = useState('review');
  const [search, setSearch] = useState('');
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [videoError, setVideoError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 10,
    totalElements: initialVideos.length,
    totalPages: 1,
    last: true
  });

  const selectedVideo = videos.find((videoItem) => videoItem.id === selectedId) || videos[0] || createEmptyVideo(t);
  const filteredVideos = useMemo(() => {
    const text = search.trim().toLowerCase();
    return videos.filter((videoItem) => {
      const title = getVideoTitle(videoItem, t);
      const matchesStatus = videoItem.status === status;
      const matchesSearch = !text || `${title} ${videoItem.email} ${videoItem.author}`.toLowerCase().includes(text);
      return matchesStatus && matchesSearch;
    });
  }, [videos, search, status, t]);

  const metrics = useMemo(() => ({
    pending: videos.filter((item) => item.status === 'REVIEWING' || item.status === 'UNDER_REVIEW').length,
    approved: videos.filter((item) => item.status === 'APPROVED').length,
    rejected: videos.filter((item) => item.status === 'REJECTED').length
  }), [videos]);

  React.useEffect(() => {
    let ignore = false;

    async function loadVideos() {
      setIsLoadingVideos(true);
      setVideoError('');
      try {
        const page = await adminGetVideos({ status: statusToApi[status], page: currentPage, size: pageInfo.size });
        if (ignore) return;

        const nextVideos = (page.content || []).map(mapReviewVideo);
        setVideos(nextVideos);
        setPageInfo({
          page: page.page ?? currentPage,
          size: page.size ?? pageInfo.size,
          totalElements: page.totalElements ?? nextVideos.length,
          totalPages: page.totalPages || 1,
          last: page.last ?? true
        });
        setSelectedId((currentId) => nextVideos.some((item) => item.id === currentId) ? currentId : nextVideos[0]?.id || '');
      } catch (error) {
        if (!ignore) setVideoError(error?.message || t('messages.loadVideosFailed'));
      } finally {
        if (!ignore) setIsLoadingVideos(false);
      }
    }

    loadVideos();
    return () => {
      ignore = true;
    };
  }, [status, currentPage, pageInfo.size, t]);

  function changeStatus(nextStatus) {
    setStatus(nextStatus);
    setCurrentPage(0);
  }

  function openDetail(videoId, mode = 'review') {
    setSelectedId(videoId);
    setDetailMode(mode);
    setView('detail');
  }

  async function approveVideo() {
    await adminApproveVideo(selectedVideo.id);
    setStatus('APPROVED');
    setCurrentPage(0);
    setView('review');
  }

  async function rejectVideo() {
    await adminRejectVideo(selectedVideo.id, {
      reasonType: selectedReason,
      customReason: customReason.trim() || t(`reason.${selectedReason}`)
    });
    setStatus('REJECTED');
    setCurrentPage(0);
    setView('review');
  }

  async function takeDownVideo() {
    await adminTakeDownVideo(selectedVideo.id);
    setStatus('TAKEN_DOWN');
    setCurrentPage(0);
    setView('review');
  }

  return (
    <div className="app">
      <Sidebar view={view} onView={setView} />
      <main className="main">
        <Header search={search} onSearch={setSearch} />
        {view === 'review' && (
          <ReviewWorkspace
            metrics={metrics}
            status={status}
            onStatus={changeStatus}
            videos={filteredVideos}
            onOpen={openDetail}
            isLoading={isLoadingVideos}
            error={videoError}
            pageInfo={pageInfo}
            onPage={setCurrentPage}
          />
        )}
        {view === 'detail' && (
          <ReviewDetail
            video={selectedVideo}
            selectedReason={selectedReason}
            onReason={setSelectedReason}
            customReason={customReason}
            onCustomReason={setCustomReason}
            onBack={() => setView('review')}
            onApprove={approveVideo}
            onReject={rejectVideo}
            onTakeDown={takeDownVideo}
            canShowActions={detailMode === 'review'}
          />
        )}
        {view === 'policies' && <PolicyCenter />}
      </main>
    </div>
  );
}

function ReviewWorkspace({ metrics, status, onStatus, videos, onOpen, isLoading, error, pageInfo, onPage }) {
  const { t, i18n } = useTranslation();
  const canGoPrevious = pageInfo.page > 0;
  const canGoNext = !pageInfo.last && pageInfo.page + 1 < pageInfo.totalPages;

  return (
    <>
      <section className="grid">
        <Metric label={t('metric.pending')} value={metrics.pending} />
        <Metric label={t('metric.approvedToday')} value={metrics.approved} />
        <Metric label={t('metric.rejectedToday')} value={metrics.rejected} />
        <Metric label={t('metric.averageHandlingTime')} value={t('metric.averageHandlingValue')} />
      </section>

      <section className="panel" aria-busy={isLoading}>
        <div className="panelHead">
          <strong><ListFilter size={17} /> {t('table.reviewList')}</strong>
          <div className="filters">
            {statusCodes.map((key) => (
              <button key={key} className={status === key ? 'chip on' : 'chip'} disabled={isLoading} onClick={() => onStatus(key)}>
                {t(`status.${key}`)}
              </button>
            ))}
          </div>
        </div>
        <div className="tableWrap">
          {error && <div className="formError tableError" role="alert">{error}</div>}
          <table>
            <thead>
              <tr>
                <th>{t('table.video')}</th>
                <th>{t('table.author')}</th>
                <th>{t('table.uploadedAt')}</th>
                <th>{t('table.status')}</th>
                <th>{t('table.metrics')}</th>
                <th>{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan="6" className="empty">{t('table.loading')}</td>
                </tr>
              )}
              {!isLoading && videos.map((videoItem) => (
                <tr key={videoItem.id}>
                  <td>
                    <div className="videoCell">
                      <Thumbnail palette={videoItem.palette} coverUrl={videoItem.coverUrl} />
                      <div>
                        <strong>{getVideoTitle(videoItem, t)}</strong>
                        <br />
                        <small>{videoItem.file}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="user">
                      <div className="avatar">
                        {videoItem.authorAvatar ? (
                          <img
                            src={videoItem.authorAvatar}
                            alt={videoItem.author}
                            className="avatar-img"
                          />
                        ) : (
                          videoItem.author[0]
                        )}
                      </div>

                      <div>
                        {videoItem.author}
                        <br />
                        <small>{videoItem.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>{videoItem.uploadedAt}</td>
                  <td><StatusBadge status={videoItem.status} /></td>
                  <td>{t('table.views')} {formatNumber(videoItem.views, i18n.language)} · {t('table.likes')} {formatNumber(videoItem.likes, i18n.language)} · {t('table.comments')} {formatNumber(videoItem.comments, i18n.language)}</td>
                  <td>
                    <button className={videoItem.status === 'REVIEWING' || videoItem.status === 'UNDER_REVIEW' ? 'btn primary' : 'btn'} disabled={isLoading} onClick={() => onOpen(videoItem.id, 'review')}>
                      {videoItem.status === 'REVIEWING' || videoItem.status === 'UNDER_REVIEW' ? t('button.review') : t('button.view')}
                    </button>
                    <button className="btn" disabled={isLoading} onClick={() => onOpen(videoItem.id, 'preview')}>{t('button.preview')}</button>
                  </td>
                </tr>
              ))}
              {!isLoading && videos.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty">{t('table.empty')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <footer className="pagination">
          <span>{t('table.pageInfo', { page: pageInfo.page + 1, totalPages: pageInfo.totalPages, totalElements: pageInfo.totalElements })}</span>
          <div>
            <button className="btn" disabled={isLoading || !canGoPrevious} onClick={() => onPage(pageInfo.page - 1)}>{t('button.previous')}</button>
            <button className="btn" disabled={isLoading || !canGoNext} onClick={() => onPage(pageInfo.page + 1)}>{t('button.next')}</button>
          </div>
        </footer>
      </section>
    </>
  );
}

function ReviewDetail({ video, selectedReason, onReason, customReason, onCustomReason, onBack, onApprove, onReject, onTakeDown, canShowActions }) {
  const { t } = useTranslation();
  const [actionError, setActionError] = useState('');
  const [submittingAction, setSubmittingAction] = useState('');
  const isSubmitting = Boolean(submittingAction);
  const rejectionReason = video.rejectionReasonKey ? t(video.rejectionReasonKey) : video.rejectionReason;
  const isReviewing = video.status === 'REVIEWING' || video.status === 'UNDER_REVIEW';
  const isTakenDown = video.status === 'TAKEN_DOWN' || video.status === 'DELETED';
  const showReviewActions = canShowActions && isReviewing;
  const showTakeDownAction = canShowActions && !isReviewing && !isTakenDown;

  async function runAction(action, actionKey) {
    setSubmittingAction(actionKey);
    setActionError('');
    try {
      await action();
    } catch (error) {
      setActionError(error?.message || t('messages.reviewActionFailed'));
    } finally {
      setSubmittingAction('');
    }
  }

  return (
    <section>
      <header className="detailTop">
        <button className="back" disabled={isSubmitting} onClick={onBack}><ChevronLeft size={18} /> {t('button.backToList')}</button>
        <StatusBadge status={video.status} />
      </header>
      <div className="layout">
        <div className={`preview ${video.palette}`}>
          {video.videoPreviewUrl ? (
            <video
              className="previewVideo"
              autoPlay
              controls
              muted
              playsInline
              poster={video.coverUrl || undefined}
              preload="metadata"
              src={video.videoPreviewUrl}
            />
          ) : (
            <Play className="play" size={58} fill="currentColor" />
          )}
          <div className="caption">
            <h2>{getVideoTitle(video, t)}</h2>
            <p>@{video.author} · {t('detail.firstFrameCover')} · {video.duration}</p>
          </div>
        </div>
        <div>
          <section className="card">
            <h2>{t('detail.videoInfo')}</h2>
            <div className="kv">
              <span>{t('detail.title')}</span><strong>{getVideoTitle(video, t)}</strong>
              <span>{t('detail.author')}</span><strong>{video.author} · {video.email}</strong>
              <span>{t('detail.file')}</span><strong>{video.file}</strong>
              <span>{t('detail.uploadedAt')}</span><strong>{video.uploadedAt}</strong>
              <span>{t('detail.publicStatus')}</span><strong>{video.status === 'APPROVED' ? t('detail.published') : t('detail.pendingRanking')}</strong>
              {rejectionReason && <><span>{t('detail.rejectReason')}</span><strong>{rejectionReason}</strong></>}
            </div>
          </section>

          {showReviewActions && (
            <section className="card">
              <h2>{t('detail.rejectReason')}</h2>
              <div className="reasons">
                {reasonCodes.map((code) => (
                  <button key={code} className={selectedReason === code ? 'reason on' : 'reason'} disabled={isSubmitting} onClick={() => onReason(code)}>
                    {t(`reason.${code}`)}
                  </button>
                ))}
              </div>
              <textarea className="textarea" value={customReason} disabled={isSubmitting} onChange={(event) => onCustomReason(event.target.value)} />
              <p className="note">{t('detail.rejectNote')}</p>
            </section>
          )}

          {(showReviewActions || showTakeDownAction) && (
            <section className="card">
              <h2>{showReviewActions ? t('detail.reviewActions') : t('detail.platformActions')}</h2>
              {actionError && <div className="formError" role="alert">{actionError}</div>}
              <div className="actions">
                {showReviewActions && (
                  <>
                    <button className="btn pass" disabled={isSubmitting} onClick={() => runAction(onApprove, 'approve')}><Check size={18} /> {submittingAction === 'approve' ? t('button.approving') : t('button.approve')}</button>
                    <button className="btn reject" disabled={isSubmitting} onClick={() => runAction(onReject, 'reject')}><X size={18} /> {submittingAction === 'reject' ? t('button.rejecting') : t('button.reject')}</button>
                    <button className="btn" disabled={isSubmitting}>{t('button.saveNote')}</button>
                  </>
                )}
                {showTakeDownAction && (
                  <button className="btn reject" disabled={isSubmitting} onClick={() => runAction(onTakeDown, 'takeDown')}><Trash2 size={18} /> {submittingAction === 'takeDown' ? t('button.takingDown') : t('button.takeDown')}</button>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </section>
  );
}

function PolicyCenter() {
  const { t } = useTranslation();

  return (
    <section className="policy">
      <aside className="panel policyList">
        <div className="policyItem on"><h2>{t('policy.privacyTitle')}</h2><p>{t('policy.published')} · {t('policy.chinese')} · 2026-06-20</p></div>
        <div className="policyItem"><h2>{t('policy.termsTitle')}</h2><p>{t('policy.published')} · {t('policy.chinese')} · 2026-06-20</p></div>
        <div className="policyItem"><h2>Chính sách quyền riêng tư</h2><p>{t('policy.published')} · Tiếng Việt · 2026-06-20</p></div>
        <div className="policyItem"><h2>Privacy Policy</h2><p>{t('policy.published')} · English · 2026-06-20</p></div>
      </aside>
      <main className="card policyEditor">
        <div className="filters">
          <button className="chip on">{t('language.chinese')}</button>
          <button className="chip">{t('language.vietnamese')}</button>
          <button className="chip">{t('language.english')}</button>
        </div>
        <div className="editorGrid">
          <label>{t('policy.type')}<select><option>{t('policy.privacyOption')}</option><option>{t('policy.termsOption')}</option></select></label>
          <label>{t('policy.version')}<input value="v1.2" readOnly /></label>
        </div>
        <label>{t('policy.title')}<input value={t('policy.editorTitle')} readOnly /></label>
        <label>{t('policy.content')}<textarea value={t('policy.editorContent')} readOnly /></label>
        <div className="publishRow"><span className="statusPill">{t('policy.current')}</span><button className="btn primary">{t('button.publishNewVersion')}</button></div>
      </main>
    </section>
  );
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);
