# AI Coding Agent Guide - Bookstore Management System

## 🏢 Project Overview

**Quản lý Cửa Hàng Bán Sách** (Bookstore Management System) - A Vietnamese-language full-stack desktop and web application for managing bookstore operations including inventory, sales, staff, and reporting.

- **Type**: Next.js + Electron desktop app hybrid
- **Status**: Buildable to standalone EXE
- **Language**: Vietnamese (UI/docs/data labels)
- **Database**: SQLite via Prisma ORM

## 🛠️ Tech Stack

| Layer | Tech | Notes |
|-------|------|-------|
| **Frontend** | React 19, Next.js 16, TypeScript 6 | Path alias: `@/*` → `src/*` |
| **Styling** | Tailwind CSS 3, PostCSS | ShadCN-like UI components in `src/components/ui.tsx` |
| **Icons/Charts** | Lucide React, Recharts | Dashboard visualizations |
| **Backend** | Next.js API routes | Zod validation, Vietnamese error messages |
| **Database** | Prisma ORM + SQLite | Migrations in `prisma/migrations/` |
| **Desktop** | Electron 42 + electron-builder | Builds portable Windows EXE |
| **Validation** | Zod 4 | Used in API routes (see `src/lib/validators.ts`) |

## 📂 Project Structure

```
src/
├── app/                      # Next.js app directory (React Server Components)
│   ├── layout.tsx            # Root HTML structure
│   ├── page.tsx              # Home/auth page
│   ├── globals.css           # Tailwind imports
│   └── api/                  # API routes
│       ├── login/route.ts         # Auth endpoint
│       ├── books/route.ts         # Book CRUD
│       ├── employees/route.ts     # Staff management
│       ├── suppliers/route.ts     # Supplier CRUD
│       ├── purchases/route.ts     # Incoming inventory (PhieuNhap)
│       ├── sales/route.ts         # Sales orders (HoaDon)
│       ├── returns/route.ts       # Returns/exchanges (DoiTra)
│       ├── reports/route.ts       # Business analytics/exports
│       └── dashboard/route.ts     # Dashboard statistics
├── components/
│   └── ui.tsx                # Shared UI components (modular structure)
├── lib/
│   ├── prisma.ts             # Prisma client singleton
│   ├── api-helpers.ts        # ok/fail/handleError response utilities
│   ├── format.ts             # Formatting utilities (currency, date, etc.)
│   ├── labels.ts             # Vietnamese enum labels
│   ├── validators.ts         # Zod schemas for API validation
│   └── types.ts              # TypeScript interfaces/types
└── types.ts                  # Root type definitions

prisma/
├── schema.prisma             # Data models
├── seed.ts                   # Database initialization (sample data)
└── migrations/               # Version-controlled schema changes

electron/
└── main.cjs                  # Electron entry point (CommonJS)

scripts/
└── prepare-standalone.mjs    # Build preparation for EXE packaging
```

## 🗄️ Database Schema (Prisma)

**Key Models**:
- **NhanVien** (Staff): id, maNV, hoTen, taiKhoan, matKhau, vaiTro (admin/thukho/banhang)
- **Sach** (Books): id, maSach, tenSach, tacGia, theLoai, giaBia, soLuongTon, mucTonToiThieu
- **NhaCungCap** (Suppliers): id, maNCC, tenNCC, diaChi, soDienThoai, email
- **PhieuNhap** (Purchase Orders): ngayNhap, nhaCungCapId, nhanVienId, tongTienNhap
- **ChiTietPhieuNhap** (Purchase Details): links Sach to PhieuNhap with soLuongNhap, donGiaNhap
- **HoaDon** (Invoices/Sales): Sales orders with automatic stock deduction
- **DoiTra** (Returns): Exchange/return records linked to Sach

**Key Relationships**:
- PhieuNhap → NhaCungCap (many-to-one)
- PhieuNhap → NhanVien (many-to-one)
- ChiTietPhieuNhap → Sach (many-to-one)
- Cascading deletes on PhieuNhap deletion

## 🔄 Development Workflow

### Setup
```bash
npm install                    # Install dependencies
copy .env.example .env         # Create env file (set DATABASE_URL)
npx prisma migrate dev         # Apply migrations & generate Prisma Client
npx prisma db seed             # Load seed data (sample staff, books, suppliers)
```

### Development
```bash
npm run dev                    # Start Next.js dev server (http://localhost:3000)
npm run lint                   # Run ESLint
```

### Build
```bash
npm run build                  # Build Next.js (output: .next/)
npm run build:standalone       # Build standalone app + prepare for Electron
npm run build:exe              # Final: build portable Windows EXE (output: release/*.exe)
```

