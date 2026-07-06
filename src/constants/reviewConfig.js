export const initialVideos = [
  {
    id: 'fr-101',
    titleKey: 'videos.hanoiCoffee',
    title: 'A one-minute slow weekend at a Hanoi cafe',
    author: 'Lan Vy',
    email: 'lanvy@example.com',
    uploadedAt: '2026-06-29 10:24',
    status: 'REVIEWING',
    file: 'MOV \u00c2\u00b7 00:48 \u00c2\u00b7 126MB',
    duration: '00:48',
    views: 0,
    likes: 0,
    palette: 'night'
  },
  {
    id: 'fr-102',
    titleKey: 'videos.hoiAnLantern',
    title: 'Hoi An ancient town lantern night market',
    author: 'Minh Anh',
    email: 'minh@example.com',
    uploadedAt: '2026-06-28 20:16',
    status: 'APPROVED',
    file: 'MP4 \u00c2\u00b7 01:12 \u00c2\u00b7 188MB',
    duration: '01:12',
    views: 82406,
    likes: 9812,
    comments: 124,
    palette: 'green'
  },
  {
    id: 'fr-103',
    titleKey: 'videos.streetBrand',
    title: 'Street brand pop-up recap',
    author: 'Quoc Bao',
    email: 'bao@example.com',
    uploadedAt: '2026-06-28 17:42',
    status: 'REJECTED',
    file: 'MP4 \u00c2\u00b7 00:36 \u00c2\u00b7 90MB',
    duration: '00:36',
    views: 0,
    likes: 0,
    palette: 'rose',
    rejectionReasonKey: 'messages.rejectionExample'
  }
];

export const statusCodes = ['REVIEWING', 'APPROVED', 'REJECTED', 'TAKEN_DOWN'];

export const reasonCodes = ['COPYRIGHT', 'INAPPROPRIATE_CONTENT', 'LOW_QUALITY', 'SPAM', 'OTHER'];

export const statusToApi = {
  UNDER_REVIEW: 'REVIEWING',
  REVIEWING: 'REVIEWING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  DELETED: 'TAKEN_DOWN',
  TAKEN_DOWN: 'TAKEN_DOWN'
};
