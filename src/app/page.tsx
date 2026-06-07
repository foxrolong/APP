"use client";

import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CreditCard,
  Download,
  Home,
  Lock,
  LogOut,
  PackagePlus,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  Save,
  Search,
  ShoppingCart,
  Trash2,
  Truck,
  Unlock,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge, Button, ConfirmDialog, Field, Input, Modal, Select, Table, TextArea, ToastStack } from "@/components/ui";
import type { ToastMessage } from "@/components/ui";
import { employeeStatusLabels, paymentLabels, returnActionLabels, returnStatusLabels, roleLabels } from "@/lib/labels";
import { formatDate, formatMoney, toDateInputValue } from "@/lib/format";
import type { Book, DashboardData, Employee, Purchase, ReportData, ReturnTicket, Role, Sale, Supplier, User } from "@/types";

type PageKey =
  | "dashboard"
  | "books"
  | "suppliers"
  | "employees"
  | "purchases"
  | "sales"
  | "returns"
  | "reports";

type MenuItem = {
  key: PageKey;
  label: string;
  icon: LucideIcon;
  roles: Role[];
};

type ConfirmState = {
  title: string;
  body: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
};

type BookForm = Omit<Book, "id" | "createdAt" | "updatedAt"> & { id?: number };
type SupplierForm = Omit<Supplier, "id"> & { id?: number };
type EmployeeForm = Omit<Employee, "id" | "createdAt" | "updatedAt"> & { id?: number };
type PurchaseDraftLine = { sachId: string; soLuongNhap: number; donGiaNhap: number };
type CartLine = { book: Book; quantity: number; discount: number };

const menuItems: MenuItem[] = [
  { key: "dashboard", label: "Trang chính", icon: Home, roles: ["QUAN_LY", "THU_KHO", "BAN_HANG"] },
  { key: "books", label: "Quản lý sách", icon: BookOpen, roles: ["QUAN_LY", "THU_KHO", "BAN_HANG"] },
  { key: "suppliers", label: "Nhà cung cấp", icon: Truck, roles: ["QUAN_LY", "THU_KHO"] },
  { key: "employees", label: "Nhân viên", icon: Users, roles: ["QUAN_LY"] },
  { key: "purchases", label: "Nhập kho", icon: PackagePlus, roles: ["QUAN_LY", "THU_KHO"] },
  { key: "sales", label: "Bán hàng", icon: ShoppingCart, roles: ["QUAN_LY", "BAN_HANG"] },
  { key: "returns", label: "Đổi/trả", icon: RotateCcw, roles: ["QUAN_LY", "BAN_HANG"] },
  { key: "reports", label: "Báo cáo", icon: BarChart3, roles: ["QUAN_LY"] },
];

const blankBook = (): BookForm => ({
  maSach: "",
  tenSach: "",
  tacGia: "",
  theLoai: "Kỹ năng sống",
  nhaXuatBan: "NXB Trẻ",
  namXuatBan: new Date().getFullYear(),
  giaBia: 0,
  soTrang: 1,
  soLuongTon: 0,
  viTriKe: "",
  mucTonToiThieu: 5,
});

const blankSupplier = (): SupplierForm => ({
  maNCC: "",
  tenNCC: "",
  diaChi: "",
  soDienThoai: "",
  email: "",
});

const blankEmployee = (): EmployeeForm => ({
  maNV: "",
  hoTen: "",
  chucVu: "",
  taiKhoan: "",
  matKhau: "123456",
  vaiTro: "BAN_HANG",
  trangThai: "DANG_HOAT_DONG",
});

const today = new Date();
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Có lỗi xảy ra, vui lòng thử lại.");
  }

  return data as T;
}

function labelOf<T extends Record<string, string>>(map: T, value: string) {
  return map[value as keyof T] ?? value;
}

function numberInputValue(value: number) {
  return Number.isFinite(value) ? value : 0;
}

