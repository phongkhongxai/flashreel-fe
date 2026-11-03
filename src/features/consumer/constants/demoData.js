const authors = [
  "Minh Anh",
  "Lan Vy",
  "Hoàng Nam",
  "Thảo Linh",
  "Mây",
  "An Nhiên",
  "Phương Trần",
  "Hải Đăng",
];
const titles = [
  "Đạp xe đêm sau mưa ở Sài Gòn ✨",
  "Một góc Hội An thật dịu dàng 🏮",
  "Những ngày bình yên bên biển",
  "Một buổi sáng ở Hà Nội ☕",
  "Chậm lại một chút giữa phố",
  "Chuyến đi cuối tuần đáng nhớ",
  "Đón hoàng hôn cùng nhau",
  "Chuyện nhỏ của những ngày vui",
];
export const seed = () =>
  authors.map((author, i) => ({
    id: String(i + 1),
    author,
    title: titles[i],
    views: [428000, 82406, 37200, 19600, 12600, 8100, 4200, 1800][i],
    likes: [18200, 9812, 3820, 1610, 920, 580, 210, 87][i],
    liked: false,
    followed: false,
    color: [
      "#92545c",
      "#447770",
      "#687d98",
      "#966d58",
      "#685578",
      "#a96f69",
      "#668680",
      "#6e7993",
    ][i],
    comments: [
      {
        id: "c" + i,
        author: "Bảo Ngọc",
        text: "Đẹp quá, cảm ơn bạn đã chia sẻ! ✨",
      },
    ],
    status: "APPROVED",
  }));
export const seedMine = () => [
  {
    id: "m1",
    title: "Chạy bộ buổi sáng ở biển Nha Trang",
    status: "REVIEWING",
  },
  {
    id: "m2",
    title: "Một buổi chiều Sài Gòn",
    status: "APPROVED",
  },
  {
    id: "m3",
    title: "Ghi lại một buổi pop-up ngoài phố",
    status: "REJECTED",
    reason: "Nội dung quảng cáo chưa được mô tả rõ.",
  },
  {
    id: "m4",
    title: "Một ngày cũ",
    status: "TAKEN_DOWN",
  },
];
