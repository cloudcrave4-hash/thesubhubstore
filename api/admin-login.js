const {
  buildSessionCookie,
  createAdminSession,
  getAdminPassword,
  getSessionSecret,
  isAllowedOrigin,
  parseJsonBody
} = require("../lib/admin-auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ error: "Origin not allowed" });
  }

  const adminPassword = getAdminPassword();
  const sessionSecret = getSessionSecret();
  if (!adminPassword || !sessionSecret) {
    return res.status(500).json({ error: "Admin auth is not configured on the server." });
  }

  const body = await parseJsonBody(req);
  const submittedPassword = String(body.password || "");
  if (!submittedPassword) {
    return res.status(400).json({ error: "Password is required." });
  }

  if (submittedPassword !== adminPassword) {
    return res.status(401).json({ error: "Wrong admin password." });
  }

  const sessionToken = createAdminSession(sessionSecret);
  res.setHeader("Set-Cookie", buildSessionCookie(sessionToken));
  return res.status(200).json({ authenticated: true });
};
