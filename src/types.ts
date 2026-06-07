export type Role = "QUAN_LY" | "THU_KHO" | "BAN_HANG";

export type User = {
  id: number;
  maNV: string;
  hoTen: string;
  chucVu: string;
  taiKhoan: string;
  vaiTro: Role;
  trangThai: string;
};

export type Book = {
  id: number;
  maSach: string;
  tenSach: string;
  tacGia: string;
  theLoai: string;
  nhaXuatBan: string;
  namXuatBan: number;
  giaBia: number;
  soTrang: number;
  soLuongTon: number;
  viTriKe: string;
  mucTonToiThieu: number;
  createdAt: string;
  updatedAt: string;
};

export type Supplier = {
  id: number;
  maNCC: string;
  tenNCC: string;
  diaChi: string;
  soDienThoai: string;
  email: string;
};

export type Employee = User & {
  matKhau: string;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseLine = {
  id: number;
  phieuNhapId: number;
  sachId: number;
  soLuongNhap: number;
  donGiaNhap: number;
  thanhTien: number;
  sach: Book;
};

export type Purchase = {
  id: number;
  maPN: string;
  ngayNhap: string;
  nhaCungCapId: number;
  nhanVienId: number;
  tongTienNhap: number;
  nhaCungCap: Supplier;
  nhanVien: Employee;
  chiTiet: PurchaseLine[];
};

export type SaleLine = {
  id: number;
  hoaDonId: number;
  sachId: number;
  soLuongBan: number;
  donGiaBan: number;
  chietKhau: number;
  thanhTien: number;
  sach: Book;
};

export type Sale = {
  id: number;
  maHD: string;
  ngayLap: string;
  nhanVienId: number;
  tongTien: number;
  tongChietKhau: number;
  thanhTien: number;
  hinhThucThanhToan: "TIEN_MAT" | "CHUYEN_KHOAN";
  trangThai: string;
  nhanVien: Employee;
  chiTiet: SaleLine[];
};

export type ReturnTicket = {
  id: number;
  maDoiTra: string;
  hoaDonId: number;
  sachId: number;
  tenKhachHang: string;
  soDienThoai: string;
  lyDo: string;
  hinhThucXuLy: "DOI_SACH_MOI" | "HOAN_TIEN";
  trangThai: "DA_TIEP_NHAN" | "DA_XU_LY";
  congLaiTonKho: boolean;
  ngayTao: string;
  hoaDon: Sale;
  sach: Book;
};

export type DashboardData = {
  totalBooks: number;
  totalStock: number;
  todayRevenue: number;
  todayInvoices: number;
  lowStockCount: number;
  lowStock: Book[];
};

export type ReportData = {
  summary: {
    totalInvoices: number;
    totalItems: number;
    grossRevenue: number;
    discount: number;
    netRevenue: number;
  };
  topBooks: Array<{
    maSach: string;
    tenSach: string;
    soLuong: number;
    doanhThu: number;
  }>;
  lowStock: Book[];
  slowBooks: Array<{
    id: number;
    maSach: string;
    tenSach: string;
    soLuongTon: number;
    viTriKe: string;
  }>;
  sales: Sale[];
};
