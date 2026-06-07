import { dayRange, handleError, ok } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { start, end } = dayRange();
    const [books, todayInvoices] = await Promise.all([
      prisma.sach.findMany({ orderBy: { tenSach: "asc" } }),
      prisma.hoaDon.findMany({
        where: {
          ngayLap: { gte: start, lte: end },
          trangThai: "HOAN_THANH",
        },
      }),
    ]);

    const lowStock = books
      .filter((book) => book.soLuongTon <= book.mucTonToiThieu)
      .sort((a, b) => a.soLuongTon - b.soLuongTon)
      .slice(0, 6);

    return ok({
      totalBooks: books.length,
      totalStock: books.reduce((sum, book) => sum + book.soLuongTon, 0),
      todayRevenue: todayInvoices.reduce((sum, invoice) => sum + invoice.thanhTien, 0),
      todayInvoices: todayInvoices.length,
      lowStockCount: books.filter((book) => book.soLuongTon <= book.mucTonToiThieu).length,
      lowStock,
    });
  } catch (error) {
    return handleError(error);
  }
}
