exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const allowedOrigin = normalizeOrigin(process.env.SITE_URL);
  const requestOrigin = normalizeOrigin(event.headers.origin || event.headers.Origin || "");
  if (allowedOrigin && requestOrigin && allowedOrigin !== requestOrigin) {
    return jsonResponse(403, { error: "Origin not allowed" });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return jsonResponse(200, { sent: false, disabled: true });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (error) {
    return jsonResponse(400, { error: "Invalid JSON body" });
  }

  if (!payload.orderId || !payload.product || !payload.customerName) {
    return jsonResponse(400, { error: "Missing required order fields" });
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

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(discordBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    return jsonResponse(502, { error: `Discord webhook failed: ${errorText || response.status}` });
  }

  return jsonResponse(200, { sent: true });
};

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };
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
