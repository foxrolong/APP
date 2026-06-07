import { makeCode, handleError, ok } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { purchaseSchema } from "@/lib/validators";

export async function GET() {
  try {
    const purchases = await prisma.phieuNhap.findMany({
      include: {
        nhaCungCap: true,
        nhanVien: true,
        chiTiet: {
          include: { sach: true },
        },
      },
      orderBy: { ngayNhap: "desc" },
    });

    return ok({ purchases });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const data = purchaseSchema.parse(await request.json());
    const bookIds = data.items.map((item) => item.sachId);
    const books = await prisma.sach.findMany({ where: { id: { in: bookIds } } });
    const bookMap = new Map(books.map((book) => [book.id, book]));

    const tongTienNhap = data.items.reduce(
      (sum, item) => sum + item.soLuongNhap * item.donGiaNhap,
      0,
    );

    const purchase = await prisma.$transaction(async (tx) => {
      const created = await tx.phieuNhap.create({
        data: {
          maPN: makeCode("PN"),
          nhaCungCapId: data.nhaCungCapId,
          nhanVienId: data.nhanVienId,
          tongTienNhap,
          chiTiet: {
            create: data.items.map((item) => {
              if (!bookMap.has(item.sachId)) {
                throw new Error("Không tìm thấy sách này, vui lòng kiểm tra lại mã sách nhé!");
              }

              return {
                sachId: item.sachId,
                soLuongNhap: item.soLuongNhap,
                donGiaNhap: item.donGiaNhap,
                thanhTien: item.soLuongNhap * item.donGiaNhap,
              };
            }),
          },
        },
        include: {
          nhaCungCap: true,
          nhanVien: true,
          chiTiet: { include: { sach: true } },
        },
      });

      for (const item of data.items) {
        await tx.sach.update({
          where: { id: item.sachId },
          data: { soLuongTon: { increment: item.soLuongNhap } },
        });
      }

      return created;
    });

    return ok({ purchase, message: "Đã lưu phiếu nhập và cộng tồn kho." });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Không tìm thấy sách")) {
      return Response.json({ message: error.message }, { status: 400 });
    }

    return handleError(error);
  }
}
