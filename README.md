# 📚 Hệ Thống Quản Lý Cửa Hàng Bán Sách

Ứng dụng quản lý cửa hàng sách toàn diện với Next.js, TypeScript, Tailwind CSS, Prisma và SQLite.

🖥️ **Web & Desktop** | 🎯 **Quản lý Kho** | 📊 **Báo Cáo Doanh Thu** | 💾 **SQLite Database**

## 📥 Tải Xuống

### 🖥️ Windows Desktop App (Recommended)
- **[QuanLyCuaHangSach-1.0.0.exe](releases)** - Tải EXE, chạy trực tiếp, không cần cài đặt

### 🌐 Web Development
```bash
npm install
copy .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Mở trình duyệt tại `http://localhost:3000`.

## 🔨 Xuất File EXE

```bash
npm run build:exe
```

File chạy trực tiếp nằm tại `release/QuanLyCuaHangSach-1.0.0.exe` - có thể copy và chạy trên bất kỳ máy Windows nào mà không cần cài đặt hoặc dependency.

## Tài khoản mẫu

| Vai trò | Tài khoản | Mật khẩu |
| --- | --- | --- |
| Quản lý | `admin` | `123456` |
| Thủ kho | `thukho` | `123456` |
| Bán hàng | `banhang` | `123456` |

## Chức năng chính

- Đăng nhập và hiển thị menu theo vai trò.
- Dashboard thống kê nhanh.
- Quản lý sách: tìm kiếm, lọc, thêm, sửa, xóa.
- Quản lý nhà cung cấp và nhân viên.
- Lập phiếu nhập kho và tự cộng tồn kho.
- Bán hàng, tự tính tổng tiền, không cho bán quá tồn, tự trừ tồn kho.
- In hóa đơn bằng `window.print()`.
- Lập phiếu đổi/trả sách.
- Báo cáo doanh thu, top sách bán chạy, tồn kho thấp, xuất CSV.

## 🛠️ Phát Triển

### Tech Stack
- **Frontend**: React 19, Next.js 16, TypeScript
- **Styling**: Tailwind CSS, Lucide icons
- **Backend**: Next.js API routes
- **Database**: Prisma ORM + SQLite
- **Desktop**: Electron 42
- **Validation**: Zod schema

### Cấu Trúc Dự Án
```
src/
├── app/          - Next.js pages & API routes
├── components/   - React UI components
└── lib/          - Utilities, validators, helpers
prisma/           - Database schema & migrations
electron/         - Desktop app entry point
```

### Commands
```bash
npm run dev              # Dev server (http://localhost:3000)
npm run build            # Production build
npm run build:exe        # Build Windows EXE
npm run lint             # ESLint check
npx prisma studio       # Database browser
```

## 📚 Documentation

- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Hướng dẫn đóng góp
- **[AGENTS.md](AGENTS.md)** - AI agent setup guide
- **[prisma/schema.prisma](prisma/schema.prisma)** - Database schema

## 🐛 Báo Lỗi / Yêu Cầu Tính Năng

Hãy tạo [GitHub issue](../../issues) với chi tiết:
- Mô tả vấn đề rõ ràng
- Steps to reproduce
- Screenshots nếu có

## 🎯 Roadmap

- [ ] Unit & integration tests
- [ ] Mobile responsive design
- [ ] Dark mode
- [ ] Multi-language support
- [ ] PDF/Excel export
- [ ] Advanced analytics
- [ ] Backup/restore database

## 📄 License

MIT - Tự do sử dụng, sửa đổi, phân phối

## ❓ Hỗ Trợ

Có câu hỏi? Mở [GitHub Discussion](../../discussions) hoặc [GitHub Issue](../../issues)

---

## Ghi chú SQLite trên Windows

Nếu `npx prisma migrate dev` báo `Schema engine error` khi database chưa tồn tại, tạo file SQLite trước rồi chạy lại:

```powershell
New-Item -ItemType File -Force prisma/dev.db
npx prisma migrate dev
```
Nếu bạn không biết làm thì bạn có thể tải file: cài đặt trực tiếp lên máy bạn 
