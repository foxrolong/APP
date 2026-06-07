import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const VaiTro = {
  QUAN_LY: "QUAN_LY",
  THU_KHO: "THU_KHO",
  BAN_HANG: "BAN_HANG",
} as const;

const TrangThaiNhanVien = {
  DANG_HOAT_DONG: "DANG_HOAT_DONG",
} as const;

const HinhThucThanhToan = {
  TIEN_MAT: "TIEN_MAT",
  CHUYEN_KHOAN: "CHUYEN_KHOAN",
} as const;

const TrangThaiHoaDon = {
  HOAN_THANH: "HOAN_THANH",
} as const;

const HinhThucXuLy = {
  HOAN_TIEN: "HOAN_TIEN",
} as const;

const TrangThaiDoiTra = {
  DA_TIEP_NHAN: "DA_TIEP_NHAN",
} as const;

const today = new Date();
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

async function resetData() {
  await prisma.baoCao.deleteMany();
  await prisma.doiTra.deleteMany();
  await prisma.chiTietHoaDon.deleteMany();
  await prisma.hoaDon.deleteMany();
  await prisma.chiTietPhieuNhap.deleteMany();
  await prisma.phieuNhap.deleteMany();
  await prisma.nhaCungCap.deleteMany();
  await prisma.sach.deleteMany();
  await prisma.nhanVien.deleteMany();
}

