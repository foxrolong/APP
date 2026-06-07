import { fail, handleError, makeCode, ok } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { saleSchema } from "@/lib/validators";

export async function GET() {
  try {
    const sales = await prisma.hoaDon.findMany({
      include: {
        nhanVien: true,
        chiTiet: {
          include: { sach: true },
        },
      },
      orderBy: { ngayLap: "desc" },
    });

    return ok({ sales });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const data = saleSchema.parse(await request.json());
    const bookIds = data.items.map((item) => item.sachId);
    const books = await prisma.sach.findMany({ where: { id: { in: bookIds } } });
    const bookMap = new Map(books.map((book) => [book.id, book]));

    for (const item of data.items) {
      const book = bookMap.get(item.sachId);
      if (!book) {
        return fail("Không tìm thấy sách này, vui lòng kiểm tra lại mã sách nhé!");
      }

      if (item.soLuongBan > book.soLuongTon) {
        return fail("Số lượng bán không được vượt quá tồn kho.");
      }
    }

    const tongTien = data.items.reduce((sum, item) => sum + item.soLuongBan * item.donGiaBan, 0);
    const tongChietKhau = data.items.reduce((sum, item) => sum + item.chietKhau, 0);
    const thanhTien = tongTien - tongChietKhau;

    const invoice = await prisma.$transaction(async (tx) => {
      const created = await tx.hoaDon.create({
        data: {
          maHD: makeCode("HD"),
          nhanVienId: data.nhanVienId,
          tongTien,
          tongChietKhau,
          thanhTien,
          hinhThucThanhToan: data.hinhThucThanhToan,
          trangThai: "HOAN_THANH",
          chiTiet: {
            create: data.items.map((item) => ({
              sachId: item.sachId,
              soLuongBan: item.soLuongBan,
              donGiaBan: item.donGiaBan,
              chietKhau: item.chietKhau,
              thanhTien: item.soLuongBan * item.donGiaBan - item.chietKhau,
            })),
          },
        },
        include: {
          nhanVien: true,
          chiTiet: { include: { sach: true } },
        },
      });

      for (const item of data.items) {
        await tx.sach.update({
          where: { id: item.sachId },
          data: { soLuongTon: { decrement: item.soLuongBan } },
        });
      }

      return created;
    });

    return ok({ invoice, message: "Thanh toán thành công!" });
  } catch (error) {
    return handleError(error);
  }
}
