# 🤝 Hướng dẫn Đóng góp

Cảm ơn bạn quan tâm đến dự án **Quản lý Cửa Hàng Bán Sách**! 

## 📋 Cách Bắt Đầu

### 1. Fork & Clone
```bash
git clone https://github.com/[your-username]/bookstore-manager.git
cd bookstore-manager
```

### 2. Cài đặt Dependencies & Database
```bash
npm install
copy .env.example .env
npx prisma migrate dev
npx prisma db seed
```

### 3. Chạy Dev Server
```bash
npm run dev
```
Mở trình duyệt: `http://localhost:3000`

**Tài khoản mẫu:**
- Admin: `admin` / `123456`
- Warehouse: `thukho` / `123456`  
- Sales: `banhang` / `123456`

## 🛠️ Phát Triển

### Cấu Trúc Dự Án
- `src/app/` - Next.js pages & API routes
- `src/components/` - React components
- `src/lib/` - Utilities, validators, helpers
- `prisma/` - Database schema & migrations
- `electron/` - Electron desktop app entry

### Quy Tắc Code
1. **Naming**: 
   - Components: PascalCase (`BookList.tsx`)
   - Functions: camelCase (`handleSubmit()`)
   - Vietnamese database field names (`tenSach`, `soLuongTon`)

2. **Type Safety**:
   - Luôn sử dụng TypeScript types
   - Import type-only khi cần: `import type { User }`

3. **Error Handling**:
   - API: Dùng `handleError()` từ `@/lib/api-helpers`
   - Zod validation cho requests
   - Lỗi tiếng Việt

4. **Database**:
   - Prisma client singleton: `import { prisma } from "@/lib/prisma"`
   - Migrations versioned: `npx prisma migrate dev --name feature_name`

### Before Committing
```bash
npm run lint          # Check errors
npm run build         # Build production
```

## 📝 Commit Guidelines

```
[FEATURE] Thêm chức năng quản lý sách

- Thêm API /api/books GET/POST/PUT/DELETE
- Cập nhật database schema
- Thêm unit tests

Fixes #123
```

**Prefixes:**
- `[FEATURE]` - Tính năng mới
- `[BUGFIX]` - Sửa lỗi
- `[REFACTOR]` - Cải thiện code
- `[DOCS]` - Documentation

## 🧪 Testing

```bash
# Chạy tests (nếu có)
npm test

# Kiểm tra build
npm run build
npm run build:exe
```

## 📦 Build & Release

### Web Server
```bash
npm run build
npm start
```

### Desktop App (EXE)
```bash
npm run build:exe
# Output: release/QuanLyCuaHangSach-1.0.0.exe
```

## 🐛 Báo Lỗi

**Issue Format:**
1. Mô tả lỗi rõ ràng
2. Steps to reproduce
3. Expected vs actual behavior
4. Screenshot/logs nếu có

## 📚 Tài Liệu

- [AGENTS.md](AGENTS.md) - AI agent guide
- [README.md](README.md) - User manual
- [prisma/schema.prisma](prisma/schema.prisma) - Database schema

## ✨ Ideas for Contributions

- [ ] Add unit tests
- [ ] Improve UI/UX
- [ ] Performance optimization
- [ ] Mobile responsive design
- [ ] Report export (Excel, PDF)
- [ ] Multi-language support
- [ ] Dark mode

---

**Questions?** Open an issue hoặc discussion! 🚀
