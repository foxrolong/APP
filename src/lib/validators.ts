import { z } from "zod";

const positiveMoney = z.coerce.number().positive("Giá bán phải lớn hơn 0.");
const nonNegativeMoney = z.coerce.number().min(0, "Số tiền không được âm.");
const nonNegativeInt = z.coerce.number().int().min(0, "Số lượng không được âm.");
const positiveInt = z.coerce.number().int().positive("Số lượng phải lớn hơn 0.");

export const loginSchema = z.object({
  taiKhoan: z.string().trim().min(1, "Vui lòng nhập tài khoản."),
  matKhau: z.string().trim().min(1, "Vui lòng nhập mật khẩu."),
});

export const bookSchema = z.object({
  id: z.number().int().optional(),
  maSach: z.string().trim().min(1, "Vui lòng nhập mã sách."),
  tenSach: z.string().trim().min(1, "Vui lòng nhập tên sách."),
  tacGia: z.string().trim().min(1, "Vui lòng nhập tác giả."),
  theLoai: z.string().trim().min(1, "Vui lòng chọn thể loại."),
  nhaXuatBan: z.string().trim().min(1, "Vui lòng nhập nhà xuất bản."),
  namXuatBan: z.coerce.number().int().min(1900, "Năm xuất bản chưa hợp lệ."),
  giaBia: positiveMoney,
  soTrang: z.coerce.number().int().positive("Số trang phải lớn hơn 0."),
  soLuongTon: nonNegativeInt,
  viTriKe: z.string().trim().min(1, "Vui lòng nhập vị trí kệ."),
  mucTonToiThieu: nonNegativeInt,
});

export const supplierSchema = z.object({
  id: z.number().int().optional(),
  maNCC: z.string().trim().min(1, "Vui lòng nhập mã nhà cung cấp."),
  tenNCC: z.string().trim().min(1, "Bạn chưa chọn nhà cung cấp."),
  diaChi: z.string().trim().min(1, "Vui lòng nhập địa chỉ."),
  soDienThoai: z.string().trim().min(1, "Vui lòng nhập số điện thoại."),
  email: z.string().trim().email("Email chưa đúng định dạng."),
});

export const employeeSchema = z.object({
  id: z.number().int().optional(),
  maNV: z.string().trim().min(1, "Vui lòng nhập mã nhân viên."),
  hoTen: z.string().trim().min(1, "Vui lòng nhập họ tên."),
  chucVu: z.string().trim().min(1, "Vui lòng nhập chức vụ."),
  taiKhoan: z.string().trim().min(1, "Vui lòng nhập tài khoản."),
  matKhau: z.string().trim().min(1, "Vui lòng nhập mật khẩu."),
  vaiTro: z.enum(["QUAN_LY", "THU_KHO", "BAN_HANG"]),
  trangThai: z.enum(["DANG_HOAT_DONG", "BI_KHOA"]),
});

export const purchaseSchema = z.object({
  nhaCungCapId: z.coerce.number().int().positive("Bạn chưa chọn nhà cung cấp."),
  nhanVienId: z.coerce.number().int().positive("Bạn chưa chọn nhân viên lập phiếu."),
  items: z
    .array(
      z.object({
        sachId: z.coerce.number().int().positive("Vui lòng chọn sách."),
        soLuongNhap: positiveInt,
        donGiaNhap: positiveMoney,
      }),
    )
    .min(1, "Phiếu nhập cần có ít nhất một dòng sách."),
});

export const saleSchema = z.object({
  nhanVienId: z.coerce.number().int().positive("Bạn chưa chọn nhân viên bán hàng."),
  hinhThucThanhToan: z.enum(["TIEN_MAT", "CHUYEN_KHOAN"]),
  items: z
    .array(
      z.object({
        sachId: z.coerce.number().int().positive("Vui lòng chọn sách."),
        soLuongBan: positiveInt,
        donGiaBan: positiveMoney,
        chietKhau: nonNegativeMoney,
      }),
    )
    .min(1, "Giỏ hàng đang trống."),
});

export const returnSchema = z.object({
  hoaDonId: z.coerce.number().int().positive("Hóa đơn này không tồn tại, vui lòng kiểm tra lại mã hóa đơn."),
  sachId: z.coerce.number().int().positive("Vui lòng chọn sách cần đổi/trả."),
  tenKhachHang: z.string().trim().min(1, "Vui lòng nhập tên khách hàng."),
  soDienThoai: z.string().trim().min(1, "Vui lòng nhập số điện thoại."),
  lyDo: z.string().trim().min(1, "Vui lòng nhập lý do đổi/trả."),
  hinhThucXuLy: z.enum(["DOI_SACH_MOI", "HOAN_TIEN"]),
  trangThai: z.enum(["DA_TIEP_NHAN", "DA_XU_LY"]),
  congLaiTonKho: z.boolean().default(false),
});
