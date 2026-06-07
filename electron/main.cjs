const { app, BrowserWindow, dialog } = require("electron");
const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

let mainWindow;

app.setName("Quan Ly Cua Hang Sach");

function log(message) {
  try {
    const baseDir = app.isReady()
      ? app.getPath("userData")
      : path.join(process.env.APPDATA || __dirname, "Quan Ly Cua Hang Sach");
    const logDir = path.join(baseDir, "logs");
    fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(path.join(logDir, "app.log"), `[${new Date().toISOString()}] ${message}\n`);
  } catch {
    // Logging should never stop the app from opening.
  }
}

process.on("uncaughtException", (error) => {
  log(`uncaughtException: ${error.stack || error.message}`);
});

process.on("unhandledRejection", (error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  log(`unhandledRejection: ${message}`);
});

function resourcePath(...parts) {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, ...parts);
  }

  if (parts[0] === "standalone") {
    return path.join(__dirname, "..", ".next", "standalone", ...parts.slice(1));
  }

  if (parts[0] === "seed") {
    return path.join(__dirname, "..", "prisma", ...parts.slice(1));
  }

  return path.join(__dirname, "..", ...parts);
}

function toPrismaSqliteUrl(filePath) {
  return `file:${filePath.replace(/\\/g, "/")}`;
}

function ensureWritableDatabase() {
  const dataDir = path.join(app.getPath("userData"), "data");
  const dbPath = path.join(dataDir, "dev.db");
  const seedDb = resourcePath("seed", "dev.db");

  fs.mkdirSync(dataDir, { recursive: true });

  if (!fs.existsSync(dbPath)) {
    if (!fs.existsSync(seedDb)) {
      throw new Error("Không tìm thấy database mẫu để khởi tạo.");
    }

    fs.copyFileSync(seedDb, dbPath);
  }

  return dbPath;
}

function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 3000;
      server.close(() => resolve(port));
    });
  });
}

function waitForServer(port, timeoutMs = 30000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      const request = http.get(`http://127.0.0.1:${port}`, (response) => {
        response.resume();
        resolve();
      });

      request.on("error", () => {
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error("Ứng dụng khởi động quá lâu, vui lòng thử mở lại."));
          return;
        }

        setTimeout(check, 400);
      });
    };

    check();
  });
}

async function startNextServer() {
  const serverDir = resourcePath("standalone");
  const serverFile = path.join(serverDir, "server.js");
  log(`serverDir=${serverDir}`);
  log(`serverFile=${serverFile}`);

  if (!fs.existsSync(serverFile)) {
    throw new Error("Chưa tìm thấy server Next.js đã build. Hãy chạy npm run build:exe.");
  }

  const dbPath = ensureWritableDatabase();
  const port = await findFreePort();
  log(`dbPath=${dbPath}`);
  log(`port=${port}`);

  process.env.NODE_ENV = "production";
  process.env.HOSTNAME = "127.0.0.1";
  process.env.PORT = String(port);
  process.env.DATABASE_URL = toPrismaSqliteUrl(dbPath);
  process.chdir(serverDir);

  log("importing Next standalone server");
  await import(pathToFileURL(serverFile).href);
  log("waiting for Next standalone server");
  await waitForServer(port);
  log("Next standalone server is ready");
  return port;
}

async function createWindow() {
  const port = await startNextServer();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 700,
    title: "Quản lý cửa hàng sách",
    autoHideMenuBar: true,
    icon: path.join(__dirname, "..", "public", "icon.png"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  await mainWindow.loadURL(`http://127.0.0.1:${port}`);
}

app.whenReady().then(() => {
  log("Electron app ready");
  createWindow().catch((error) => {
    log(`createWindow error: ${error.stack || error.message}`);
    dialog.showErrorBox("Không mở được ứng dụng", error.message);
    app.quit();
  });
});

app.on("window-all-closed", () => {
  app.quit();
});