### Database
```bash
npx prisma migrate dev         # Create/apply migrations
npx prisma db seed             # Run seed.ts script
npx prisma generate            # Regenerate Prisma Client (auto on migrate)
```

## 🔐 Authentication & Roles

**Sample Accounts** (from seed):
| Vai Trò | Username | Password |
|---------|----------|----------|
| Admin | `admin` | `123456` |
| Warehouse (Thủ kho) | `thukho` | `123456` |
| Sales (Bán hàng) | `banhang` | `123456` |

**API Login**:
- `POST /api/login` → returns session/JWT (check `src/app/api/login/route.ts`)
- Subsequent requests validate against NhanVien.vaiTro (admin/thukho/banhang)

## 📋 API Route Conventions

All API routes follow this pattern (see `src/lib/api-helpers.ts`):

```typescript
import { ok, fail, handleError } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Validate with Zod from @/lib/validators
    // Query/mutate Prisma
    return ok({ data: result });  // 200 + JSON
  } catch (error) {
    return handleError(error);    // 500 or 400 with Vietnamese message
  }
}
```

**Response Format**:
- **Success**: `{ data: {...}, message?: "..." }`
- **Error**: `{ message: "Vietnamese error text" }` with status 400/500

## 🎨 UI & Components

- **Component Library**: Custom built in `src/components/ui.tsx` (not ShadCN installed separately)
- **Styling**: Tailwind CSS with custom color scheme
- **Icons**: Lucide React (e.g., `<Trash2 />`, `<Plus />`)
- **Forms**: Plain HTML + React hooks (no form library)
- **State**: React hooks, no Redux/Zustand

## 📝 Code Conventions

1. **Naming**:
   - Vietnamese database field names: `tenSach`, `soLuongTon`, `vaiTro`
   - English React component names: `BookList`, `SalesForm`
   - Constants in `src/lib/labels.ts` map Vietnamese enum values to display labels

2. **Error Handling**:
   - Use `handleError(error)` in API routes
   - Zod errors automatically extract first issue message
   - All errors logged to console for debugging

3. **Imports**:
   - Use path alias `@/` (e.g., `import { ok } from "@/lib/api-helpers"`)
   - Next.js imports: `import type { NextConfig }` for types

4. **Database**:
   - Always import Prisma singleton: `import { prisma } from "@/lib/prisma"`
   - Use `onDelete: Cascade` for foreign keys that should cascade-delete
   - Run migrations before seed

## 🚀 Build Artifacts

- **Web**: `.next/standalone` folder (Next.js standalone build)
- **EXE**: `release/QuanLyCuaHangSach-1.0.0.exe` (Electron portable)
  - Single-file executable, no installation required
  - Bundles Next.js standalone + SQLite database seed
  - Configured in `package.json` under `"build"` key

## ⚠️ Common Pitfalls

1. **Database Lock (Windows SQLite)**:
   - If `npx prisma migrate dev` fails with "Schema engine error", manually create SQLite file first:
     ```powershell
     New-Item -ItemType File -Force prisma/dev.db
     npx prisma migrate dev
     ```

2. **Electron Build**:
   - Must run `npm run build:standalone` before `npm run build:exe`
   - EXE is portable—no installation, runs directly
   - Electron entry point is `electron/main.cjs` (CommonJS)

3. **Vietnamese Text**:
   - All user-facing strings, enum labels, and error messages in Vietnamese
   - Keep consistency across UI and database

4. **Type Safety**:
   - `tsconfig.json` has strict mode enabled—no implicit any
   - Use `import type { ... }` for type-only imports to avoid runtime bloat

## 🔗 Key Files to Know

| File | Purpose |
|------|---------|
| `src/lib/prisma.ts` | Prisma client (singleton to avoid multiple instances) |
| `src/lib/api-helpers.ts` | Response utilities (ok/fail/handleError) |
| `src/lib/validators.ts` | Zod schemas for request validation |
| `src/lib/labels.ts` | Vietnamese enum-to-label mappings |
| `prisma/schema.prisma` | Database schema (single source of truth) |
| `prisma/seed.ts` | Initial data loader |
| `electron/main.cjs` | Desktop app entry (configures window, menu) |

## 💡 Quick Commands for Agents

```bash
# Development loop
npm run dev                      # Start dev server

# After schema changes
npx prisma migrate dev           # Create & apply migration
npx prisma db seed              # Reload seed data

# Before EXE build
npm run lint                     # Check for errors
npm run build:exe               # Full build → release/QuanLyCuaHangSach-*.exe

# Debugging
npx prisma studio              # Prisma data browser
cat .env                         # Check DATABASE_URL
```

## 📖 Further Reading

See [README.md](README.md) for user-facing setup instructions and feature list.
