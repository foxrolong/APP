import { loginSchema } from "@/lib/validators";
import { fail, handleError, ok } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());
    const employee = await prisma.nhanVien.findFirst({
      where: {
        taiKhoan: body.taiKhoan,
        matKhau: body.matKhau,
      },
      select: {
        id: true,
        maNV: true,
        hoTen: true,
        chucVu: true,
        taiKhoan: true,
        vaiTro: true,
        trangThai: true,
      },
    });

    if (!employee) {
      return fail("Tài khoản hoặc mật khẩu chưa đúng, vui lòng kiểm tra lại.");
    }

    if (employee.trangThai === "BI_KHOA") {
      return fail("Tài khoản này đang bị khóa, vui lòng liên hệ quản lý.");
    }

    return ok({ user: employee });
  } catch (error) {
    return handleError(error);
  }
}
