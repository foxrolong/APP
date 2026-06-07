-- CreateTable
CREATE TABLE "NhanVien" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "maNV" TEXT NOT NULL,
    "hoTen" TEXT NOT NULL,
    "chucVu" TEXT NOT NULL,
    "taiKhoan" TEXT NOT NULL,
    "matKhau" TEXT NOT NULL,
    "vaiTro" TEXT NOT NULL,
    "trangThai" TEXT NOT NULL DEFAULT 'DANG_HOAT_DONG',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Sach" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "maSach" TEXT NOT NULL,
    "tenSach" TEXT NOT NULL,
    "tacGia" TEXT NOT NULL,
    "theLoai" TEXT NOT NULL,
    "nhaXuatBan" TEXT NOT NULL,
    "namXuatBan" INTEGER NOT NULL,
    "giaBia" REAL NOT NULL,
    "soTrang" INTEGER NOT NULL,
    "soLuongTon" INTEGER NOT NULL,
    "viTriKe" TEXT NOT NULL,
    "mucTonToiThieu" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NhaCungCap" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "maNCC" TEXT NOT NULL,
    "tenNCC" TEXT NOT NULL,
    "diaChi" TEXT NOT NULL,
    "soDienThoai" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PhieuNhap" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "maPN" TEXT NOT NULL,
    "ngayNhap" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nhaCungCapId" INTEGER NOT NULL,
    "nhanVienId" INTEGER NOT NULL,
    "tongTienNhap" REAL NOT NULL,
    CONSTRAINT "PhieuNhap_nhaCungCapId_fkey" FOREIGN KEY ("nhaCungCapId") REFERENCES "NhaCungCap" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PhieuNhap_nhanVienId_fkey" FOREIGN KEY ("nhanVienId") REFERENCES "NhanVien" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChiTietPhieuNhap" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "phieuNhapId" INTEGER NOT NULL,
    "sachId" INTEGER NOT NULL,
    "soLuongNhap" INTEGER NOT NULL,
    "donGiaNhap" REAL NOT NULL,
    "thanhTien" REAL NOT NULL,
    CONSTRAINT "ChiTietPhieuNhap_phieuNhapId_fkey" FOREIGN KEY ("phieuNhapId") REFERENCES "PhieuNhap" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChiTietPhieuNhap_sachId_fkey" FOREIGN KEY ("sachId") REFERENCES "Sach" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HoaDon" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "maHD" TEXT NOT NULL,
    "ngayLap" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nhanVienId" INTEGER NOT NULL,
    "tongTien" REAL NOT NULL,
    "tongChietKhau" REAL NOT NULL,
    "thanhTien" REAL NOT NULL,
    "hinhThucThanhToan" TEXT NOT NULL,
    "trangThai" TEXT NOT NULL DEFAULT 'HOAN_THANH',
    CONSTRAINT "HoaDon_nhanVienId_fkey" FOREIGN KEY ("nhanVienId") REFERENCES "NhanVien" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChiTietHoaDon" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hoaDonId" INTEGER NOT NULL,
    "sachId" INTEGER NOT NULL,
    "soLuongBan" INTEGER NOT NULL,
    "donGiaBan" REAL NOT NULL,
    "chietKhau" REAL NOT NULL DEFAULT 0,
    "thanhTien" REAL NOT NULL,
    CONSTRAINT "ChiTietHoaDon_hoaDonId_fkey" FOREIGN KEY ("hoaDonId") REFERENCES "HoaDon" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChiTietHoaDon_sachId_fkey" FOREIGN KEY ("sachId") REFERENCES "Sach" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DoiTra" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "maDoiTra" TEXT NOT NULL,
    "hoaDonId" INTEGER NOT NULL,
    "sachId" INTEGER NOT NULL,
    "tenKhachHang" TEXT NOT NULL,
    "soDienThoai" TEXT NOT NULL,
    "lyDo" TEXT NOT NULL,
    "hinhThucXuLy" TEXT NOT NULL,
    "trangThai" TEXT NOT NULL,
    "congLaiTonKho" BOOLEAN NOT NULL DEFAULT false,
    "ngayTao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DoiTra_hoaDonId_fkey" FOREIGN KEY ("hoaDonId") REFERENCES "HoaDon" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DoiTra_sachId_fkey" FOREIGN KEY ("sachId") REFERENCES "Sach" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BaoCao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "loaiBaoCao" TEXT NOT NULL,
    "tuNgay" DATETIME NOT NULL,
    "denNgay" DATETIME NOT NULL,
    "ngayLap" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nhanVienLapId" INTEGER NOT NULL,
    CONSTRAINT "BaoCao_nhanVienLapId_fkey" FOREIGN KEY ("nhanVienLapId") REFERENCES "NhanVien" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "NhanVien_maNV_key" ON "NhanVien"("maNV");

-- CreateIndex
CREATE UNIQUE INDEX "NhanVien_taiKhoan_key" ON "NhanVien"("taiKhoan");

-- CreateIndex
CREATE UNIQUE INDEX "Sach_maSach_key" ON "Sach"("maSach");

-- CreateIndex
CREATE UNIQUE INDEX "NhaCungCap_maNCC_key" ON "NhaCungCap"("maNCC");

-- CreateIndex
CREATE UNIQUE INDEX "PhieuNhap_maPN_key" ON "PhieuNhap"("maPN");

-- CreateIndex
CREATE UNIQUE INDEX "HoaDon_maHD_key" ON "HoaDon"("maHD");

-- CreateIndex
CREATE UNIQUE INDEX "DoiTra_maDoiTra_key" ON "DoiTra"("maDoiTra");
