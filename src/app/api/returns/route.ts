import { fail, handleError, makeCode, ok } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { returnSchema } from "@/lib/validators";

export async function GET() {
  try {
    const returns = await prisma.doiTra.findMany({
      include: {
        hoaDon: true,
        sach: true,
      },
      orderBy: { ngayTao: "desc" },
    });

    return ok({ returns });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const data = returnSchema.parse(await request.json());
    const invoiceItem = await prisma.chiTietHoaDon.findFirst({
      where: {
        hoaDonId: data.hoaDonId,
        sachId: data.sachId,
      },
    });

    if (!invoiceItem) {
      return fail("Sách này không có trong hóa đơn gốc, vui lòng kiểm tra lại.");
    }

    const returnTicket = await prisma.$transaction(async (tx) => {
      const created = await tx.doiTra.create({
        data: {
          maDoiTra: makeCode("DT"),
          hoaDonId: data.hoaDonId,
          sachId: data.sachId,
          tenKhachHang: data.tenKhachHang,
          soDienThoai: data.soDienThoai,
          lyDo: data.lyDo,
          hinhThucXuLy: data.hinhThucXuLy,
          trangThai: data.trangThai,
          congLaiTonKho: data.congLaiTonKho,
        },
        include: {
          hoaDon: true,
          sach: true,
        },
      });

      if (data.congLaiTonKho) {
        await tx.sach.update({
          where: { id: data.sachId },
          data: { soLuongTon: { increment: 1 } },
        });
      }

      return created;
    });

    return ok({ returnTicket, message: "Đã lưu phiếu đổi/trả." });
  } catch (error) {
    return handleError(error);
  }
}