export default function BookstoreApp() {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const savedUser = window.localStorage.getItem("bookstore-user");
    return savedUser ? (JSON.parse(savedUser) as User) : null;
  });
  const [activePage, setActivePage] = useState<PageKey>("dashboard");
  const [books, setBooks] = useState<Book[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [returns, setReturns] = useState<ReturnTicket[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [printInvoice, setPrintInvoice] = useState<Sale | null>(null);
  const [reportFrom, setReportFrom] = useState(toDateInputValue(firstDay));
  const [reportTo, setReportTo] = useState(toDateInputValue(today));

  const showToast = useCallback((message: string, type: ToastMessage["type"] = "info") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3600);
  }, []);

  const loadReport = useCallback(async () => {
    const data = await fetchJson<ReportData>(`/api/reports?from=${reportFrom}&to=${reportTo}`);
    setReport(data);
  }, [reportFrom, reportTo]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [bookData, supplierData, employeeData, purchaseData, saleData, returnData, dashboardData, reportData] =
        await Promise.all([
          fetchJson<{ books: Book[] }>("/api/books"),
          fetchJson<{ suppliers: Supplier[] }>("/api/suppliers"),
          fetchJson<{ employees: Employee[] }>("/api/employees"),
          fetchJson<{ purchases: Purchase[] }>("/api/purchases"),
          fetchJson<{ sales: Sale[] }>("/api/sales"),
          fetchJson<{ returns: ReturnTicket[] }>("/api/returns"),
          fetchJson<DashboardData>("/api/dashboard"),
          fetchJson<ReportData>(`/api/reports?from=${reportFrom}&to=${reportTo}`),
        ]);
      setBooks(bookData.books);
      setSuppliers(supplierData.suppliers);
      setEmployees(employeeData.employees);
      setPurchases(purchaseData.purchases);
      setSales(saleData.sales);
      setReturns(returnData.returns);
      setDashboard(dashboardData);
      setReport(reportData);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không tải được dữ liệu.", "error");
    } finally {
      setLoading(false);
    }
  }, [reportFrom, reportTo, showToast]);

  useEffect(() => {
    if (user) {
      const timer = window.setTimeout(() => {
        void loadAll();
      }, 0);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [loadAll, user]);

  useEffect(() => {
    if (printInvoice) {
      const timer = window.setTimeout(() => window.print(), 250);
      return () => window.clearTimeout(timer);
    }
  }, [printInvoice]);

  const visibleMenu = useMemo(
    () => menuItems.filter((item) => (user ? item.roles.includes(user.vaiTro) : false)),
    [user],
  );

  const handleLogin = async (taiKhoan: string, matKhau: string) => {
    const result = await fetchJson<{ user: User }>("/api/login", {
      method: "POST",
      body: JSON.stringify({ taiKhoan, matKhau }),
    });
    window.localStorage.setItem("bookstore-user", JSON.stringify(result.user));
    setUser(result.user);
    setActivePage("dashboard");
    showToast(`Xin chào ${result.user.hoTen}!`, "success");
  };

  const handleLogout = () => {
    window.localStorage.removeItem("bookstore-user");
    setUser(null);
    setActivePage("dashboard");
  };

  if (!user) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} showToast={showToast} />
        <ToastStack toasts={toasts} onClose={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
      </>
    );
  }

  const renderPage = () => {
    if (activePage === "dashboard") {
      return (
        <DashboardPage
          dashboard={dashboard}
          loading={loading}
          user={user}
          onNavigate={(page) => setActivePage(page)}
        />
      );
    }

    if (activePage === "books") {
      return (
        <BooksPage
          books={books}
          canEdit={user.vaiTro !== "BAN_HANG"}
          showToast={showToast}
          reload={loadAll}
          askConfirm={setConfirm}
        />
      );
    }

    if (activePage === "suppliers") {
      return (
        <SuppliersPage
          suppliers={suppliers}
          showToast={showToast}
          reload={loadAll}
          askConfirm={setConfirm}
        />
      );
    }

    if (activePage === "employees") {
      return (
        <EmployeesPage
          employees={employees}
          showToast={showToast}
          reload={loadAll}
          askConfirm={setConfirm}
        />
      );
    }

    if (activePage === "purchases") {
      return (
        <PurchasesPage
          books={books}
          suppliers={suppliers}
          employees={employees}
          purchases={purchases}
          user={user}
          showToast={showToast}
          reload={loadAll}
        />
      );
    }

    if (activePage === "sales") {
      return (
        <SalesPage
          books={books}
          user={user}
          showToast={showToast}
          reload={loadAll}
          askConfirm={setConfirm}
          onPrint={setPrintInvoice}
        />
      );
    }

    if (activePage === "returns") {
      return (
        <ReturnsPage
          sales={sales}
          returns={returns}
          showToast={showToast}
          reload={loadAll}
        />
      );
    }

    return (
      <ReportsPage
        report={report}
        from={reportFrom}
        to={reportTo}
        setFrom={setReportFrom}
        setTo={setReportTo}
        reload={loadReport}
        showToast={showToast}
      />
    );
  };

  return (
    <div className="min-h-screen bg-paper">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-slate-200 bg-white lg:block no-print">
        <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-6">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-primary text-white">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Cửa hàng sách</p>
            <h1 className="text-lg font-bold text-ink">Sổ quản lý</h1>
          </div>
        </div>
        <nav className="grid gap-1 px-3 py-4">
          {visibleMenu.map((item) => {
            const Icon = item.icon;
            const active = activePage === item.key;
            return (
              <button
                key={item.key}
                className={`focus-ring flex h-11 items-center gap-3 rounded-md px-4 text-left text-sm font-semibold transition ${
                  active ? "bg-primary text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
                onClick={() => setActivePage(item.key)}
                type="button"
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur no-print">
          <div className="flex min-h-20 flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-8">
            <div>
              <p className="text-sm font-semibold text-slate-500">Xin chào</p>
              <h2 className="text-xl font-bold text-ink">{user.hoTen}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="blue">{labelOf(roleLabels, user.vaiTro)}</Badge>
              <span className="text-sm text-slate-500">{user.chucVu}</span>
              <Button variant="secondary" icon={LogOut} onClick={handleLogout}>
                Đăng xuất
              </Button>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 lg:hidden">
            {visibleMenu.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  className={`focus-ring flex min-w-max items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
                    activePage === item.key ? "bg-primary text-white" : "bg-slate-100 text-slate-700"
                  }`}
                  onClick={() => setActivePage(item.key)}
                  type="button"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </header>

        <main className="px-4 py-6 lg:px-8">{renderPage()}</main>
      </div>

      <ToastStack toasts={toasts} onClose={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title ?? ""}
        body={confirm?.body ?? ""}
        confirmLabel={confirm?.confirmLabel}
        danger={confirm?.danger}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          const action = confirm?.onConfirm;
          setConfirm(null);
          action?.();
        }}
      />
      <InvoiceModal invoice={printInvoice} onClose={() => setPrintInvoice(null)} />
    </div>
  );
}

function LoginScreen({
  onLogin,
  showToast,
}: {
  onLogin: (taiKhoan: string, matKhau: string) => Promise<void>;
  showToast: (message: string, type?: ToastMessage["type"]) => void;
}) {
  const [taiKhoan, setTaiKhoan] = useState("admin");
  const [matKhau, setMatKhau] = useState("123456");
  const [busy, setBusy] = useState(false);
  const canLogin = taiKhoan.trim().length > 0 && matKhau.trim().length > 0;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canLogin) return;
    setBusy(true);
    try {
      await onLogin(taiKhoan, matKhau);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không đăng nhập được.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-paper p-4">
      <form className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft" onSubmit={submit}>
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-md bg-primary text-white">
            <BookOpen className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Hệ thống quản lý</p>
            <h1 className="text-2xl font-bold text-ink">Cửa hàng sách</h1>
          </div>
        </div>
        <div className="grid gap-4">
          <Field label="Tài khoản">
            <Input value={taiKhoan} onChange={(event) => setTaiKhoan(event.target.value)} placeholder="admin" />
          </Field>
          <Field label="Mật khẩu">
            <Input
              type="password"
              value={matKhau}
              onChange={(event) => setMatKhau(event.target.value)}
              placeholder="123456"
            />
          </Field>
          <Button className="h-12 text-base" disabled={!canLogin} busy={busy} icon={Unlock} type="submit">
            Đăng nhập
          </Button>
        </div>
        <div className="mt-5 rounded-md bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-ink">Tài khoản mẫu</p>
          <p>Quản lý: admin / 123456</p>
          <p>Thủ kho: thukho / 123456</p>
          <p>Bán hàng: banhang / 123456</p>
        </div>
      </form>
    </main>
  );
}

function PageTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

function DashboardPage({
  dashboard,
  loading,
  user,
  onNavigate,
}: {
  dashboard: DashboardData | null;
  loading: boolean;
  user: User;
  onNavigate: (page: PageKey) => void;
}) {
  const stats = [
    { label: "Tổng số sách", value: dashboard?.totalBooks ?? 0, icon: BookOpen },
    { label: "Tổng tồn kho", value: dashboard?.totalStock ?? 0, icon: PackagePlus },
    { label: "Doanh thu hôm nay", value: formatMoney(dashboard?.todayRevenue ?? 0), icon: CreditCard },
    { label: "Hóa đơn hôm nay", value: dashboard?.todayInvoices ?? 0, icon: ShoppingCart },
    { label: "Sách sắp hết", value: dashboard?.lowStockCount ?? 0, icon: AlertTriangle },
  ];

  const quickActions = menuItems.filter((item) => item.roles.includes(user.vaiTro) && item.key !== "dashboard");

  return (
    <section>
      <PageTitle
        title="Trang chính"
        subtitle={loading ? "Đang tải số liệu..." : "Tổng quan nhanh để bắt đầu công việc trong ngày."}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-3 text-2xl font-bold text-ink">{stat.value}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Thao tác nhanh</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => (
              <Button key={action.key} className="h-14 justify-start" icon={action.icon} onClick={() => onNavigate(action.key)}>
                {action.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Cần nhập thêm</h2>
          <div className="mt-4 grid gap-3">
            {(dashboard?.lowStock ?? []).length === 0 ? (
              <p className="text-sm text-slate-500">Tồn kho đang ổn.</p>
            ) : (
              dashboard?.lowStock.map((book) => (
                <div key={book.id} className="flex items-center justify-between gap-3 rounded-md bg-amber-50 p-3">
                  <div>
                    <p className="font-semibold text-ink">{book.tenSach}</p>
                    <p className="text-sm text-slate-500">
                      Còn {book.soLuongTon} cuốn tại kệ {book.viTriKe}
                    </p>
                  </div>
                  <Badge tone="amber">Cần nhập thêm</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function BooksPage({
  books,
  canEdit,
  showToast,
  reload,
  askConfirm,
}: {
  books: Book[];
  canEdit: boolean;
  showToast: (message: string, type?: ToastMessage["type"]) => void;
  reload: () => Promise<void>;
  askConfirm: (confirm: ConfirmState) => void;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [publisher, setPublisher] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [bookForm, setBookForm] = useState<BookForm>(blankBook());
  const [busy, setBusy] = useState(false);

  const categories = useMemo(() => Array.from(new Set(books.map((book) => book.theLoai))).sort(), [books]);
  const publishers = useMemo(() => Array.from(new Set(books.map((book) => book.nhaXuatBan))).sort(), [books]);

  const filteredBooks = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return books.filter((book) => {
      const matchesSearch =
        !keyword ||
        [book.maSach, book.tenSach, book.tacGia].some((value) => value.toLowerCase().includes(keyword));
      const matchesCategory = !category || book.theLoai === category;
      const matchesPublisher = !publisher || book.nhaXuatBan === publisher;
      const isLow = book.soLuongTon <= book.mucTonToiThieu;
      const matchesStock = !stockStatus || (stockStatus === "low" ? isLow : !isLow);
      return matchesSearch && matchesCategory && matchesPublisher && matchesStock;
    });
  }, [books, category, publisher, search, stockStatus]);

  const openCreate = () => {
    setBookForm(blankBook());
    setModalOpen(true);
  };

  const openEdit = (book: Book) => {
    setBookForm(book);
    setModalOpen(true);
  };

  const canSave =
    bookForm.maSach.trim() &&
    bookForm.tenSach.trim() &&
    bookForm.tacGia.trim() &&
    bookForm.giaBia > 0 &&
    bookForm.soTrang > 0 &&
    bookForm.soLuongTon >= 0 &&
    bookForm.mucTonToiThieu >= 0;

  const saveBook = async () => {
    if (!canSave) {
      showToast("Vui lòng nhập đủ thông tin sách.", "error");
      return;
    }
    setBusy(true);
    try {
      const result = await fetchJson<{ message: string }>("/api/books", {
        method: bookForm.id ? "PUT" : "POST",
        body: JSON.stringify(bookForm),
      });
      showToast(result.message, "success");
      setModalOpen(false);
      await reload();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không lưu được sách.", "error");
    } finally {
      setBusy(false);
    }
  };

  const deleteBook = (book: Book) => {
    askConfirm({
      title: "Xóa sách",
      body: `Bạn có chắc muốn xóa sách "${book.tenSach}" không? Nếu sách đã bán rồi, hệ thống sẽ giữ lại để tránh mất lịch sử.`,
      confirmLabel: "Xóa sách",
      danger: true,
      onConfirm: async () => {
        try {
          const result = await fetchJson<{ message: string }>("/api/books", {
            method: "DELETE",
            body: JSON.stringify({ id: book.id }),
          });
          showToast(result.message, "success");
          await reload();
        } catch (error) {
          showToast(error instanceof Error ? error.message : "Không xóa được sách.", "error");
        }
      },
    });
  };

  return (
    <section>
      <PageTitle
        title="Quản lý sách"
        subtitle="Tìm kiếm, lọc tồn kho, thêm mới và cập nhật thông tin sách."
        action={
          canEdit ? (
            <Button icon={Plus} onClick={openCreate}>
              Thêm sách
            </Button>
          ) : null
        }
      />
      <div className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <Field label="Tìm kiếm">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Mã sách, tên sách, tác giả"
            />
          </div>
        </Field>
        <Field label="Thể loại">
          <Select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">Tất cả</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Nhà xuất bản">
          <Select value={publisher} onChange={(event) => setPublisher(event.target.value)}>
            <option value="">Tất cả</option>
            {publishers.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tồn kho">
          <Select value={stockStatus} onChange={(event) => setStockStatus(event.target.value)}>
            <option value="">Tất cả</option>
            <option value="low">Cần nhập thêm</option>
            <option value="ok">Đang ổn</option>
          </Select>
        </Field>
      </div>
      <Table>
        <thead className="bg-slate-50">
          <tr>
            {["Mã sách", "Tên sách", "Tác giả", "Thể loại", "Giá bìa", "Tồn", "Kệ", "Trạng thái", ""].map((head) => (
              <th key={head} className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filteredBooks.map((book) => {
            const low = book.soLuongTon <= book.mucTonToiThieu;
            return (
              <tr key={book.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-ink">{book.maSach}</td>
                <td className="px-4 py-3">{book.tenSach}</td>
                <td className="px-4 py-3">{book.tacGia}</td>
                <td className="px-4 py-3">{book.theLoai}</td>
                <td className="px-4 py-3">{formatMoney(book.giaBia)}</td>
                <td className="px-4 py-3">{book.soLuongTon}</td>
                <td className="px-4 py-3">{book.viTriKe}</td>
                <td className="px-4 py-3">
                  <Badge tone={low ? "amber" : "green"}>{low ? "Cần nhập thêm" : "Đang ổn"}</Badge>
                </td>
                <td className="px-4 py-3">
                  {canEdit ? (
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" icon={Pencil} onClick={() => openEdit(book)}>
                        Sửa
                      </Button>
                      <Button variant="danger" icon={Trash2} onClick={() => deleteBook(book)}>
                        Xóa
                      </Button>
                    </div>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <Modal
        open={modalOpen}
        title={bookForm.id ? "Sửa sách" : "Thêm sách"}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Hủy
            </Button>
            <Button icon={Save} disabled={!canSave} busy={busy} onClick={saveBook}>
              Lưu sách
            </Button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Mã sách / Barcode">
            <Input value={bookForm.maSach} onChange={(event) => setBookForm({ ...bookForm, maSach: event.target.value })} />
          </Field>
          <Field label="Tên sách">
            <Input value={bookForm.tenSach} onChange={(event) => setBookForm({ ...bookForm, tenSach: event.target.value })} />
          </Field>
          <Field label="Tác giả">
            <Input value={bookForm.tacGia} onChange={(event) => setBookForm({ ...bookForm, tacGia: event.target.value })} />
          </Field>
          <Field label="Thể loại">
            <Select value={bookForm.theLoai} onChange={(event) => setBookForm({ ...bookForm, theLoai: event.target.value })}>
              {["Kỹ năng sống", "Tiểu thuyết", "Văn hóa", "Giáo dục", "Công nghệ", "Khoa học", "Thiếu nhi"].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Nhà xuất bản">
            <Select
              value={bookForm.nhaXuatBan}
              onChange={(event) => setBookForm({ ...bookForm, nhaXuatBan: event.target.value })}
            >
              {["NXB Trẻ", "NXB Tổng Hợp", "NXB Văn Học", "NXB Bách Khoa", "NXB Kim Đồng", "NXB Phụ Nữ"].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Năm xuất bản">
            <Input
              type="number"
              value={numberInputValue(bookForm.namXuatBan)}
              onChange={(event) => setBookForm({ ...bookForm, namXuatBan: Number(event.target.value) })}
            />
          </Field>
          <Field label="Giá bìa">
            <Input
              min={0}
              type="number"
              value={numberInputValue(bookForm.giaBia)}
              onChange={(event) => setBookForm({ ...bookForm, giaBia: Number(event.target.value) })}
            />
          </Field>
          <Field label="Số trang">
            <Input
              min={1}
              type="number"
              value={numberInputValue(bookForm.soTrang)}
              onChange={(event) => setBookForm({ ...bookForm, soTrang: Number(event.target.value) })}
            />
          </Field>
          <Field label="Số lượng tồn">
            <Input
              min={0}
              type="number"
              value={numberInputValue(bookForm.soLuongTon)}
              onChange={(event) => setBookForm({ ...bookForm, soLuongTon: Number(event.target.value) })}
            />
          </Field>
          <Field label="Mức tồn tối thiểu">
            <Input
              min={0}
              type="number"
              value={numberInputValue(bookForm.mucTonToiThieu)}
              onChange={(event) => setBookForm({ ...bookForm, mucTonToiThieu: Number(event.target.value) })}
            />
          </Field>
          <Field label="Vị trí kệ">
            <Input value={bookForm.viTriKe} onChange={(event) => setBookForm({ ...bookForm, viTriKe: event.target.value })} />
          </Field>
        </div>
      </Modal>
    </section>
  );
}

function SuppliersPage({
  suppliers,
  showToast,
  reload,
  askConfirm,
}: {
  suppliers: Supplier[];
  showToast: (message: string, type?: ToastMessage["type"]) => void;
  reload: () => Promise<void>;
  askConfirm: (confirm: ConfirmState) => void;
}) {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<SupplierForm>(blankSupplier());
  const [busy, setBusy] = useState(false);

  const filtered = suppliers.filter((supplier) => {
    const keyword = search.trim().toLowerCase();
    return (
      !keyword ||
      [supplier.maNCC, supplier.tenNCC, supplier.soDienThoai, supplier.email].some((value) =>
        value.toLowerCase().includes(keyword),
      )
    );
  });

  const canSave = form.maNCC.trim() && form.tenNCC.trim() && form.diaChi.trim() && form.soDienThoai.trim() && form.email.trim();

  const save = async () => {
    if (!canSave) return;
    setBusy(true);
    try {
      const result = await fetchJson<{ message: string }>("/api/suppliers", {
        method: form.id ? "PUT" : "POST",
        body: JSON.stringify(form),
      });
      showToast(result.message, "success");
      setModalOpen(false);
      await reload();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không lưu được nhà cung cấp.", "error");
    } finally {
      setBusy(false);
    }
  };

  const remove = (supplier: Supplier) => {
    askConfirm({
      title: "Xóa nhà cung cấp",
      body: `Bạn có chắc muốn xóa "${supplier.tenNCC}" không?`,
      confirmLabel: "Xóa",
      danger: true,
      onConfirm: async () => {
        try {
          const result = await fetchJson<{ message: string }>("/api/suppliers", {
            method: "DELETE",
            body: JSON.stringify({ id: supplier.id }),
          });
          showToast(result.message, "success");
          await reload();
        } catch (error) {
          showToast(error instanceof Error ? error.message : "Không xóa được nhà cung cấp.", "error");
        }
      },
    });
  };

  return (
    <section>
      <PageTitle
        title="Nhà cung cấp"
        subtitle="Quản lý nguồn nhập sách và thông tin liên hệ."
        action={
          <Button icon={Plus} onClick={() => {
            setForm(blankSupplier());
            setModalOpen(true);
          }}>
            Thêm nhà cung cấp
          </Button>
        }
      />
      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <Field label="Tìm kiếm">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Mã, tên, số điện thoại, email" />
        </Field>
      </div>
      <Table>
        <thead className="bg-slate-50">
          <tr>
            {["Mã", "Tên nhà cung cấp", "Địa chỉ", "Điện thoại", "Email", ""].map((head) => (
              <th key={head} className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filtered.map((supplier) => (
            <tr key={supplier.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-semibold">{supplier.maNCC}</td>
              <td className="px-4 py-3">{supplier.tenNCC}</td>
              <td className="px-4 py-3">{supplier.diaChi}</td>
              <td className="px-4 py-3">{supplier.soDienThoai}</td>
              <td className="px-4 py-3">{supplier.email}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    icon={Pencil}
                    onClick={() => {
                      setForm(supplier);
                      setModalOpen(true);
                    }}
                  >
                    Sửa
                  </Button>
                  <Button variant="danger" icon={Trash2} onClick={() => remove(supplier)}>
                    Xóa
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal
        open={modalOpen}
        title={form.id ? "Sửa nhà cung cấp" : "Thêm nhà cung cấp"}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Hủy
            </Button>
            <Button icon={Save} disabled={!canSave} busy={busy} onClick={save}>
              Lưu
            </Button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Mã nhà cung cấp">
            <Input value={form.maNCC} onChange={(event) => setForm({ ...form, maNCC: event.target.value })} />
          </Field>
          <Field label="Tên nhà cung cấp">
            <Input value={form.tenNCC} onChange={(event) => setForm({ ...form, tenNCC: event.target.value })} />
          </Field>
          <Field label="Địa chỉ">
            <Input value={form.diaChi} onChange={(event) => setForm({ ...form, diaChi: event.target.value })} />
          </Field>
          <Field label="Số điện thoại">
            <Input value={form.soDienThoai} onChange={(event) => setForm({ ...form, soDienThoai: event.target.value })} />
          </Field>
          <Field label="Email">
            <Input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </Field>
        </div>
      </Modal>
    </section>
  );
}

function EmployeesPage({
  employees,
  showToast,
  reload,
  askConfirm,
}: {
  employees: Employee[];
  showToast: (message: string, type?: ToastMessage["type"]) => void;
  reload: () => Promise<void>;
  askConfirm: (confirm: ConfirmState) => void;
}) {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<EmployeeForm>(blankEmployee());
  const [busy, setBusy] = useState(false);

  const filtered = employees.filter((employee) => {
    const keyword = search.trim().toLowerCase();
    return (
      !keyword ||
      [employee.maNV, employee.hoTen, employee.chucVu, employee.taiKhoan].some((value) =>
        value.toLowerCase().includes(keyword),
      )
    );
  });
  const canSave = form.maNV.trim() && form.hoTen.trim() && form.chucVu.trim() && form.taiKhoan.trim() && form.matKhau.trim();

  const save = async () => {
    if (!canSave) return;
    setBusy(true);
    try {
      const result = await fetchJson<{ message: string }>("/api/employees", {
        method: form.id ? "PUT" : "POST",
        body: JSON.stringify(form),
      });
      showToast(result.message, "success");
      setModalOpen(false);
      await reload();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không lưu được nhân viên.", "error");
    } finally {
      setBusy(false);
    }
  };

  const lockEmployee = (employee: Employee) => {
    askConfirm({
      title: "Khóa tài khoản",
      body: `Bạn có chắc muốn khóa tài khoản của ${employee.hoTen} không? Nhân viên này sẽ không đăng nhập được.`,
      confirmLabel: "Khóa",
      danger: true,
      onConfirm: async () => {
        try {
          const result = await fetchJson<{ message: string }>("/api/employees", {
            method: "DELETE",
            body: JSON.stringify({ id: employee.id }),
          });
          showToast(result.message, "success");
          await reload();
        } catch (error) {
          showToast(error instanceof Error ? error.message : "Không khóa được nhân viên.", "error");
        }
      },
    });
  };

  return (
    <section>
      <PageTitle
        title="Nhân viên"
        subtitle="Chỉ quản lý cửa hàng được xem và cập nhật nhân viên."
        action={
          <Button icon={Plus} onClick={() => {
            setForm(blankEmployee());
            setModalOpen(true);
          }}>
            Thêm nhân viên
          </Button>
        }
      />
      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <Field label="Tìm kiếm">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Mã, họ tên, chức vụ, tài khoản" />
        </Field>
      </div>
      <Table>
        <thead className="bg-slate-50">
          <tr>
            {["Mã", "Họ tên", "Chức vụ", "Tài khoản", "Vai trò", "Trạng thái", ""].map((head) => (
              <th key={head} className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filtered.map((employee) => (
            <tr key={employee.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-semibold">{employee.maNV}</td>
              <td className="px-4 py-3">{employee.hoTen}</td>
              <td className="px-4 py-3">{employee.chucVu}</td>
              <td className="px-4 py-3">{employee.taiKhoan}</td>
              <td className="px-4 py-3">{labelOf(roleLabels, employee.vaiTro)}</td>
              <td className="px-4 py-3">
                <Badge tone={employee.trangThai === "DANG_HOAT_DONG" ? "green" : "rose"}>
                  {labelOf(employeeStatusLabels, employee.trangThai)}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    icon={Pencil}
                    onClick={() => {
                      setForm(employee);
                      setModalOpen(true);
                    }}
                  >
                    Sửa
                  </Button>
                  <Button variant="danger" icon={Lock} onClick={() => lockEmployee(employee)}>
                    Khóa
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal
        open={modalOpen}
        title={form.id ? "Sửa nhân viên" : "Thêm nhân viên"}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Hủy
            </Button>
            <Button icon={Save} disabled={!canSave} busy={busy} onClick={save}>
              Lưu
            </Button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Mã nhân viên">
            <Input value={form.maNV} onChange={(event) => setForm({ ...form, maNV: event.target.value })} />
          </Field>
          <Field label="Họ tên">
            <Input value={form.hoTen} onChange={(event) => setForm({ ...form, hoTen: event.target.value })} />
          </Field>
          <Field label="Chức vụ">
            <Input value={form.chucVu} onChange={(event) => setForm({ ...form, chucVu: event.target.value })} />
          </Field>
          <Field label="Tài khoản">
            <Input value={form.taiKhoan} onChange={(event) => setForm({ ...form, taiKhoan: event.target.value })} />
          </Field>
          <Field label="Mật khẩu">
            <Input value={form.matKhau} onChange={(event) => setForm({ ...form, matKhau: event.target.value })} />
          </Field>
          <Field label="Vai trò">
            <Select value={form.vaiTro} onChange={(event) => setForm({ ...form, vaiTro: event.target.value as Role })}>
              <option value="QUAN_LY">Quản lý</option>
              <option value="THU_KHO">Thủ kho</option>
              <option value="BAN_HANG">Bán hàng</option>
            </Select>
          </Field>
          <Field label="Trạng thái">
            <Select value={form.trangThai} onChange={(event) => setForm({ ...form, trangThai: event.target.value })}>
              <option value="DANG_HOAT_DONG">Đang hoạt động</option>
              <option value="BI_KHOA">Bị khóa</option>
            </Select>
          </Field>
        </div>
      </Modal>
    </section>
  );
}

function PurchasesPage({
  books,
  suppliers,
  employees,
  purchases,
  user,
  showToast,
  reload,
}: {
  books: Book[];
  suppliers: Supplier[];
  employees: Employee[];
  purchases: Purchase[];
  user: User;
  showToast: (message: string, type?: ToastMessage["type"]) => void;
  reload: () => Promise<void>;
}) {
  const [supplierId, setSupplierId] = useState("");
  const [employeeId, setEmployeeId] = useState(String(user.id));
  const [lines, setLines] = useState<PurchaseDraftLine[]>([{ sachId: "", soLuongNhap: 1, donGiaNhap: 0 }]);
  const [busy, setBusy] = useState(false);
  const warehouseEmployees = employees.filter((employee) => ["QUAN_LY", "THU_KHO"].includes(employee.vaiTro));
  const total = lines.reduce((sum, line) => sum + line.soLuongNhap * line.donGiaNhap, 0);
  const canSave = supplierId && employeeId && lines.length > 0 && lines.every((line) => line.sachId && line.soLuongNhap > 0 && line.donGiaNhap > 0);

  const updateLine = (index: number, next: Partial<PurchaseDraftLine>) => {
    setLines((current) => current.map((line, lineIndex) => (lineIndex === index ? { ...line, ...next } : line)));
  };

  const save = async () => {
    if (!canSave) {
      showToast("Bạn chưa chọn nhà cung cấp hoặc dòng sách chưa đủ thông tin.", "error");
      return;
    }
    setBusy(true);
    try {
      const result = await fetchJson<{ message: string }>("/api/purchases", {
        method: "POST",
        body: JSON.stringify({
          nhaCungCapId: Number(supplierId),
          nhanVienId: Number(employeeId),
          items: lines.map((line) => ({
            sachId: Number(line.sachId),
            soLuongNhap: line.soLuongNhap,
            donGiaNhap: line.donGiaNhap,
          })),
        }),
      });
      showToast(result.message, "success");
      setSupplierId("");
      setEmployeeId(String(user.id));
      setLines([{ sachId: "", soLuongNhap: 1, donGiaNhap: 0 }]);
      await reload();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không lưu được phiếu nhập.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <PageTitle title="Nhập kho" subtitle="Lập phiếu nhập, tự tính tiền và tự cộng tồn kho khi lưu." />
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nhà cung cấp">
              <Select value={supplierId} onChange={(event) => setSupplierId(event.target.value)}>
                <option value="">Chọn nhà cung cấp</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.tenNCC}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Nhân viên lập phiếu">
              <Select value={employeeId} onChange={(event) => setEmployeeId(event.target.value)}>
                {warehouseEmployees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.hoTen}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="mt-5 grid gap-3">
            {lines.map((line, index) => {
              const selectedBook = books.find((book) => String(book.id) === line.sachId);
              return (
                <div key={`${index}-${line.sachId}`} className="grid gap-3 rounded-md border border-slate-200 p-3 lg:grid-cols-[1.4fr_0.7fr_0.8fr_0.8fr_auto]">
                  <Field label="Sách">
                    <Select
                      value={line.sachId}
                      onChange={(event) => {
                        const book = books.find((item) => String(item.id) === event.target.value);
                        updateLine(index, {
                          sachId: event.target.value,
                          donGiaNhap: book ? Math.round(book.giaBia * 0.7) : 0,
                        });
                      }}
                    >
                      <option value="">Chọn sách</option>
                      {books.map((book) => (
                        <option key={book.id} value={book.id}>
                          {book.maSach} - {book.tenSach}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Số lượng">
                    <Input
                      min={1}
                      type="number"
                      value={line.soLuongNhap}
                      onChange={(event) => updateLine(index, { soLuongNhap: Math.max(1, Number(event.target.value)) })}
                    />
                  </Field>
                  <Field label="Đơn giá nhập">
                    <Input
                      min={0}
                      type="number"
                      value={line.donGiaNhap}
                      onChange={(event) => updateLine(index, { donGiaNhap: Math.max(0, Number(event.target.value)) })}
                    />
                  </Field>
                  <div className="grid content-end">
                    <p className="text-xs font-semibold text-slate-500">Thành tiền</p>
                    <p className="h-10 pt-2 font-bold text-ink">{formatMoney(line.soLuongNhap * line.donGiaNhap)}</p>
                  </div>
                  <div className="grid content-end">
                    <Button
                      variant="danger"
                      icon={Trash2}
                      disabled={lines.length === 1}
                      onClick={() => setLines((current) => current.filter((_, lineIndex) => lineIndex !== index))}
                    >
                      Xóa
                    </Button>
                  </div>
                  {selectedBook ? (
                    <p className="text-sm text-slate-500 lg:col-span-5">
                      Tồn hiện tại: {selectedBook.soLuongTon} cuốn, vị trí {selectedBook.viTriKe}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Button variant="secondary" icon={Plus} onClick={() => setLines((current) => [...current, { sachId: "", soLuongNhap: 1, donGiaNhap: 0 }])}>
              Thêm dòng sách
            </Button>
            <div className="text-right">
              <p className="text-sm text-slate-500">Tổng tiền nhập</p>
              <p className="text-2xl font-bold text-primary">{formatMoney(total)}</p>
            </div>
          </div>
          <Button className="mt-4 h-12 w-full text-base" icon={Save} disabled={!canSave} busy={busy} onClick={save}>
            Lưu phiếu nhập
          </Button>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Phiếu nhập gần đây</h2>
          <div className="mt-4 grid gap-3">
            {purchases.slice(0, 8).map((purchase) => (
              <div key={purchase.id} className="rounded-md border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-ink">{purchase.maPN}</p>
                  <Badge tone="blue">{formatMoney(purchase.tongTienNhap)}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {formatDate(purchase.ngayNhap)} · {purchase.nhaCungCap.tenNCC}
                </p>
                <p className="mt-1 text-sm text-slate-500">{purchase.chiTiet.length} dòng sách</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SalesPage({
  books,
  user,
  showToast,
  reload,
  askConfirm,
  onPrint,
}: {
  books: Book[];
  user: User;
  showToast: (message: string, type?: ToastMessage["type"]) => void;
  reload: () => Promise<void>;
  askConfirm: (confirm: ConfirmState) => void;
  onPrint: (invoice: Sale) => void;
}) {
  const [code, setCode] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [payment, setPayment] = useState<"TIEN_MAT" | "CHUYEN_KHOAN">("TIEN_MAT");
  const [busy, setBusy] = useState(false);

  const totalBeforeDiscount = cart.reduce((sum, line) => sum + line.quantity * line.book.giaBia, 0);
  const totalDiscount = cart.reduce((sum, line) => sum + line.discount, 0);
  const finalTotal = totalBeforeDiscount - totalDiscount;
  const cartValid = cart.length > 0 && cart.every((line) => line.quantity > 0 && line.quantity <= line.book.soLuongTon && line.discount >= 0);

  const addBook = (rawCode: string) => {
    const keyword = rawCode.trim();
    if (!keyword) return;
    const book = books.find((item) => item.maSach === keyword);
    if (!book) {
      showToast("Không tìm thấy sách này, vui lòng kiểm tra lại mã sách nhé!", "error");
      return;
    }
    if (book.soLuongTon <= 0) {
      showToast("Sách này đang hết hàng, vui lòng chọn sách khác.", "error");
      return;
    }
    setCart((current) => {
      const existed = current.find((line) => line.book.id === book.id);
      if (existed) {
        if (existed.quantity + 1 > book.soLuongTon) {
          showToast("Số lượng bán không được vượt quá tồn kho.", "error");
          return current;
        }
        return current.map((line) => (line.book.id === book.id ? { ...line, quantity: line.quantity + 1 } : line));
      }
      return [...current, { book, quantity: 1, discount: 0 }];
    });
    setCode("");
  };

  const checkout = async () => {
    if (!cartValid) {
      showToast("Giỏ hàng chưa hợp lệ, vui lòng kiểm tra lại số lượng.", "error");
      return;
    }
    setBusy(true);
    try {
      const result = await fetchJson<{ message: string; invoice: Sale }>("/api/sales", {
        method: "POST",
        body: JSON.stringify({
          nhanVienId: user.id,
          hinhThucThanhToan: payment,
          items: cart.map((line) => ({
            sachId: line.book.id,
            soLuongBan: line.quantity,
            donGiaBan: line.book.giaBia,
            chietKhau: line.discount,
          })),
        }),
      });
      showToast(result.message, "success");
      setCart([]);
      await reload();
      askConfirm({
        title: "In hóa đơn",
        body: "Bạn có muốn in hóa đơn không?",
        confirmLabel: "In hóa đơn",
        onConfirm: () => onPrint(result.invoice),
      });
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thanh toán được.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <PageTitle title="Bán hàng" subtitle="Nhập hoặc quét mã sách, hệ thống tự thêm vào giỏ và trừ tồn kho sau khi thanh toán." />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <form
            className="grid gap-3 md:grid-cols-[1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              addBook(code);
            }}
          >
            <Field label="Nhập / quét mã sách">
              <Input
                className="h-14 text-lg font-semibold"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="Ví dụ: 8934974180011"
                autoFocus
              />
            </Field>
            <div className="grid content-end">
              <Button className="h-14 text-base" icon={Search} type="submit">
                Thêm vào giỏ
              </Button>
            </div>
          </form>
          <div className="mt-5">
            <Table>
              <thead className="bg-slate-50">
                <tr>
                  {["Mã sách", "Tên sách", "Số lượng", "Đơn giá", "Chiết khấu", "Thành tiền", ""].map((head) => (
                    <th key={head} className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cart.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>
                      Giỏ hàng đang trống.
                    </td>
                  </tr>
                ) : (
                  cart.map((line) => (
                    <tr key={line.book.id}>
                      <td className="px-4 py-3 font-semibold">{line.book.maSach}</td>
                      <td className="px-4 py-3">{line.book.tenSach}</td>
                      <td className="px-4 py-3">
                        <Input
                          className="w-24"
                          min={1}
                          max={line.book.soLuongTon}
                          type="number"
                          value={line.quantity}
                          onChange={(event) => {
                            const next = Math.max(1, Number(event.target.value));
                            if (next > line.book.soLuongTon) {
                              showToast("Số lượng bán không được vượt quá tồn kho.", "error");
                              return;
                            }
                            setCart((current) =>
                              current.map((item) => (item.book.id === line.book.id ? { ...item, quantity: next } : item)),
                            );
                          }}
                        />
                        <p className="mt-1 text-xs text-slate-500">Tồn: {line.book.soLuongTon}</p>
                      </td>
                      <td className="px-4 py-3">{formatMoney(line.book.giaBia)}</td>
                      <td className="px-4 py-3">
                        <Input
                          className="w-28"
                          min={0}
                          type="number"
                          value={line.discount}
                          onChange={(event) =>
                            setCart((current) =>
                              current.map((item) =>
                                item.book.id === line.book.id ? { ...item, discount: Math.max(0, Number(event.target.value)) } : item,
                              ),
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-3 font-bold">{formatMoney(line.quantity * line.book.giaBia - line.discount)}</td>
                      <td className="px-4 py-3">
                        <Button
                          variant="danger"
                          icon={Trash2}
                          onClick={() => setCart((current) => current.filter((item) => item.book.id !== line.book.id))}
                        >
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Thanh toán</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Trước chiết khấu</span>
              <strong>{formatMoney(totalBeforeDiscount)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tổng chiết khấu</span>
              <strong>{formatMoney(totalDiscount)}</strong>
            </div>
            <div className="border-t border-slate-200 pt-3">
              <p className="text-slate-500">Tổng thanh toán</p>
              <p className="text-3xl font-bold text-primary">{formatMoney(finalTotal)}</p>
            </div>
            <Field label="Hình thức thanh toán">
              <Select value={payment} onChange={(event) => setPayment(event.target.value as "TIEN_MAT" | "CHUYEN_KHOAN")}>
                <option value="TIEN_MAT">Tiền mặt</option>
                <option value="CHUYEN_KHOAN">Chuyển khoản</option>
              </Select>
            </Field>
          </div>
          <Button className="mt-5 h-14 w-full text-lg" icon={CreditCard} disabled={!cartValid} busy={busy} onClick={checkout}>
            Thanh toán
          </Button>
        </div>
      </div>
    </section>
  );
}

function ReturnsPage({
  sales,
  returns,
  showToast,
  reload,
}: {
  sales: Sale[];
  returns: ReturnTicket[];
  showToast: (message: string, type?: ToastMessage["type"]) => void;
  reload: () => Promise<void>;
}) {
  const [invoiceCode, setInvoiceCode] = useState("HD002");
  const [selectedInvoice, setSelectedInvoice] = useState<Sale | null>(null);
  const [bookId, setBookId] = useState("");
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [action, setAction] = useState<"DOI_SACH_MOI" | "HOAN_TIEN">("HOAN_TIEN");
  const [status, setStatus] = useState<"DA_TIEP_NHAN" | "DA_XU_LY">("DA_TIEP_NHAN");
  const [addStock, setAddStock] = useState(false);
  const [busy, setBusy] = useState(false);

  const findInvoice = () => {
    const invoice = sales.find((sale) => sale.maHD.toLowerCase() === invoiceCode.trim().toLowerCase());
    if (!invoice) {
      setSelectedInvoice(null);
      showToast("Hóa đơn này không tồn tại, vui lòng kiểm tra lại mã hóa đơn.", "error");
      return;
    }
    setSelectedInvoice(invoice);
    setBookId(String(invoice.chiTiet[0]?.sachId ?? ""));
  };

  const canSave = selectedInvoice && bookId && customer.trim() && phone.trim() && reason.trim();

  const save = async () => {
    if (!selectedInvoice || !canSave) {
      showToast("Vui lòng nhập đủ thông tin đổi/trả.", "error");
      return;
    }
    setBusy(true);
    try {
      const result = await fetchJson<{ message: string }>("/api/returns", {
        method: "POST",
        body: JSON.stringify({
          hoaDonId: selectedInvoice.id,
          sachId: Number(bookId),
          tenKhachHang: customer,
          soDienThoai: phone,
          lyDo: reason,
          hinhThucXuLy: action,
          trangThai: status,
          congLaiTonKho: addStock,
        }),
      });
      showToast(result.message, "success");
      setCustomer("");
      setPhone("");
      setReason("");
      setAddStock(false);
      await reload();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không lưu được phiếu đổi/trả.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <PageTitle title="Đổi/trả sách" subtitle="Tìm hóa đơn gốc, chọn sách và lưu yêu cầu xử lý cho khách." />
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <Field label="Mã hóa đơn gốc">
              <Input value={invoiceCode} onChange={(event) => setInvoiceCode(event.target.value)} placeholder="HD001" />
            </Field>
            <div className="grid content-end">
              <Button icon={Search} onClick={findInvoice}>
                Tìm hóa đơn
              </Button>
            </div>
          </div>

          {selectedInvoice ? (
            <div className="mt-5 grid gap-4">
              <div className="rounded-md bg-slate-50 p-4">
                <p className="font-bold text-ink">{selectedInvoice.maHD}</p>
                <p className="text-sm text-slate-500">
                  {formatDate(selectedInvoice.ngayLap)} · {formatMoney(selectedInvoice.thanhTien)}
                </p>
              </div>
              <Table>
                <thead className="bg-slate-50">
                  <tr>
                    {["Sách đã mua", "Số lượng", "Đơn giá", "Thành tiền"].map((head) => (
                      <th key={head} className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.chiTiet.map((line) => (
                    <tr key={line.id}>
                      <td className="px-4 py-3">{line.sach.tenSach}</td>
                      <td className="px-4 py-3">{line.soLuongBan}</td>
                      <td className="px-4 py-3">{formatMoney(line.donGiaBan)}</td>
                      <td className="px-4 py-3">{formatMoney(line.thanhTien)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Sách cần đổi/trả">
                  <Select value={bookId} onChange={(event) => setBookId(event.target.value)}>
                    {selectedInvoice.chiTiet.map((line) => (
                      <option key={line.id} value={line.sachId}>
                        {line.sach.tenSach}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Tên khách hàng">
                  <Input value={customer} onChange={(event) => setCustomer(event.target.value)} />
                </Field>
                <Field label="Số điện thoại">
                  <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
                </Field>
                <Field label="Hình thức xử lý">
                  <Select value={action} onChange={(event) => setAction(event.target.value as "DOI_SACH_MOI" | "HOAN_TIEN")}>
                    <option value="DOI_SACH_MOI">Đổi sách mới</option>
                    <option value="HOAN_TIEN">Hoàn tiền</option>
                  </Select>
                </Field>
                <Field label="Trạng thái">
                  <Select value={status} onChange={(event) => setStatus(event.target.value as "DA_TIEP_NHAN" | "DA_XU_LY")}>
                    <option value="DA_TIEP_NHAN">Đã tiếp nhận</option>
                    <option value="DA_XU_LY">Đã xử lý</option>
                  </Select>
                </Field>
                <label className="mt-7 flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700">
                  <input checked={addStock} type="checkbox" onChange={(event) => setAddStock(event.target.checked)} />
                  Cộng lại tồn kho nếu sách còn bán được
                </label>
                <div className="md:col-span-2">
                  <Field label="Lý do đổi/trả">
                    <TextArea value={reason} onChange={(event) => setReason(event.target.value)} />
                  </Field>
                </div>
              </div>
              <Button className="h-12" icon={Save} disabled={!canSave} busy={busy} onClick={save}>
                Lưu phiếu đổi/trả
              </Button>
            </div>
          ) : null}
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Phiếu đổi/trả gần đây</h2>
          <div className="mt-4 grid gap-3">
            {returns.slice(0, 8).map((ticket) => (
              <div key={ticket.id} className="rounded-md border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-ink">{ticket.maDoiTra}</p>
                  <Badge tone={ticket.trangThai === "DA_XU_LY" ? "green" : "amber"}>{labelOf(returnStatusLabels, ticket.trangThai)}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {ticket.tenKhachHang} · {ticket.sach.tenSach}
                </p>
                <p className="mt-1 text-sm text-slate-500">{labelOf(returnActionLabels, ticket.hinhThucXuLy)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ReportsPage({
  report,
  from,
  to,
  setFrom,
  setTo,
  reload,
  showToast,
}: {
  report: ReportData | null;
  from: string;
  to: string;
  setFrom: (value: string) => void;
  setTo: (value: string) => void;
  reload: () => Promise<void>;
  showToast: (message: string, type?: ToastMessage["type"]) => void;
}) {
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setBusy(true);
    try {
      await reload();
      showToast("Đã tải báo cáo.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không tải được báo cáo.", "error");
    } finally {
      setBusy(false);
    }
  };

  const downloadCsv = () => {
    if (!report) return;
    const rows = [
      ["Mục", "Giá trị"],
      ["Tổng số hóa đơn", report.summary.totalInvoices],
      ["Tổng sản phẩm bán ra", report.summary.totalItems],
      ["Doanh thu trước chiết khấu", report.summary.grossRevenue],
      ["Tổng chiết khấu", report.summary.discount],
      ["Doanh thu thuần", report.summary.netRevenue],
      [],
      ["Top sách bán chạy"],
      ["Mã sách", "Tên sách", "Số lượng", "Doanh thu"],
      ...report.topBooks.map((book) => [book.maSach, book.tenSach, book.soLuong, book.doanhThu]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bao-cao-${from}-${to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const summary = report?.summary;

  return (
    <section>
      <PageTitle
        title="Báo cáo"
        subtitle="Doanh thu, sách bán chạy, tồn kho thấp và sách chưa bán trong khoảng thời gian chọn."
        action={
          <Button icon={Download} variant="secondary" disabled={!report} onClick={downloadCsv}>
            Xuất CSV
          </Button>
        }
      />
      <div className="mb-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_1fr_auto]">
        <Field label="Từ ngày">
          <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        </Field>
        <Field label="Đến ngày">
          <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        </Field>
        <div className="grid content-end">
          <Button icon={Search} busy={busy} onClick={refresh}>
            Xem báo cáo
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ["Tổng hóa đơn", summary?.totalInvoices ?? 0],
          ["Sản phẩm bán ra", summary?.totalItems ?? 0],
          ["Trước chiết khấu", formatMoney(summary?.grossRevenue ?? 0)],
          ["Chiết khấu", formatMoney(summary?.discount ?? 0)],
          ["Doanh thu thuần", formatMoney(summary?.netRevenue ?? 0)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-2 text-xl font-bold text-ink">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Top sách bán chạy</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report?.topBooks ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tenSach" tick={{ fontSize: 11 }} interval={0} height={70} />
                <YAxis />
                <Tooltip formatter={(value) => String(value)} />
                <Bar dataKey="soLuong" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Tồn kho thấp</h2>
          <div className="mt-4 grid gap-2">
            {(report?.lowStock ?? []).map((book) => (
              <div key={book.id} className="flex items-center justify-between gap-3 rounded-md bg-amber-50 p-3">
                <div>
                  <p className="font-semibold">{book.tenSach}</p>
                  <p className="text-sm text-slate-500">Còn {book.soLuongTon} cuốn</p>
                </div>
                <Badge tone="amber">Cần nhập thêm</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-ink">Sách chưa bán trong khoảng đã chọn</h2>
        <div className="mt-4">
          <Table>
            <thead className="bg-slate-50">
              <tr>
                {["Mã sách", "Tên sách", "Tồn kho", "Vị trí kệ"].map((head) => (
                  <th key={head} className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(report?.slowBooks ?? []).map((book) => (
                <tr key={book.id}>
                  <td className="px-4 py-3 font-semibold">{book.maSach}</td>
                  <td className="px-4 py-3">{book.tenSach}</td>
                  <td className="px-4 py-3">{book.soLuongTon}</td>
                  <td className="px-4 py-3">{book.viTriKe}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </section>
  );
}

function InvoiceModal({ invoice, onClose }: { invoice: Sale | null; onClose: () => void }) {
  if (!invoice) return null;

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/45 p-4">
      <div className="invoice-print w-full max-w-2xl rounded-lg bg-white p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">CỬA HÀNG SÁCH</p>
            <h2 className="text-2xl font-bold text-ink">Hóa đơn bán lẻ</h2>
            <p className="mt-1 text-sm text-slate-500">Mã hóa đơn: {invoice.maHD}</p>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p>{formatDate(invoice.ngayLap)}</p>
            <p>Nhân viên: {invoice.nhanVien.hoTen}</p>
            <p>Thanh toán: {labelOf(paymentLabels, invoice.hinhThucThanhToan)}</p>
          </div>
        </div>
        <div className="mt-6">
          <Table>
            <thead className="bg-slate-50">
              <tr>
                {["Sách", "SL", "Đơn giá", "CK", "Thành tiền"].map((head) => (
                  <th key={head} className="px-3 py-2 text-left text-xs font-bold uppercase text-slate-500">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.chiTiet.map((line) => (
                <tr key={line.id}>
                  <td className="px-3 py-2">{line.sach.tenSach}</td>
                  <td className="px-3 py-2">{line.soLuongBan}</td>
                  <td className="px-3 py-2">{formatMoney(line.donGiaBan)}</td>
                  <td className="px-3 py-2">{formatMoney(line.chietKhau)}</td>
                  <td className="px-3 py-2 font-semibold">{formatMoney(line.thanhTien)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <div className="mt-5 grid justify-end gap-2 text-sm">
          <div className="flex min-w-72 justify-between gap-8">
            <span>Trước chiết khấu</span>
            <strong>{formatMoney(invoice.tongTien)}</strong>
          </div>
          <div className="flex min-w-72 justify-between gap-8">
            <span>Chiết khấu</span>
            <strong>{formatMoney(invoice.tongChietKhau)}</strong>
          </div>
          <div className="flex min-w-72 justify-between gap-8 border-t border-slate-200 pt-2 text-lg">
            <span>Thanh toán</span>
            <strong className="text-primary">{formatMoney(invoice.thanhTien)}</strong>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">Cảm ơn quý khách và hẹn gặp lại!</p>
        <div className="mt-5 flex justify-end gap-2 no-print">
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
          <Button icon={Printer} onClick={() => window.print()}>
            In hóa đơn
          </Button>
        </div>
      </div>
    </div>
  );
}