async function main() {
  await resetData();

  const [admin, thukho, banhang] = await Promise.all([
    prisma.nhanVien.create({
      data: {
        maNV: "NV001",
        hoTen: "Nguyen Minh Quan",
        chucVu: "Quan ly cua hang",
        taiKhoan: "admin",
        matKhau: "123456",
        vaiTro: VaiTro.QUAN_LY,
        trangThai: TrangThaiNhanVien.DANG_HOAT_DONG,
      },
    }),
    prisma.nhanVien.create({
      data: {
        maNV: "NV002",
        hoTen: "Tran Thi Thu Kho",
        chucVu: "Thu kho",
        taiKhoan: "thukho",
        matKhau: "123456",
        vaiTro: VaiTro.THU_KHO,
        trangThai: TrangThaiNhanVien.DANG_HOAT_DONG,
      },
    }),
    prisma.nhanVien.create({
      data: {
        maNV: "NV003",
        hoTen: "Le Van Ban Hang",
        chucVu: "Nhan vien ban hang",
        taiKhoan: "banhang",
        matKhau: "123456",
        vaiTro: VaiTro.BAN_HANG,
        trangThai: TrangThaiNhanVien.DANG_HOAT_DONG,
      },
    }),
  ]);

  const suppliers = await prisma.nhaCungCap.createManyAndReturn({
    data: [
      {
        maNCC: "NCC001",
        tenNCC: "Nha sach Tri Thuc",
        diaChi: "12 Nguyen Hue, Quan 1, TP.HCM",
        soDienThoai: "0901000001",
        email: "trithuc@example.com",
      },
      {
        maNCC: "NCC002",
        tenNCC: "Cong ty Sach Tre",
        diaChi: "45 Le Loi, Quan 3, TP.HCM",
        soDienThoai: "0901000002",
        email: "sachtre@example.com",
      },
      {
        maNCC: "NCC003",
        tenNCC: "Kho Sach Mien Nam",
        diaChi: "88 Cach Mang Thang 8, TP.HCM",
        soDienThoai: "0901000003",
        email: "khosachmn@example.com",
      },
    ],
  });

  const books = await prisma.sach.createManyAndReturn({
    data: [
      {
        maSach: "8934974180011",
        tenSach: "Tuoi Tre Dang Gia Bao Nhieu",
        tacGia: "Rosie Nguyen",
        theLoai: "Ky nang song",
        nhaXuatBan: "NXB Tre",
        namXuatBan: 2022,
        giaBia: 98000,
        soTrang: 292,
        soLuongTon: 34,
        viTriKe: "A1-01",
        mucTonToiThieu: 8,
      },
      {
        maSach: "8934974180028",
        tenSach: "Nha Gia Kim",
        tacGia: "Paulo Coelho",
        theLoai: "Tieu thuyet",
        nhaXuatBan: "NXB Hoi Nha Van",
        namXuatBan: 2021,
        giaBia: 79000,
        soTrang: 228,
        soLuongTon: 22,
        viTriKe: "A1-02",
        mucTonToiThieu: 6,
      },
      {
        maSach: "8934974180035",
        tenSach: "Dac Nhan Tam",
        tacGia: "Dale Carnegie",
        theLoai: "Ky nang song",
        nhaXuatBan: "NXB Tong Hop",
        namXuatBan: 2023,
        giaBia: 86000,
        soTrang: 320,
        soLuongTon: 18,
        viTriKe: "A2-01",
        mucTonToiThieu: 10,
      },
      {
        maSach: "8934974180042",
        tenSach: "Muon Kiep Nhan Sinh",
        tacGia: "Nguyen Phong",
        theLoai: "Van hoa",
        nhaXuatBan: "NXB Tong Hop",
        namXuatBan: 2020,
        giaBia: 168000,
        soTrang: 408,
        soLuongTon: 12,
        viTriKe: "A2-02",
        mucTonToiThieu: 5,
      },
      {
        maSach: "8934974180059",
        tenSach: "Toi Tai Gioi Ban Cung The",
        tacGia: "Adam Khoo",
        theLoai: "Giao duc",
        nhaXuatBan: "NXB Phu Nu",
        namXuatBan: 2019,
        giaBia: 125000,
        soTrang: 360,
        soLuongTon: 5,
        viTriKe: "B1-01",
        mucTonToiThieu: 8,
      },
      {
        maSach: "8934974180066",
        tenSach: "Chien Binh Cau Vong",
        tacGia: "Andrea Hirata",
        theLoai: "Tieu thuyet",
        nhaXuatBan: "NXB Van Hoc",
        namXuatBan: 2022,
        giaBia: 109000,
        soTrang: 428,
        soLuongTon: 27,
        viTriKe: "B1-02",
        mucTonToiThieu: 7,
      },
      {
        maSach: "8934974180073",
        tenSach: "Luat Tam Thuc",
        tacGia: "Ngo Sa Thach",
        theLoai: "Khoa hoc",
        nhaXuatBan: "NXB Dan Tri",
        namXuatBan: 2024,
        giaBia: 99000,
        soTrang: 248,
        soLuongTon: 9,
        viTriKe: "B2-01",
        mucTonToiThieu: 6,
      },
      {
        maSach: "8934974180080",
        tenSach: "Lap Trinh Python Co Ban",
        tacGia: "Pham Van Hai",
        theLoai: "Cong nghe",
        nhaXuatBan: "NXB Bach Khoa",
        namXuatBan: 2023,
        giaBia: 145000,
        soTrang: 356,
        soLuongTon: 16,
        viTriKe: "C1-01",
        mucTonToiThieu: 5,
      },
      {
        maSach: "8934974180097",
        tenSach: "Tu Hoc SQL Trong 10 Ngay",
        tacGia: "Nguyen Anh Tuan",
        theLoai: "Cong nghe",
        nhaXuatBan: "NXB Bach Khoa",
        namXuatBan: 2021,
        giaBia: 118000,
        soTrang: 284,
        soLuongTon: 7,
        viTriKe: "C1-02",
        mucTonToiThieu: 6,
      },
      {
        maSach: "8934974180103",
        tenSach: "Lich Su Viet Nam Bang Tranh",
        tacGia: "Nhieu tac gia",
        theLoai: "Thieu nhi",
        nhaXuatBan: "NXB Kim Dong",
        namXuatBan: 2024,
        giaBia: 69000,
        soTrang: 120,
        soLuongTon: 40,
        viTriKe: "D1-01",
        mucTonToiThieu: 12,
      },
    ],
  });

  const bookByCode = new Map(books.map((book) => [book.maSach, book]));

  await prisma.phieuNhap.create({
    data: {
      maPN: "PN001",
      ngayNhap: lastWeek,
      nhaCungCapId: suppliers[0].id,
      nhanVienId: thukho.id,
      tongTienNhap: 3480000,
      chiTiet: {
        create: [
          {
            sachId: bookByCode.get("8934974180011")!.id,
            soLuongNhap: 20,
            donGiaNhap: 60000,
            thanhTien: 1200000,
          },
          {
            sachId: bookByCode.get("8934974180042")!.id,
            soLuongNhap: 12,
            donGiaNhap: 110000,
            thanhTien: 1320000,
          },
          {
            sachId: bookByCode.get("8934974180080")!.id,
            soLuongNhap: 8,
            donGiaNhap: 120000,
            thanhTien: 960000,
          },
        ],
      },
    },
  });

  await prisma.phieuNhap.create({
    data: {
      maPN: "PN002",
      ngayNhap: yesterday,
      nhaCungCapId: suppliers[1].id,
      nhanVienId: thukho.id,
      tongTienNhap: 2260000,
      chiTiet: {
        create: [
          {
            sachId: bookByCode.get("8934974180028")!.id,
            soLuongNhap: 15,
            donGiaNhap: 52000,
            thanhTien: 780000,
          },
          {
            sachId: bookByCode.get("8934974180066")!.id,
            soLuongNhap: 16,
            donGiaNhap: 70000,
            thanhTien: 1120000,
          },
          {
            sachId: bookByCode.get("8934974180103")!.id,
            soLuongNhap: 8,
            donGiaNhap: 45000,
            thanhTien: 360000,
          },
        ],
      },
    },
  });

  await prisma.hoaDon.create({
    data: {
      maHD: "HD001",
      ngayLap: today,
      nhanVienId: banhang.id,
      tongTien: 323000,
      tongChietKhau: 10000,
      thanhTien: 313000,
      hinhThucThanhToan: HinhThucThanhToan.TIEN_MAT,
      trangThai: TrangThaiHoaDon.HOAN_THANH,
      chiTiet: {
        create: [
          {
            sachId: bookByCode.get("8934974180011")!.id,
            soLuongBan: 2,
            donGiaBan: 98000,
            chietKhau: 10000,
            thanhTien: 186000,
          },
          {
            sachId: bookByCode.get("8934974180028")!.id,
            soLuongBan: 1,
            donGiaBan: 79000,
            chietKhau: 0,
            thanhTien: 79000,
          },
          {
            sachId: bookByCode.get("8934974180103")!.id,
            soLuongBan: 1,
            donGiaBan: 69000,
            chietKhau: 0,
            thanhTien: 69000,
          },
        ],
      },
    },
  });

  const invoice2 = await prisma.hoaDon.create({
    data: {
      maHD: "HD002",
      ngayLap: yesterday,
      nhanVienId: banhang.id,
      tongTien: 270000,
      tongChietKhau: 15000,
      thanhTien: 255000,
      hinhThucThanhToan: HinhThucThanhToan.CHUYEN_KHOAN,
      trangThai: TrangThaiHoaDon.HOAN_THANH,
      chiTiet: {
        create: [
          {
            sachId: bookByCode.get("8934974180080")!.id,
            soLuongBan: 1,
            donGiaBan: 145000,
            chietKhau: 5000,
            thanhTien: 140000,
          },
          {
            sachId: bookByCode.get("8934974180059")!.id,
            soLuongBan: 1,
            donGiaBan: 125000,
            chietKhau: 10000,
            thanhTien: 115000,
          },
        ],
      },
    },
  });

  await Promise.all([
    prisma.sach.update({
      where: { maSach: "8934974180011" },
      data: { soLuongTon: { decrement: 2 } },
    }),
    prisma.sach.update({
      where: { maSach: "8934974180028" },
      data: { soLuongTon: { decrement: 1 } },
    }),
    prisma.sach.update({
      where: { maSach: "8934974180103" },
      data: { soLuongTon: { decrement: 1 } },
    }),
    prisma.sach.update({
      where: { maSach: "8934974180080" },
      data: { soLuongTon: { decrement: 1 } },
    }),
    prisma.sach.update({
      where: { maSach: "8934974180059" },
      data: { soLuongTon: { decrement: 1 } },
    }),
  ]);

  await prisma.doiTra.create({
    data: {
      maDoiTra: "DT001",
      hoaDonId: invoice2.id,
      sachId: bookByCode.get("8934974180059")!.id,
      tenKhachHang: "Nguyen Thi Mai",
      soDienThoai: "0912345678",
      lyDo: "Khach mua trung sach da co",
      hinhThucXuLy: HinhThucXuLy.HOAN_TIEN,
      trangThai: TrangThaiDoiTra.DA_TIEP_NHAN,
      congLaiTonKho: false,
    },
  });

  await prisma.baoCao.create({
    data: {
      loaiBaoCao: "Doanh thu ngay",
      tuNgay: today,
      denNgay: today,
      nhanVienLapId: admin.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
