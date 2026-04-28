const {
  getSessionSecret,
  readAdminSessionFromRequest
} = require("../lib/admin-auth");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sessionSecret = getSessionSecret();
  if (!sessionSecret) {
    return res.status(200).json({ authenticated: false, configured: false });
  }

  const session = readAdminSessionFromRequest(req, sessionSecret);
  return res.status(200).json({
    authenticated: Boolean(session.valid),
    configured: true
  });
};
