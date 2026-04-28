const {
  buildClearedSessionCookie,
  isAllowedOrigin
} = require("../lib/admin-auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ error: "Origin not allowed" });
  }

  res.setHeader("Set-Cookie", buildClearedSessionCookie());
  return res.status(200).json({ signedOut: true });
};
