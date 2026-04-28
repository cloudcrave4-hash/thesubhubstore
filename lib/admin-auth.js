const crypto = require("crypto");

const COOKIE_NAME = "theshubhub_admin";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function createAdminSession(secret) {
  const payload = {
    role: "admin",
    iat: Date.now(),
    exp: Date.now() + SESSION_TTL_MS
  };

  return signPayload(payload, secret);
}

function verifyAdminSession(token, secret) {
  if (!token || !secret) {
    return { valid: false };
  }

  const parts = String(token).split(".");
  if (parts.length !== 2) {
    return { valid: false };
  }

  const [encodedPayload, signature] = parts;
  const expectedSignature = createSignature(encodedPayload, secret);
  if (!timingSafeEqual(signature, expectedSignature)) {
    return { valid: false };
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (!payload || payload.role !== "admin" || !payload.exp || Date.now() > Number(payload.exp)) {
      return { valid: false };
    }
    return { valid: true, payload };
  } catch (error) {
    return { valid: false };
  }
}

function readAdminSessionFromRequest(req, secret) {
  const cookieHeader = req && req.headers ? req.headers.cookie || "" : "";
  const cookies = parseCookies(cookieHeader);
  return verifyAdminSession(cookies[COOKIE_NAME], secret);
}

function buildSessionCookie(token, options = {}) {
  const maxAge = Math.max(0, Math.floor((options.maxAgeMs || SESSION_TTL_MS) / 1000));
  return [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    "Secure",
    `Max-Age=${maxAge}`
  ].join("; ");
}

function buildClearedSessionCookie() {
  return [
    `${COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    "Secure",
    "Max-Age=0"
  ].join("; ");
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "";
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

function normalizeOrigin(value) {
  try {
    return new URL(String(value || "").trim()).origin;
  } catch (error) {
    return "";
  }
}

function isAllowedOrigin(req) {
  const requestOrigin = normalizeOrigin(req && req.headers ? req.headers.origin || "" : "");
  if (!requestOrigin) {
    return true;
  }

  const allowedOrigins = new Set(getConfiguredOrigins());
  const requestHostOrigin = getRequestHostOrigin(req);
  if (requestHostOrigin) {
    allowedOrigins.add(requestHostOrigin);
  }

  if (!allowedOrigins.size) {
    return true;
  }

  return allowedOrigins.has(requestOrigin);
}

function parseJsonBody(req) {
  if (!req) {
    return Promise.resolve({});
  }
  if (typeof req.body === "object" && req.body !== null) {
    return Promise.resolve(req.body);
  }
  if (typeof req.body === "string") {
    return Promise.resolve(safeJsonParse(req.body));
  }

  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      resolve(safeJsonParse(raw));
    });
    req.on("error", () => resolve({}));
  });
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value || "{}");
  } catch (error) {
    return {};
  }
}

function signPayload(payload, secret) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createSignature(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

function createSignature(value, secret) {
  return crypto.createHmac("sha256", secret).update(String(value)).digest("base64url");
}

function parseCookies(headerValue) {
  return String(headerValue || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((accumulator, part) => {
      const separatorIndex = part.indexOf("=");
      if (separatorIndex === -1) {
        return accumulator;
      }
      const key = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();
      accumulator[key] = value;
      return accumulator;
    }, {});
}

function getConfiguredOrigins() {
  return String(process.env.SITE_URL || "")
    .split(",")
    .map((value) => normalizeOrigin(value))
    .filter(Boolean);
}

function getRequestHostOrigin(req) {
  const headers = req && req.headers ? req.headers : {};
  const host = String(headers["x-forwarded-host"] || headers.host || "").trim();
  const protocol = String(headers["x-forwarded-proto"] || "https").trim() || "https";
  if (!host) {
    return "";
  }
  return normalizeOrigin(`${protocol}://${host}`);
}

function timingSafeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

module.exports = {
  COOKIE_NAME,
  buildClearedSessionCookie,
  buildSessionCookie,
  createAdminSession,
  getAdminPassword,
  getSessionSecret,
  isAllowedOrigin,
  parseJsonBody,
  readAdminSessionFromRequest
};
