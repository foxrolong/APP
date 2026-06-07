import { fail, handleError, ok } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { supplierSchema } from "@/lib/validators";

export async function GET() {
  try {
    const suppliers = await prisma.nhaCungCap.findMany({
      orderBy: { tenNCC: "asc" },
    });
    return ok({ suppliers });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const data = supplierSchema.parse(await request.json());
    const supplier = await prisma.nhaCungCap.create({ data });
    return ok({ supplier, message: "Đã thêm nhà cung cấp." });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const data = supplierSchema.required({ id: true }).parse(await request.json());
    const { id, ...updateData } = data;
    const supplier = await prisma.nhaCungCap.update({
      where: { id },
      data: updateData,
    });
    return ok({ supplier, message: "Đã lưu nhà cung cấp." });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = (await request.json()) as { id?: number };
    if (!id) return fail("Không tìm thấy nhà cung cấp cần xóa.");

    const used = await prisma.phieuNhap.count({ where: { nhaCungCapId: id } });
    if (used > 0) {
      return fail("Nhà cung cấp này đã có phiếu nhập, không nên xóa để tránh mất lịch sử.");
    }

    await prisma.nhaCungCap.delete({ where: { id } });
    return ok({ message: "Đã xóa nhà cung cấp." });
  } catch (error) {
    return handleError(error);
  }
}
