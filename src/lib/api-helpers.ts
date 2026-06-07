import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok<T>(data: T) {
  return NextResponse.json(data);
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return fail(error.issues[0]?.message ?? "Dữ liệu chưa hợp lệ, vui lòng kiểm tra lại.");
  }

  console.error(error);
  return fail("Có lỗi xảy ra, vui lòng thử lại sau ít phút.", 500);
}

export function makeCode(prefix: string) {
  const time = new Date();
  const stamp = [
    time.getFullYear(),
    String(time.getMonth() + 1).padStart(2, "0"),
    String(time.getDate()).padStart(2, "0"),
    String(time.getHours()).padStart(2, "0"),
    String(time.getMinutes()).padStart(2, "0"),
    String(time.getSeconds()).padStart(2, "0"),
    String(time.getMilliseconds()).padStart(3, "0"),
  ].join("");

  return `${prefix}${stamp}`;
}

export function dayRange(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function parseDateRange(searchParams: URLSearchParams) {
  const today = new Date();
  const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const start = from ? new Date(`${from}T00:00:00`) : defaultStart;
  const end = to ? new Date(`${to}T23:59:59`) : today;
  end.setHours(23, 59, 59, 999);
  return { start, end };
}
