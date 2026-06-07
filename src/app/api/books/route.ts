import { fail, handleError, ok } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { bookSchema } from "@/lib/validators";

export async function GET() {
  try {
    const books = await prisma.sach.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return ok({ books });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const data = bookSchema.parse(await request.json());
    const book = await prisma.sach.create({ data });
    return ok({ book, message: "Đã thêm sách mới." });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const data = bookSchema.required({ id: true }).parse(await request.json());
    const { id, ...updateData } = data;
    const book = await prisma.sach.update({
      where: { id },
      data: updateData,
    });
    return ok({ book, message: "Đã lưu thông tin sách." });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = (await request.json()) as { id?: number };
    if (!id) return fail("Không tìm thấy sách cần xóa.");

    const used = await prisma.chiTietHoaDon.count({ where: { sachId: id } });
    if (used > 0) {
      return fail("Sách này đã có trong hóa đơn, bạn nên sửa số lượng tồn thay vì xóa.");
    }

    await prisma.sach.delete({ where: { id } });
    return ok({ message: "Đã xóa sách." });
  } catch (error) {
    return handleError(error);
  }
}
