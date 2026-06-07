import { handleError, ok, parseDateRange } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { start, end } = parseDateRange(searchParams);

    const [sales, lowStock, allBooks] = await Promise.all([
      prisma.hoaDon.findMany({
        where: {
          ngayLap: { gte: start, lte: end },
          trangThai: "HOAN_THANH",
        },
        include: {
          chiTiet: {
            include: { sach: true },
          },
        },
        orderBy: { ngayLap: "desc" },
      }),
      prisma.sach.findMany({
        orderBy: { soLuongTon: "asc" },
      }),
      prisma.sach.findMany({
        include: {
          chiTietHoaDons: {
            include: { hoaDon: true },
          },
        },
      }),
    ]);

    const totalInvoices = sales.length;
    const totalItems = sales.reduce(
      (sum, sale) => sum + sale.chiTiet.reduce((lineSum, line) => lineSum + line.soLuongBan, 0),
      0,
    );
    const grossRevenue = sales.reduce((sum, sale) => sum + sale.tongTien, 0);
    const discount = sales.reduce((sum, sale) => sum + sale.tongChietKhau, 0);
    const netRevenue = sales.reduce((sum, sale) => sum + sale.thanhTien, 0);

    const topMap = new Map<string, { maSach: string; tenSach: string; soLuong: number; doanhThu: number }>();
    for (const sale of sales) {
      for (const line of sale.chiTiet) {
        const current = topMap.get(line.sach.maSach) ?? {
          maSach: line.sach.maSach,
          tenSach: line.sach.tenSach,
          soLuong: 0,
          doanhThu: 0,
        };
        current.soLuong += line.soLuongBan;
        current.doanhThu += line.thanhTien;
        topMap.set(line.sach.maSach, current);
      }
    }

    const topBooks = Array.from(topMap.values())
      .sort((a, b) => b.soLuong - a.soLuong)
      .slice(0, 8);

    const slowBooks = allBooks
      .filter((book) => {
        const soldInRange = book.chiTietHoaDons.some(
          (line) => line.hoaDon.ngayLap >= start && line.hoaDon.ngayLap <= end,
        );
        return !soldInRange;
      })
      .map((book) => ({
        id: book.id,
        maSach: book.maSach,
        tenSach: book.tenSach,
        soLuongTon: book.soLuongTon,
        viTriKe: book.viTriKe,
      }))
      .slice(0, 10);

    return ok({
      summary: {
        totalInvoices,
        totalItems,
        grossRevenue,
        discount,
        netRevenue,
      },
      topBooks,
      lowStock: lowStock.filter((book) => book.soLuongTon <= book.mucTonToiThieu).slice(0, 10),
      slowBooks,
      sales,
    });
  } catch (error) {
    return handleError(error);
  }
}
