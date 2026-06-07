import { fail, handleError, ok } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { employeeSchema } from "@/lib/validators";

export async function GET() {
  try {
    const employees = await prisma.nhanVien.findMany({
      orderBy: { maNV: "asc" },
    });
    return ok({ employees });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const data = employeeSchema.parse(await request.json());
    const employee = await prisma.nhanVien.create({ data });
    return ok({ employee, message: "Đã thêm nhân viên." });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const data = employeeSchema.required({ id: true }).parse(await request.json());
    const { id, ...updateData } = data;
    const employee = await prisma.nhanVien.update({
      where: { id },
      data: updateData,
    });
    return ok({ employee, message: "Đã lưu nhân viên." });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = (await request.json()) as { id?: number };
    if (!id) return fail("Không tìm thấy nhân viên cần khóa.");

    const employee = await prisma.nhanVien.update({
      where: { id },
      data: { trangThai: "BI_KHOA" },
    });

    return ok({ employee, message: "Đã khóa tài khoản nhân viên." });
  } catch (error) {
    return handleError(error);
  }
}
