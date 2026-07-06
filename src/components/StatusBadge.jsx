import { useTranslation } from 'react-i18next';

export default function StatusBadge({ status }) {
  const { t } = useTranslation();
  const map = {
    UNDER_REVIEW: 'pending',
    REVIEWING: 'pending',
    APPROVED: 'pass',
    REJECTED: 'reject',
    DELETED: 'deleted',
    TAKEN_DOWN: 'deleted'
  };
  const className = map[status] || map.UNDER_REVIEW;
  return <span className={`badge ${className}`}>{t(`status.${status}`)}</span>;
}
