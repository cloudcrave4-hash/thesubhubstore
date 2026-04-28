module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const allowedOrigin = normalizeOrigin(process.env.SITE_URL);
  const requestOrigin = normalizeOrigin(req.headers.origin || "");
  if (allowedOrigin && requestOrigin && allowedOrigin !== requestOrigin) {
    return res.status(403).json({ error: "Origin not allowed" });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(200).json({ sent: false, disabled: true });
  }

  const payload = typeof req.body === "string" ? safeJsonParse(req.body) : (req.body || {});
  if (!payload || !payload.orderId || !payload.product || !payload.customerName) {
    return res.status(400).json({ error: "Missing required order fields" });
  }

  const discordBody = {
    username: "ThesHubHub Orders",
    embeds: [
      {
        title: "New ThesHubHub Order",
        color: 0x38bdf8,
        fields: [
          { name: "Order ID", value: safeValue(payload.orderId), inline: true },
          { name: "Status", value: safeValue(payload.status || "Pending"), inline: true },
          { name: "Date", value: safeValue(formatDate(payload.createdAt)), inline: true },
          { name: "Category", value: safeValue(payload.category), inline: true },
          { name: "Product", value: safeValue(payload.product), inline: true },
          { name: "Price", value: safeValue(payload.price || "N/A"), inline: true },
          { name: "Customer", value: safeValue(payload.customerName), inline: true },
          { name: "Phone / WhatsApp", value: safeValue(payload.phone || "N/A"), inline: true },
          { name: "Email", value: safeValue(payload.email || "N/A"), inline: false },
          { name: "PUBG UID", value: safeValue(payload.pubgUid || "N/A"), inline: true },
          { name: "MLBB User ID", value: safeValue(payload.mlbbUserId || "N/A"), inline: true },
          { name: "MLBB Region ID", value: safeValue(payload.mlbbRegionId || "N/A"), inline: true },
          { name: "Screenshot", value: safeValue(buildScreenshotValue(payload)), inline: false },
          { name: "Note", value: safeValue(payload.note || "N/A"), inline: false }
        ],
        footer: {
          text: "ThesHubHub Discord admin alert"
        }
      }
    ]
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(discordBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(502).json({ error: `Discord webhook failed: ${errorText || response.status}` });
    }

    return res.status(200).json({ sent: true });
  } catch (error) {
    return res.status(500).json({ error: error && error.message ? error.message : "Unexpected server error" });
  }
};

function safeJsonParse(value) {
  try {
    return JSON.parse(value || "{}");
  } catch (error) {
    return null;
  }
}

function safeValue(value) {
  const text = String(value || "").trim();
  return text ? text.slice(0, 1024) : "N/A";
}

function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toISOString();
}

function buildScreenshotValue(payload) {
  if (payload.screenshotUrl) {
    return `${payload.screenshotFilename || "Screenshot"}\n${payload.screenshotUrl}`;
  }

  return payload.screenshotFilename || "N/A";
}

function normalizeOrigin(value) {
  try {
    return new URL(String(value || "").trim()).origin;
  } catch (error) {
    return "";
  }
}
