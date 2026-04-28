const APP_CONFIG = window.ThesHubHubConfig || {};
const DEFAULT_ADMIN_PASSWORD = "admin555";
const ADMIN_MAX_FAILED_ATTEMPTS = 5;
const ADMIN_LOCKOUT_MS = 60 * 1000;
const ADMIN_INACTIVITY_MS = 10 * 60 * 1000;
const STORE_EMAIL = readPublicConfig("storeEmail", "theshubhub@gmail.com");
const FORM_SUBMIT_URL = readPublicConfig("formSubmitUrl", `https://formsubmit.co/${STORE_EMAIL}`);
const ADMIN_PASSWORD = readSensitiveConfig("adminPassword", DEFAULT_ADMIN_PASSWORD);

const NETLIFY_FORM_NAME = "theshubhub-orders";
const DISCORD_FUNCTION_PATH = "/api/discord-order"; // Vercel route (was /.netlify/functions/discord-order)

const SUPABASE_CONFIG = {
  url: readPublicConfig("supabaseUrl", "https://rfnfjuwuzihjxgamnyou.supabase.co"),
  publishableKey: readPublicConfig("supabasePublishableKey", "sb_publishable_Y4aG9YCLOoX0mqtGL5yJfw_-fZolStZ"),
  ordersTable: "orders",
  screenshotsBucket: "payment-screenshots",
  settingsTable: "store_settings",
  assetsBucket: "store-assets",
  paymentSettingsKey: "payment"
};

function readPublicConfig(key, fallback) {
  const value = String(APP_CONFIG[key] || "").trim();
  if (!value || /^%[A-Z0-9_]+%$/i.test(value)) {
    return fallback;
  }
  return value;
}

function readSensitiveConfig(key, fallback) {
  const value = String(APP_CONFIG[key] || "").trim();
  if (!value || /^%[A-Z0-9_]+%$/i.test(value)) {
    return fallback;
  }
  return value;
}

const STORAGE_KEYS = {
  orders: "orders",
  customProducts: "customProducts",
  productEdits: "productEdits",
  hiddenProducts: "hiddenProducts",
  coupons: "coupons",
  pay: "pay",
  qr: "qr"
};

const categories = {
  pubg: { label: "PUBG UC", art: "art-pubg", logo: "UC" },
  mlbb: { label: "MLBB Diamonds", art: "art-mlbb", logo: "D" },
  spotify: { label: "Spotify Premium", art: "art-spotify", logo: "S" },
  netflix: { label: "Netflix Plans", art: "art-netflix", logo: "N" },
  discord: { label: "Discord Nitro / Giftcards", art: "art-discord", logo: "NITRO" }
};

const baseProducts = [
  { id: "pubg-60", category: "pubg", name: "60 UC", price: "Rs 150", description: "PUBG UC top-up with golden UC coin styling." },
  { id: "pubg-325", category: "pubg", name: "325 UC", price: "Rs 770", description: "Popular starter UC package for quick in-game purchases." },
  { id: "pubg-660", category: "pubg", name: "660 UC", price: "Rs 1500", description: "Balanced UC bundle for crates, skins, and event items." },
  { id: "pubg-1800", category: "pubg", name: "1800 UC", price: "Rs 3700", description: "Mid-tier UC package for regular players." },
  { id: "pubg-3850", category: "pubg", name: "3850 UC", price: "Rs 7300", description: "High-value UC package for bigger top-ups." },
  { id: "pubg-8100", category: "pubg", name: "8100 UC", price: "Rs 14500", description: "Large UC bundle for premium in-game spending." },

  { id: "mlbb-55", category: "mlbb", name: "55 Diamonds", price: "NPR 155", description: "Small MLBB diamond top-up with blue diamond badge art." },
  { id: "mlbb-172", category: "mlbb", name: "172 Diamonds", price: "NPR 430", description: "Quick diamond refill for Mobile Legends players." },
  { id: "mlbb-344", category: "mlbb", name: "344 Diamonds", price: "NPR 860", description: "Balanced MLBB diamond top-up package." },
  { id: "mlbb-706", category: "mlbb", name: "706 Diamonds", price: "NPR 1700", description: "Mid-size diamond package for skins and events." },
  { id: "mlbb-1160", category: "mlbb", name: "1160 Diamonds", price: "NPR 2899", description: "Large diamond top-up for active MLBB players." },
  { id: "mlbb-2195", category: "mlbb", name: "2195 Diamonds", price: "NPR 5089", description: "Premium MLBB diamond package." },
  { id: "mlbb-3688", category: "mlbb", name: "3688 Diamonds", price: "NPR 8450", description: "High-value diamond bundle for bigger purchases." },
  { id: "mlbb-5532", category: "mlbb", name: "5532 Diamonds", price: "NPR 12800", description: "Large MLBB diamond package." },
  { id: "mlbb-9288", category: "mlbb", name: "9288 Diamonds", price: "NPR 21100", description: "Maximum listed MLBB diamond top-up." },
  { id: "mlbb-weekly", category: "mlbb", name: "Weekly Pass", price: "NPR 270", description: "MLBB weekly pass activation." },
  { id: "mlbb-weekly-2", category: "mlbb", name: "2x Weekly Pass", price: "NPR 550", description: "Two MLBB weekly pass activations." },
  { id: "mlbb-weekly-3", category: "mlbb", name: "3x Weekly Pass", price: "NPR 830", description: "Three MLBB weekly pass activations." },
  { id: "mlbb-twilight", category: "mlbb", name: "Twilight Pass", price: "NPR 1400", description: "MLBB Twilight Pass package." },

  { id: "spotify-individual", category: "spotify", name: "Individual", price: "NPR 199", description: "Spotify Premium individual plan." },
  { id: "spotify-duo", category: "spotify", name: "Duo", price: "NPR 899", description: "Spotify Premium duo plan." },
  { id: "spotify-family", category: "spotify", name: "Family", price: "NPR 1300", description: "Spotify Premium family plan." },

  { id: "netflix-1", category: "netflix", name: "1 Screen", price: "NPR 449", description: "Netflix plan with single red N card art." },
  { id: "netflix-2", category: "netflix", name: "2 Screen", price: "NPR 900", description: "Netflix plan for two screens." },
  { id: "netflix-5", category: "netflix", name: "5 Screen", price: "NPR 2000", description: "Netflix plan for five screens." },
  { id: "netflix-2-months", category: "netflix", name: "2 Months Plan", price: "NPR 900", description: "Two-month Netflix plan." },
  { id: "netflix-3-months", category: "netflix", name: "3 Months Plan", price: "NPR 1250", description: "Three-month Netflix plan." },

  { id: "discord-1", category: "discord", name: "Discord Nitro 1 Month", price: "NPR 199", description: "Nitro-style purple digital badge package." },
  { id: "discord-3", category: "discord", name: "Discord Nitro 3 Months", price: "NPR 449", description: "Three-month Nitro-style digital package." },
  { id: "steam-giftcard", category: "discord", name: "Steam Giftcard", price: "Editable by admin", description: "Giftcard price can be changed from Admin." }
];

const state = {
  currentView: "home",
  selectedProductId: "",
  appliedCouponCode: "",
  activeCoupon: null,
  orderFilter: "all",
  adminOrderFilter: "all",
  adminUnlocked: false,
  adminRefreshTimer: null,
  adminHasOrderBaseline: false,
  adminKnownOrderIds: new Set(),
  adminTitleOriginal: document.title,
  adminUser: null,
  adminAuthMode: "none",
  adminFailedAttempts: 0,
  adminCooldownUntil: 0,
  adminInactivityTimer: null,
  purchasePopupTimer: null,
  purchasePopupMessages: [],
  purchasePopupIndex: 0,
  supabase: {
    client: null,
    ready: false,
    message: "Supabase is not active.",
    adminOrders: []
  }
};

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  void initApp();
});

async function initApp() {
  cacheElements();
  populateAdminCategorySelect();
  populateCouponCategorySelect();
  updateAdminAlertButton();
  initializeSupabase();
  configureAdminLoginUi();
  await loadPaymentSettings();
  renderProducts();
  renderAdminCoupons();
  startPurchasePopupLoop();
  bindEvents();
  await syncLocalOrdersFromSupabase();
  renderOrders();
  showView("home");
  runSmokeTests();
}

function cacheElements() {
  els.navLinks = Array.from(document.querySelectorAll(".nav-link"));
  els.checkoutForm = document.querySelector("#checkoutForm");
  els.checkoutCategory = document.querySelector("#checkoutCategory");
  els.checkoutProduct = document.querySelector("#checkoutProduct");
  els.pubgFields = document.querySelector("#pubgFields");
  els.mlbbFields = document.querySelector("#mlbbFields");
  els.pubgUid = document.querySelector("#pubgUid");
  els.mlbbUserId = document.querySelector("#mlbbUserId");
  els.mlbbRegionId = document.querySelector("#mlbbRegionId");
  els.emailOrderId = document.querySelector("#emailOrderId");
  els.emailCategoryLabel = document.querySelector("#emailCategoryLabel");
  els.emailProductName = document.querySelector("#emailProductName");
  els.emailPrice = document.querySelector("#emailPrice");
  els.paymentScreenshot = document.querySelector("#paymentScreenshot");
  els.couponCode = document.querySelector("#couponCode");
  els.applyCoupon = document.querySelector("#applyCoupon");
  els.summaryOriginal = document.querySelector("#summaryOriginal");
  els.summaryDiscount = document.querySelector("#summaryDiscount");
  els.summaryTotal = document.querySelector("#summaryTotal");
  els.couponStatus = document.querySelector("#couponStatus");
  els.checkoutSubmit = els.checkoutForm ? els.checkoutForm.querySelector('button[type="submit"]') : null;
  els.ordersList = document.querySelector("#ordersList");
  els.orderEmailNotice = document.querySelector("#orderEmailNotice");
  els.orderSearch = document.querySelector("#orderSearch");
  els.adminOrderTabs = Array.from(document.querySelectorAll("[data-admin-status]"));
  els.adminLogin = document.querySelector("#adminLogin");
  els.adminTools = document.querySelector("#adminTools");
  els.adminEmailField = document.querySelector("#adminEmailField");
  els.adminEmail = document.querySelector("#adminEmail");
  els.adminPassword = document.querySelector("#adminPassword");
  els.adminUnlock = document.querySelector("#adminUnlock");
  els.adminUnlockPassword = document.querySelector("#adminUnlockPassword");
  els.localAdminLogin = document.querySelector("#localAdminLogin");
  els.adminAuthNote = document.querySelector("#adminAuthNote");
  els.adminSignOut = document.querySelector("#adminSignOut");
  els.addProductForm = document.querySelector("#addProductForm");
  els.editProductForm = document.querySelector("#editProductForm");
  els.adminProductSelect = document.querySelector("#adminProductSelect");
  els.removeProduct = document.querySelector("#removeProduct");
  els.restoreProducts = document.querySelector("#restoreProducts");
  els.paymentForm = document.querySelector("#paymentForm");
  els.couponForm = document.querySelector("#couponForm");
  els.adminCouponList = document.querySelector("#adminCouponList");
  els.qrUpload = document.querySelector("#qrUpload");
  els.removeQr = document.querySelector("#removeQr");
  els.clearOrders = document.querySelector("#clearOrders");
  els.enableAdminAlerts = document.querySelector("#enableAdminAlerts");
  els.refreshAdminOrders = document.querySelector("#refreshAdminOrders");
  els.adminOrdersList = document.querySelector("#adminOrdersList");
  els.adminOrdersHint = document.querySelector("#adminOrdersHint");
  els.adminToast = document.querySelector("#adminToast");
  els.payWallet = document.querySelector("#payWallet");
  els.payBank = document.querySelector("#payBank");
  els.payAccount = document.querySelector("#payAccount");
  els.qrBox = document.querySelector("#qrBox");
  els.productModal = document.querySelector("#productModal");
  els.closeProductModal = document.querySelector("#closeProductModal");
  els.productModalArt = document.querySelector("#productModalArt");
  els.productModalCategory = document.querySelector("#productModalCategory");
  els.productModalTitle = document.querySelector("#productModalTitle");
  els.productModalDescription = document.querySelector("#productModalDescription");
  els.productModalPrice = document.querySelector("#productModalPrice");
  els.productModalDelivery = document.querySelector("#productModalDelivery");
  els.productModalRequired = document.querySelector("#productModalRequired");
  els.productModalRefund = document.querySelector("#productModalRefund");
  els.productModalInstructions = document.querySelector("#productModalInstructions");
  els.modalBuyNow = document.querySelector("#modalBuyNow");
  els.purchasePopup = document.querySelector("#purchasePopup");
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const viewButton = event.target.closest("[data-view]");
    if (viewButton) {
      showView(viewButton.dataset.view);
    }

    const buyButton = event.target.closest("[data-buy-id]");
    if (buyButton) {
      startCheckout(buyButton.dataset.buyId);
    }

    const buyAgain = event.target.closest("[data-buy-again]");
    if (buyAgain) {
      startCheckout(buyAgain.dataset.buyAgain);
    }

    const adminAction = event.target.closest("[data-admin-order]");
    if (adminAction) {
      void handleAdminOrderAction(adminAction);
    }

    const couponAction = event.target.closest("[data-coupon-action]");
    if (couponAction) {
      handleCouponAction(couponAction);
      return;
    }

    const modalClose = event.target.closest("[data-close-modal]");
    if (modalClose) {
      closeProductModal();
      return;
    }

    const productCard = event.target.closest(".product-card");
    if (productCard && !event.target.closest("button, a, input, select, textarea, label")) {
      openProductModal(productCard.dataset.productId);
    }
  });

  els.checkoutProduct.addEventListener("change", () => {
    state.selectedProductId = els.checkoutProduct.value;
    resetCouponState({ preserveCode: false });
    updateCheckoutSummary();
  });

  els.checkoutCategory.addEventListener("change", () => {
    updateConditionalCheckoutFields();
    resetCouponState({ preserveCode: false });
    updateCheckoutSummary();
  });
  els.checkoutForm.addEventListener("submit", (event) => {
    void handleCheckoutSubmit(event);
  });
  if (els.couponCode) {
    els.couponCode.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        applyCheckoutCoupon();
      }
    });
  }
  if (els.applyCoupon) {
    els.applyCoupon.addEventListener("click", () => {
      applyCheckoutCoupon();
    });
  }
  els.orderSearch.addEventListener("input", renderOrders);
  document.querySelectorAll(".tab").forEach((tab) => {
    if (tab.dataset.status) {
      tab.addEventListener("click", () => {
        state.orderFilter = tab.dataset.status;
        document.querySelectorAll(".tab[data-status]").forEach((item) => item.classList.toggle("active", item === tab));
        renderOrders();
      });
    }
  });

  els.adminOrderTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      state.adminOrderFilter = tab.dataset.adminStatus;
      els.adminOrderTabs.forEach((item) => item.classList.toggle("active", item === tab));
      void renderAdminOrders();
    });
  });

  if (els.adminUnlockPassword) {
    els.adminUnlockPassword.addEventListener("click", () => {
      void unlockAdmin();
    });
  }
  if (els.adminPassword) {
    els.adminPassword.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        void unlockAdmin();
      }
    });
  }
  els.addProductForm.addEventListener("submit", handleAddProduct);
  els.editProductForm.addEventListener("submit", handleEditProduct);
  els.adminProductSelect.addEventListener("change", fillAdminEditForm);
  els.removeProduct.addEventListener("click", handleRemoveProduct);
  els.restoreProducts.addEventListener("click", handleRestoreProducts);
  els.paymentForm.addEventListener("submit", (event) => {
    void handlePaymentSave(event);
  });
  if (els.couponForm) {
    els.couponForm.addEventListener("submit", handleCouponSave);
  }
  els.removeQr.addEventListener("click", () => {
    void removeQr();
  });
  els.clearOrders.addEventListener("click", () => {
    void clearOrders();
  });
  if (els.refreshAdminOrders) {
    els.refreshAdminOrders.addEventListener("click", () => {
      void refreshAdminOrders(true);
    });
  }
  if (els.enableAdminAlerts) {
    els.enableAdminAlerts.addEventListener("click", () => {
      void requestAdminNotificationPermission();
    });
  }
  if (els.adminSignOut) {
    els.adminSignOut.addEventListener("click", () => {
      void signOutAdmin();
    });
  }
  if (els.closeProductModal) {
    els.closeProductModal.addEventListener("click", closeProductModal);
  }
  if (els.modalBuyNow) {
    els.modalBuyNow.addEventListener("click", () => {
      if (state.selectedProductId) {
        closeProductModal();
        startCheckout(state.selectedProductId);
      }
    });
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && els.productModal && !els.productModal.classList.contains("hidden")) {
      closeProductModal();
    }
  });
  ["click", "keydown", "pointerdown", "touchstart"].forEach((eventName) => {
    document.addEventListener(eventName, () => {
      noteAdminActivity();
    }, { passive: true });
  });
}

function initializeSupabase() {
  const clientFactory = window.supabase && typeof window.supabase.createClient === "function"
    ? window.supabase.createClient
    : null;

  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.publishableKey) {
    state.supabase.message = "Supabase keys are missing.";
    return;
  }

  if (!clientFactory) {
    state.supabase.message = "Supabase client did not load. The site will keep using browser storage only.";
    return;
  }

  state.supabase.client = clientFactory(SUPABASE_CONFIG.url, SUPABASE_CONFIG.publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
  state.supabase.ready = true;
  state.supabase.message = "Supabase orders and shared payment settings are enabled.";
}

function isLocalPreview() {
  return window.location.protocol === "file:" || /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname || "");
}

function canManageAdminData() {
  return state.adminUnlocked;
}

function canManageCloudAdminData() {
  return state.adminUnlocked;
}

function configureAdminLoginUi() {
  if (els.adminEmailField) {
    els.adminEmailField.classList.add("hidden");
  }
  if (els.localAdminLogin) {
    els.localAdminLogin.classList.remove("hidden");
  }

  if (els.adminAuthNote) {
    els.adminAuthNote.textContent = "Enter your admin password to access the admin panel. The session locks after inactivity.";
  }

  if (els.adminSignOut) {
    els.adminSignOut.classList.add("hidden");
  }
}

async function restoreAdminAccess() {
  return undefined;
}

function unlockAdminUi(mode, user = null) {
  state.adminUnlocked = true;
  state.adminAuthMode = mode;
  state.adminUser = user;
  state.adminFailedAttempts = 0;
  state.adminCooldownUntil = 0;
  state.adminHasOrderBaseline = false;
  state.adminKnownOrderIds = new Set();
  els.adminLogin.classList.add("hidden");
  els.adminTools.classList.remove("hidden");
  if (els.adminSignOut) {
    els.adminSignOut.classList.remove("hidden");
  }
  if (els.adminPassword) {
    els.adminPassword.value = "";
  }
  updateAdminAlertButton();
  resetAdminInactivityTimer();
  startAdminOrdersAutoRefresh();
  void refreshAdminOrders(true);
}

function lockAdminUi() {
  state.adminUnlocked = false;
  state.adminAuthMode = "none";
  state.adminUser = null;
  state.adminHasOrderBaseline = false;
  state.adminKnownOrderIds = new Set();
  els.adminLogin.classList.remove("hidden");
  els.adminTools.classList.add("hidden");
  if (els.adminSignOut) {
    els.adminSignOut.classList.add("hidden");
  }
  if (els.adminPassword) {
    els.adminPassword.value = "";
  }
  if (els.adminAuthNote) {
    els.adminAuthNote.textContent = "Enter your admin password to access the admin panel. The session locks after inactivity.";
  }
  stopAdminInactivityTimer();
  stopAdminOrdersAutoRefresh();
  resetAdminTitle();
}

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn(`Could not read ${key}`, error);
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getAllProducts(options = {}) {
  const customProducts = readJson(STORAGE_KEYS.customProducts, []);
  const productEdits = readJson(STORAGE_KEYS.productEdits, {});
  const hiddenProducts = readJson(STORAGE_KEYS.hiddenProducts, []);
  const merged = [...baseProducts, ...customProducts].map((product) => applyProductEdit(product, productEdits[product.id]));

  if (options.includeHidden) {
    return merged;
  }

  return merged.filter((product) => !hiddenProducts.includes(product.id));
}

function applyProductEdit(product, edit) {
  return edit ? { ...product, ...edit } : { ...product };
}

function isProductHidden(productId, hiddenIds) {
  return hiddenIds.includes(productId);
}

function getProductById(id, options = {}) {
  return getAllProducts(options).find((product) => product.id === id);
}

function getLocalPaymentSettings() {
  const pay = readJson(STORAGE_KEYS.pay, {});
  const qrValue = localStorage.getItem(STORAGE_KEYS.qr) || "";
  return {
    wallet: pay.wallet || "",
    bank: pay.bank || "",
    account: pay.account || "",
    qrUrl: qrValue,
    qrPath: pay.qrPath || ""
  };
}

function cachePaymentSettingsLocally(settings) {
  const localPay = {
    wallet: settings.wallet || "",
    bank: settings.bank || "",
    account: settings.account || "",
    qrPath: settings.qrPath || ""
  };
  writeJson(STORAGE_KEYS.pay, localPay);

  if (settings.qrUrl) {
    localStorage.setItem(STORAGE_KEYS.qr, settings.qrUrl);
  } else {
    localStorage.removeItem(STORAGE_KEYS.qr);
  }
}

function applyPaymentSettingsToUi(settings) {
  els.payWallet.textContent = settings.wallet || "Not set";
  els.payBank.textContent = settings.bank || "Not set";
  els.payAccount.textContent = settings.account || "Not set";

  if (els.paymentForm) {
    els.paymentForm.elements.wallet.value = settings.wallet || "";
    els.paymentForm.elements.bank.value = settings.bank || "";
    els.paymentForm.elements.account.value = settings.account || "";
  }

  renderQr(settings.qrUrl || "");
}

function getLocalOrders() {
  return readJson(STORAGE_KEYS.orders, []);
}

function saveLocalOrders(orders) {
  const normalized = [...orders].sort((left, right) => getOrderTimestamp(right) - getOrderTimestamp(left));
  writeJson(STORAGE_KEYS.orders, normalized);
}

function upsertLocalOrder(order) {
  const orders = getLocalOrders();
  const index = orders.findIndex((item) => item.id === order.id);

  if (index >= 0) {
    orders[index] = { ...orders[index], ...order };
  } else {
    orders.unshift(order);
  }

  saveLocalOrders(orders);
}

function getOrderTimestamp(order) {
  const time = new Date(order.createdAt || 0).getTime();
  return Number.isFinite(time) ? time : 0;
}

function getCoupons() {
  const stored = readJson(STORAGE_KEYS.coupons, null);
  if (Array.isArray(stored) && stored.length) {
    return stored.map(normalizeCoupon).filter(Boolean);
  }

  const defaults = getDefaultCoupons();
  writeJson(STORAGE_KEYS.coupons, defaults);
  return defaults;
}

function saveCoupons(coupons) {
  writeJson(STORAGE_KEYS.coupons, coupons.map(normalizeCoupon).filter(Boolean));
}

function getDefaultCoupons() {
  return [
    { code: "WELCOME10", type: "percent", value: 10, category: "all", active: true },
    { code: "MLBB5", type: "percent", value: 5, category: "mlbb", active: true },
    { code: "PUBG50", type: "fixed", value: 50, category: "pubg", active: true }
  ];
}

function normalizeCoupon(coupon) {
  const code = String(coupon && coupon.code || "").trim().toUpperCase();
  const type = String(coupon && coupon.type || "percent").trim().toLowerCase() === "fixed" ? "fixed" : "percent";
  const category = categories[coupon && coupon.category] ? coupon.category : "all";
  const value = Number(coupon && coupon.value || 0);

  if (!code || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return {
    code,
    type,
    value,
    category,
    active: coupon && coupon.active !== false
  };
}

function populateCouponCategorySelect() {
  if (!els.couponForm) {
    return;
  }

  const select = els.couponForm.elements.category;
  if (!select) {
    return;
  }

  select.innerHTML = '<option value="all">All Categories</option>';
  Object.entries(categories).forEach(([value, category]) => {
    select.add(new Option(category.label, value));
  });
}

function renderProducts() {
  Object.keys(categories).forEach((category) => {
    const grid = document.querySelector(`[data-products="${category}"]`);
    if (!grid) {
      return;
    }

    grid.innerHTML = "";
    getAllProducts()
      .filter((product) => product.category === category)
      .forEach((product) => grid.appendChild(createProductCard(product)));

    if (!grid.children.length) {
      grid.innerHTML = '<div class="empty-state">No products available in this category.</div>';
    }
  });

  refreshAdminProductSelect();
  refreshPurchasePopupMessages();
}

function createProductCard(product) {
  const template = document.querySelector("#productCardTemplate");
  const card = template.content.firstElementChild.cloneNode(true);
  const category = categories[product.category];
  const art = card.querySelector(".product-art");
  const tags = card.querySelector(".product-tags");

  art.classList.add(category.art);
  art.appendChild(createProductLogo(product));
  card.dataset.productId = product.id;

  getProductBadges(product).forEach((badge) => {
    const chip = document.createElement("span");
    chip.className = `product-tag ${badge.variant}`;
    chip.textContent = badge.label;
    tags.appendChild(chip);
  });

  card.querySelector("h3").textContent = product.name;
  card.querySelector("p").textContent = product.description || `${category.label} digital product.`;
  card.querySelector("strong").textContent = product.price;
  card.querySelector(".buy-button").dataset.buyId = product.id;

  return card;
}

function createProductLogo(product) {
  const logo = document.createElement("div");
  logo.className = `shop-logo logo-${product.category}`;

  if (product.category === "pubg") {
    logo.innerHTML = `
      <img class="pubg-product-image" src="assets/pubg-uc-product.png" alt="PUBG UC top-up artwork">
      <span class="item-amount">${getProductAmount(product.name)} UC</span>
    `;
    return logo;
  }

  if (product.category === "mlbb") {
    const image = getMlbbProductImage(product);
    logo.innerHTML = `
      <img class="mlbb-product-image" src="${image.src}" alt="${image.alt}">
      <span class="item-amount">${getProductAmount(product.name)}</span>
    `;
    return logo;
  }

  if (product.category === "spotify") {
    logo.innerHTML = `
      <img class="spotify-product-image" src="assets/spotify-product.png" alt="Spotify product artwork">
      <span class="plan-chip">${getPlanShortName(product.name)}</span>
    `;
    return logo;
  }

  if (product.category === "netflix") {
    logo.innerHTML = `
      <img class="netflix-product-image" src="assets/netflix-product.png" alt="Red N logo on black background">
      <span class="plan-chip">${getPlanShortName(product.name)}</span>
    `;
    return logo;
  }

  if (product.id.includes("steam")) {
    logo.classList.add("logo-giftcard");
    logo.innerHTML = `
      <span class="gift-card-shape">
        <span class="gift-notch"></span>
        <span class="gift-band"></span>
        <span class="gift-label">GC</span>
      </span>
      <span class="plan-chip">Gift</span>
    `;
    return logo;
  }

  logo.innerHTML = `
    <span class="nitro-badge">
      <span class="nitro-spark left"></span>
      <span class="nitro-core">N</span>
      <span class="nitro-spark right"></span>
    </span>
    <span class="plan-chip">${getPlanShortName(product.name)}</span>
  `;
  return logo;
}

function getProductBadges(product) {
  const badges = [];
  const categoryProducts = getAllProducts({ includeHidden: true }).filter((item) => item.category === product.category);
  const prices = categoryProducts
    .map((item) => parsePrice(item.price))
    .filter((value) => Number.isFinite(value) && value > 0);
  const priceValue = parsePrice(product.price);
  const cheapest = prices.length ? Math.min(...prices) : null;

  if (isPopularProduct(product)) {
    badges.push({ label: "Popular", variant: "tag-popular" });
  }

  if (isBestValueProduct(product)) {
    badges.push({ label: "Best Value", variant: "tag-best" });
  }

  if (hasFastDelivery(product)) {
    badges.push({ label: "Fast Delivery", variant: "tag-fast" });
  }

  if (Number.isFinite(priceValue) && cheapest !== null && priceValue === cheapest) {
    badges.push({ label: "Cheapest", variant: "tag-cheap" });
  }

  return badges.slice(0, 2);
}

function isPopularProduct(product) {
  return [
    "pubg-325",
    "mlbb-706",
    "spotify-individual",
    "netflix-2",
    "discord-1"
  ].includes(product.id);
}

function isBestValueProduct(product) {
  return [
    "pubg-8100",
    "mlbb-5532",
    "spotify-family",
    "netflix-5",
    "discord-3"
  ].includes(product.id) || /weekly-3|twilight/i.test(product.id);
}

function hasFastDelivery(product) {
  return ["spotify", "netflix", "discord"].includes(product.category) || /weekly|twilight/i.test(product.name);
}

function getProductDetailContent(product) {
  const detailMap = {
    pubg: {
      delivery: "5 to 15 minutes after payment confirmation",
      required: "PUBG UID, full name, valid email, and payment screenshot.",
      refund: "Refunds can be reviewed only before the UC top-up is processed. Wrong UID submissions are not refundable after delivery.",
      instructions: "Double-check the PUBG UID, upload a clear payment screenshot, and keep your WhatsApp active for quick confirmation."
    },
    mlbb: {
      delivery: /weekly|twilight/i.test(product.name) ? "5 to 20 minutes after payment confirmation" : "5 to 15 minutes after payment confirmation",
      required: "MLBB User ID, Region ID, full name, valid email, and payment screenshot.",
      refund: "Refund requests are reviewed before diamonds or pass activation is completed. Incorrect MLBB ID / Region submissions cannot be reversed after delivery.",
      instructions: "Open Mobile Legends first, copy both your User ID and Region ID carefully, then upload a readable payment screenshot."
    },
    spotify: {
      delivery: "10 to 30 minutes after payment confirmation",
      required: "Full name, email, and payment screenshot.",
      refund: "Refunds are only possible before the premium upgrade is activated on the account.",
      instructions: "Use the same email you want us to contact about your Spotify plan and add any account notes before checkout."
    },
    netflix: {
      delivery: "10 to 30 minutes after payment confirmation",
      required: "Full name, email, and payment screenshot.",
      refund: "Refunds are reviewed before the plan or slot is delivered. Delivered plans are handled case by case.",
      instructions: "Choose the right screen or duration plan, then stay available on WhatsApp or email in case we need confirmation."
    },
    discord: {
      delivery: "10 to 30 minutes after payment confirmation",
      required: "Full name, email, and payment screenshot.",
      refund: "Refunds can be requested before Nitro or giftcard delivery. Delivered codes cannot be refunded once redeemed.",
      instructions: "Make sure your email is correct and add a note if the order is for Nitro or a specific Steam giftcard value."
    }
  };

  return detailMap[product.category] || {
    delivery: "5 to 30 minutes after payment confirmation",
    required: "Full name, valid email, and payment screenshot.",
    refund: "Refunds are reviewed before delivery is completed.",
    instructions: "Review your order details carefully before checkout."
  };
}

function openProductModal(productId) {
  const product = getProductById(productId, { includeHidden: true });
  if (!product || !els.productModal) {
    return;
  }

  state.selectedProductId = product.id;
  const details = getProductDetailContent(product);
  const art = document.createElement("div");
  art.className = `product-art modal-art ${categories[product.category].art}`;
  art.appendChild(createProductLogo(product));

  els.productModalArt.innerHTML = "";
  els.productModalArt.appendChild(art);
  els.productModalCategory.textContent = categories[product.category].label;
  els.productModalTitle.textContent = product.name;
  els.productModalDescription.textContent = product.description || `${categories[product.category].label} digital product.`;
  els.productModalPrice.textContent = product.price;
  els.productModalDelivery.textContent = details.delivery;
  els.productModalRequired.textContent = details.required;
  els.productModalRefund.textContent = details.refund;
  els.productModalInstructions.textContent = details.instructions;
  els.modalBuyNow.dataset.buyId = product.id;
  els.productModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeProductModal() {
  if (!els.productModal) {
    return;
  }

  els.productModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function parsePrice(price) {
  const numeric = Number(String(price || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : NaN;
}

function detectCurrencyLabel(price) {
  const value = String(price || "");
  if (/Rs/i.test(value)) {
    return "Rs";
  }
  if (/NPR/i.test(value)) {
    return "NPR";
  }
  return "";
}

function formatMoney(amount, currency) {
  if (!Number.isFinite(amount)) {
    return "-";
  }

  const normalized = Math.max(0, Math.round(amount));
  return `${currency ? `${currency} ` : ""}${normalized}`;
}

function getCheckoutPricing(product, couponOverride = state.activeCoupon) {
  if (!product) {
    return {
      originalPrice: "",
      discountAmount: 0,
      finalPrice: "",
      originalAmount: 0,
      finalAmount: 0,
      currency: ""
    };
  }

  const originalAmount = parsePrice(product.price);
  const currency = detectCurrencyLabel(product.price);
  let discountAmount = 0;

  if (couponOverride && isCouponApplicable(couponOverride, product) && Number.isFinite(originalAmount)) {
    discountAmount = couponOverride.type === "percent"
      ? Math.round((originalAmount * couponOverride.value) / 100)
      : Math.round(couponOverride.value);
    discountAmount = Math.min(discountAmount, originalAmount);
  }

  const finalAmount = Number.isFinite(originalAmount) ? Math.max(0, originalAmount - discountAmount) : NaN;
  return {
    originalPrice: product.price,
    discountAmount,
    finalPrice: Number.isFinite(finalAmount) ? formatMoney(finalAmount, currency) : product.price,
    originalAmount,
    finalAmount,
    currency
  };
}

function updateCheckoutSummary() {
  if (!els.summaryOriginal || !els.summaryDiscount || !els.summaryTotal) {
    return;
  }

  const product = getProductById(els.checkoutProduct.value);
  const pricing = getCheckoutPricing(product);
  els.summaryOriginal.textContent = product ? pricing.originalPrice : "-";
  els.summaryDiscount.textContent = pricing.discountAmount > 0
    ? `-${formatMoney(pricing.discountAmount, pricing.currency)}`
    : formatMoney(0, pricing.currency || detectCurrencyLabel(product && product.price));
  els.summaryTotal.textContent = product ? pricing.finalPrice : "-";

  if (!product) {
    setCouponStatus("Select a product to see pricing.", false);
    return;
  }

  if (state.activeCoupon) {
    setCouponStatus(`${state.activeCoupon.code} applied successfully.`, true);
  } else if (els.couponCode && els.couponCode.value.trim()) {
    setCouponStatus("Coupon not applied yet.", false);
  } else {
    setCouponStatus("Add a coupon code if you have one.", false);
  }
}

function setCouponStatus(message, isSuccess) {
  if (!els.couponStatus) {
    return;
  }

  els.couponStatus.textContent = message;
  els.couponStatus.classList.toggle("success", Boolean(isSuccess));
}

function resetCouponState(options = {}) {
  state.activeCoupon = null;
  state.appliedCouponCode = "";
  if (els.couponCode && !options.preserveCode) {
    els.couponCode.value = "";
  }
}

function isCouponApplicable(coupon, product) {
  return Boolean(coupon && product && coupon.active && (coupon.category === "all" || coupon.category === product.category));
}

function findCouponByCode(code) {
  return getCoupons().find((coupon) => coupon.code === String(code || "").trim().toUpperCase()) || null;
}

function applyCheckoutCoupon() {
  const code = String(els.couponCode && els.couponCode.value || "").trim().toUpperCase();
  const product = getProductById(els.checkoutProduct.value);

  if (!code) {
    resetCouponState({ preserveCode: true });
    updateCheckoutSummary();
    setCouponStatus("Enter a coupon code first.", false);
    return;
  }

  const coupon = findCouponByCode(code);
  if (!coupon || !coupon.active) {
    resetCouponState({ preserveCode: true });
    updateCheckoutSummary();
    setCouponStatus("That coupon code is not active.", false);
    return;
  }

  if (!isCouponApplicable(coupon, product)) {
    resetCouponState({ preserveCode: true });
    updateCheckoutSummary();
    setCouponStatus("That coupon is not valid for this category.", false);
    return;
  }

  state.activeCoupon = coupon;
  state.appliedCouponCode = coupon.code;
  if (els.couponCode) {
    els.couponCode.value = coupon.code;
  }
  updateCheckoutSummary();
}

function getProductAmount(name) {
  const match = String(name).match(/\d+\s*x?|\d+/i);
  return match ? match[0].trim() : "PASS";
}

function getMlbbProductImage(product) {
  if (/weekly|twilight/i.test(product.name)) {
    return {
      src: "assets/mlbb-pass-product.png",
      alt: "MLBB weekly and twilight pass artwork"
    };
  }

  return {
    src: "assets/mlbb-product.png",
    alt: "MLBB diamonds top-up artwork"
  };
}

function getPlanShortName(name) {
  const clean = String(name).replace(/Discord Nitro|Netflix|Spotify|Premium|Plan/gi, "").trim();
  if (/Individual/i.test(clean)) return "IND";
  if (/Family/i.test(clean)) return "FAM";
  if (/Duo/i.test(clean)) return "DUO";
  if (/Twilight/i.test(clean)) return "PASS";
  if (/Months?/i.test(clean)) return clean.replace(/\s+/g, " ");
  const numbers = clean.match(/\d+\s*(Month|Screen|Months)?/i);
  return numbers ? numbers[0].replace(/\s+/g, " ") : clean.slice(0, 5).toUpperCase();
}

function showView(view) {
  state.currentView = view;
  closeProductModal();
  document.querySelectorAll(".section-view").forEach((section) => {
    const key = section.dataset.section;
    let visible = key === view;

    if (view === "home") {
      visible = key === "home" || key === "home-extra";
    }

    section.classList.toggle("hidden", !visible);
  });

  if (view === "orders") {
    renderOrders();
    void syncLocalOrdersFromSupabase({ rerender: true });
  }

  if (view === "admin") {
    startAdminOrdersAutoRefresh();
    noteAdminActivity();
    void refreshAdminOrders();
  } else {
    stopAdminInactivityTimer();
    stopAdminOrdersAutoRefresh();
  }

  els.navLinks.forEach((link) => link.classList.toggle("active", link.dataset.view === view));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function startCheckout(productId) {
  const product = getProductById(productId);
  if (!product) {
    alert("This product is currently unavailable.");
    return;
  }

  prepareCheckout(product.category, product.id);
  showView("checkout");
}

function prepareCheckout(category, productId) {
  const productList = getAllProducts().filter((product) => product.category === category);

  els.checkoutCategory.innerHTML = "";
  const categoryOption = new Option(categories[category].label, category);
  els.checkoutCategory.add(categoryOption);
  els.checkoutCategory.value = category;

  els.checkoutProduct.innerHTML = "";
  productList.forEach((product) => {
    const option = new Option(`${product.name} - ${product.price}`, product.id);
    els.checkoutProduct.add(option);
  });
  els.checkoutProduct.value = productId;
  state.selectedProductId = productId;
  updateConditionalCheckoutFields();
  resetCouponState({ preserveCode: false });
  updateCheckoutSummary();
}

function updateConditionalCheckoutFields() {
  const category = els.checkoutCategory.value;
  const isPubg = category === "pubg";
  const isMlbb = category === "mlbb";

  els.pubgFields.classList.toggle("active", isPubg);
  els.mlbbFields.classList.toggle("active", isMlbb);
  els.pubgUid.required = isPubg;
  els.mlbbUserId.required = isMlbb;
  els.mlbbRegionId.required = isMlbb;

  if (!isPubg) {
    els.pubgUid.value = "";
  }

  if (!isMlbb) {
    els.mlbbUserId.value = "";
    els.mlbbRegionId.value = "";
  }
}

function validateCheckoutData(data) {
  const required = ["category", "plan", "customer_name", "phone", "email"];
  const missing = required.filter((field) => !String(data[field] || "").trim());

  if (data.screenshotRequired !== false && !String(data.screenshotFilename || "").trim()) {
    missing.push("payment screenshot");
  }

  if (data.category === "pubg" && !String(data.pubg_uid || "").trim()) {
    missing.push("PUBG UID");
  }

  if (data.category === "mlbb") {
    if (!String(data.mlbb_user_id || "").trim()) {
      missing.push("MLBB User ID");
    }
    if (!String(data.mlbb_region_id || "").trim()) {
      missing.push("MLBB Region ID");
    }
  }

  return {
    valid: missing.length === 0,
    missing
  };
}

async function handleCheckoutSubmit(event) {
  event.preventDefault();

  const formData = new FormData(els.checkoutForm);
  const product = getProductById(formData.get("plan"));
  const screenshot = els.paymentScreenshot.files[0];
  const data = {
    category: formData.get("category"),
    plan: formData.get("plan"),
    customer_name: formData.get("customer_name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    pubg_uid: formData.get("pubg_uid"),
    mlbb_user_id: formData.get("mlbb_user_id"),
    mlbb_region_id: formData.get("mlbb_region_id"),
    screenshotFilename: screenshot ? screenshot.name : ""
  };
  const validation = validateCheckoutData(data);

  if (!validation.valid) {
    alert(`Please complete: ${validation.missing.join(", ")}`);
    return;
  }

  const pricing = getCheckoutPricing(product);
  const order = createOrderFromForm(formData, product, screenshot, pricing);
  let orderForUi = {
    ...order,
    backend: state.supabase.ready ? "supabase-pending" : "local",
    syncState: state.supabase.ready ? "local" : "local"
  };
  let syncSummary = "Order saved in this browser and sent to email.";
  let netlifySummary = getNetlifySummary("skipped-local");
  let discordSummary = getDiscordSummary("skipped-local");

  setCheckoutBusy(true);

  try {
    upsertLocalOrder(orderForUi);

    if (state.supabase.ready) {
      try {
        const syncedOrder = await syncOrderToSupabase(order, screenshot);
        orderForUi = {
          ...orderForUi,
          ...syncedOrder,
          backend: "supabase",
          syncState: "synced"
        };
        upsertLocalOrder(orderForUi);
        syncSummary = "Order saved in Supabase, kept in this browser, and sent to email.";
      } catch (error) {
        console.error("Supabase sync failed", error);
        orderForUi = {
          ...orderForUi,
          backend: "local",
          syncState: "failed",
          syncError: formatSupabaseError(error)
        };
        upsertLocalOrder(orderForUi);
        syncSummary = `Order stayed in this browser and email was sent, but Supabase sync failed: ${formatSupabaseError(error)}`;
      }
    }

    if (canSubmitToNetlify()) {
      try {
        await submitOrderToNetlify(orderForUi, screenshot);
        netlifySummary = getNetlifySummary("submitted");
      } catch (error) {
        console.error("Netlify capture failed", error);
        netlifySummary = `${getNetlifySummary("failed")} ${formatSupabaseError(error)}`;
      }
    }

    if (canUseRemoteBrowserFeatures()) {
      try {
        const discordResult = await submitOrderToDiscord(orderForUi);
        discordSummary = getDiscordSummary(discordResult && discordResult.sent ? "sent" : "disabled");
      } catch (error) {
        console.error("Discord notification failed", error);
        discordSummary = `${getDiscordSummary("failed")} ${formatSupabaseError(error)}`;
      }
    }

    submitOrderEmail(orderForUi);
    els.checkoutForm.reset();
    updateConditionalCheckoutFields();
    resetCouponState({ preserveCode: false });
    updateCheckoutSummary();
    refreshPurchasePopupMessages();
    renderOrders();

    if (state.adminUnlocked) {
      await renderAdminOrders();
    }

    showOrderEmailNotice(orderForUi, `${syncSummary} ${netlifySummary} ${discordSummary}`.trim());
    showView("orders");
  } finally {
    setCheckoutBusy(false);
  }
}

function createOrderFromForm(formData, product, screenshot, pricing = getCheckoutPricing(product)) {
  const category = formData.get("category");
  const finalPrice = pricing && pricing.finalPrice ? pricing.finalPrice : (product ? product.price : "");
  return {
    id: createOrderCode(),
    createdAt: new Date().toISOString(),
    category,
    categoryLabel: categories[category].label,
    plan: product ? product.name : String(formData.get("plan") || "").trim(),
    productId: product ? product.id : String(formData.get("plan") || "").trim(),
    price: finalPrice,
    originalPrice: product ? product.price : "",
    discountAmount: pricing && pricing.discountAmount ? pricing.discountAmount : 0,
    couponCode: state.appliedCouponCode || "",
    customerName: String(formData.get("customer_name") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    pubgUid: String(formData.get("pubg_uid") || "").trim(),
    mlbbUserId: String(formData.get("mlbb_user_id") || "").trim(),
    mlbbRegionId: String(formData.get("mlbb_region_id") || "").trim(),
    note: String(formData.get("note") || "").trim(),
    screenshotFilename: screenshot ? screenshot.name : "",
    screenshotUrl: "",
    status: "Pending"
  };
}

function setCheckoutBusy(isBusy) {
  if (!els.checkoutSubmit) {
    return;
  }

  els.checkoutSubmit.disabled = isBusy;
  els.checkoutSubmit.textContent = isBusy ? "Saving Order..." : "Complete Checkout";
}

function submitOrderEmail(order) {
  els.emailOrderId.value = order.id;
  els.emailCategoryLabel.value = order.categoryLabel;
  els.emailProductName.value = order.plan;
  els.emailPrice.value = order.price;
  els.checkoutForm.action = FORM_SUBMIT_URL;
  HTMLFormElement.prototype.submit.call(els.checkoutForm);
}

function canSubmitToNetlify() {
  return /^https?:$/i.test(window.location.protocol);
}

function canUseRemoteBrowserFeatures() {
  return /^https?:$/i.test(window.location.protocol);
}

async function submitOrderToNetlify(order, screenshot) {
  const payload = new FormData();
  payload.append("form-name", NETLIFY_FORM_NAME);
  payload.append("order_id", order.id);
  payload.append("status", order.status);
  payload.append("category", order.category);
  payload.append("category_label", order.categoryLabel);
  payload.append("plan", order.productId);
  payload.append("product_name", order.plan);
  payload.append("price", order.price);
  payload.append("customer_name", order.customerName);
  payload.append("phone", order.phone);
  payload.append("email", order.email);
  payload.append("pubg_uid", order.pubgUid);
  payload.append("mlbb_user_id", order.mlbbUserId);
  payload.append("mlbb_region_id", order.mlbbRegionId);
  payload.append("note", order.note);
  payload.append("screenshot_filename", order.screenshotFilename);

  if (screenshot) {
    payload.append("attachment", screenshot, screenshot.name);
  }

  const postPath = window.location.pathname && window.location.pathname !== "/" ? window.location.pathname : "/";
  const response = await fetch(postPath, {
    method: "POST",
    body: payload
  });

  if (!response.ok) {
    throw new Error(`Netlify form request failed with ${response.status}`);
  }
}

async function submitOrderToDiscord(order) {
  const response = await fetch(DISCORD_FUNCTION_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      orderId: order.id,
      createdAt: order.createdAt,
      category: order.categoryLabel,
      product: order.plan,
      price: order.price,
      customerName: order.customerName,
      phone: order.phone,
      email: order.email,
      pubgUid: order.pubgUid,
      mlbbUserId: order.mlbbUserId,
      mlbbRegionId: order.mlbbRegionId,
      note: order.note,
      status: order.status,
      screenshotFilename: order.screenshotFilename,
      screenshotUrl: order.screenshotUrl
    })
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch (error) {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(payload.error || `Discord function failed with ${response.status}`);
  }

  return payload;
}

function getNetlifySummary(status) {
  if (status === "submitted") {
    return "Netlify captured this order too, so you can see it in the Netlify Forms dashboard after deploy.";
  }

  if (status === "failed") {
    return "Netlify order capture was not saved.";
  }

  return "Netlify capture is skipped during local file preview and will start working after Netlify deploy.";
}

function getDiscordSummary(status) {
  if (status === "sent") {
    return "Discord admin alert was sent.";
  }

  if (status === "disabled") {
    return "Discord alert is not active on this deploy yet.";
  }

  if (status === "failed") {
    return "Discord alert could not be sent.";
  }

  return "Discord alert is skipped during local file preview and will start working after deploy.";
}

async function syncOrderToSupabase(order, screenshot) {
  let screenshotUrl = "";

  if (screenshot) {
    try {
      const upload = await uploadPaymentScreenshot(order, screenshot);
      screenshotUrl = upload.url;
    } catch (error) {
      console.warn("Screenshot upload failed, continuing with order save", error);
    }
  }

  const payload = createSupabaseOrderPayload(order, screenshotUrl);
  const { error } = await state.supabase.client
    .from(SUPABASE_CONFIG.ordersTable)
    .insert(payload);

  if (error) {
    throw error;
  }

  return {
    remoteId: "",
    createdAt: order.createdAt,
    status: order.status,
    screenshotUrl: "",
    screenshotFilename: order.screenshotFilename
  };
}

async function uploadPaymentScreenshot(order, screenshot) {
  const uploadFile = await prepareCheckoutScreenshotForUpload(screenshot);
  const path = createStoragePath(order.id, screenshot.name);
  const bucket = state.supabase.client.storage.from(SUPABASE_CONFIG.screenshotsBucket);
  const { error } = await bucket.upload(path, uploadFile, {
    upsert: true,
    contentType: uploadFile.type || screenshot.type || "image/jpeg"
  });

  if (error) {
    throw error;
  }

  return {
    path,
    url: path
  };
}

async function prepareCheckoutScreenshotForUpload(file) {
  if (!file || !String(file.type || "").startsWith("image/")) {
    return file;
  }

  const compressed = await compressImage(file, 1600, 0.82);
  return dataUrlToBlob(compressed);
}

function createStoragePath(orderCode, filename) {
  return `${orderCode}/${Date.now()}-${sanitizeFileName(filename)}`;
}

function sanitizeFileName(filename) {
  return String(filename || "upload")
    .trim()
    .toLowerCase()
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-");
}

function createSupabaseOrderPayload(order, screenshotUrl) {
  return {
    order_code: order.id,
    created_at: order.createdAt,
    category: order.category,
    plan: order.plan,
    customer_name: order.customerName,
    phone: order.phone,
    email: order.email,
    pubg_uid: order.pubgUid || null,
    mlbb_user_id: order.mlbbUserId || null,
    mlbb_region_id: order.mlbbRegionId || null,
    note: order.note || null,
    screenshot_url: screenshotUrl || null,
    status: order.status
  };
}

async function syncLocalOrdersFromSupabase(options = {}) {
  if (!state.supabase.ready) {
    return getLocalOrders();
  }

  const localOrders = getLocalOrders();
  const orderCodes = Array.from(new Set(localOrders.map((order) => order.id).filter(Boolean)));

  if (!orderCodes.length) {
    return localOrders;
  }

  const { data, error } = await state.supabase.client
    .from(SUPABASE_CONFIG.ordersTable)
    .select("*")
    .in("order_code", orderCodes);

  if (error) {
    console.warn("Could not sync local orders from Supabase", error);
    state.supabase.message = formatSupabaseError(error);
    return localOrders;
  }

  const mergedOrders = mergeRemoteOrdersIntoLocal(localOrders, data || []);
  saveLocalOrders(mergedOrders);

  if (options.rerender) {
    renderOrders();
  }

  return mergedOrders;
}

function mergeRemoteOrdersIntoLocal(localOrders, remoteRows) {
  const remoteMap = new Map(
    remoteRows
      .map(mapSupabaseOrder)
      .map((order) => [order.id, order])
  );

  return localOrders.map((localOrder) => {
    const remoteOrder = remoteMap.get(localOrder.id);
    if (!remoteOrder) {
      return {
        ...localOrder,
        syncState: localOrder.syncState === "failed" ? "failed" : "local"
      };
    }

    return {
      ...localOrder,
      remoteId: remoteOrder.remoteId,
      createdAt: remoteOrder.createdAt || localOrder.createdAt,
      status: remoteOrder.status || localOrder.status,
      screenshotUrl: remoteOrder.screenshotUrl || localOrder.screenshotUrl || "",
      screenshotFilename: remoteOrder.screenshotFilename || localOrder.screenshotFilename || "",
      syncState: "synced",
      backend: "supabase"
    };
  });
}

function mapSupabaseOrder(row) {
  const category = String(row.category || "").trim();
  const productId = row.product_id || findProductIdForRemoteOrder(category, row.plan);
  const screenshotUrl = row.screenshot_url || "";
  const matchedProduct = productId ? getProductById(productId, { includeHidden: true }) : null;

  return {
    remoteId: row.id,
    id: row.order_code || String(row.id || ""),
    createdAt: row.created_at || new Date().toISOString(),
    category,
    categoryLabel: categories[category] ? categories[category].label : category,
    plan: row.plan || "",
    productId,
    price: row.price || (matchedProduct ? matchedProduct.price : ""),
    customerName: row.customer_name || "",
    phone: row.phone || "",
    email: row.email || "",
    pubgUid: row.pubg_uid || "",
    mlbbUserId: row.mlbb_user_id || "",
    mlbbRegionId: row.mlbb_region_id || "",
    note: row.note || "",
    screenshotUrl,
    screenshotFilename: row.screenshot_filename || row.screenshot_name || getFilenameFromUrl(screenshotUrl),
    status: normalizeOrderStatus(row.status),
    backend: "supabase",
    syncState: "synced"
  };
}

function findProductIdForRemoteOrder(category, plan) {
  const match = getAllProducts({ includeHidden: true }).find((product) => product.category === category && product.name === plan);
  return match ? match.id : "";
}

function getFilenameFromUrl(url) {
  try {
    const value = new URL(url);
    const pathname = value.pathname.split("/").filter(Boolean);
    return pathname.length ? pathname[pathname.length - 1] : "";
  } catch (error) {
    const pathname = String(url || "").split("/").filter(Boolean);
    return pathname.length ? pathname[pathname.length - 1] : "";
  }
}

function normalizeOrderStatus(status) {
  const value = String(status || "Pending").trim().toLowerCase();
  if (value === "completed" || value === "delivered") {
    return "Completed";
  }
  if (value === "refunded") {
    return "Refunded";
  }
  return "Pending";
}

function formatSupabaseError(error) {
  return error && error.message ? error.message : "Unknown Supabase error";
}

function showOrderEmailNotice(order, syncSummary) {
  if (!els.orderEmailNotice) {
    return;
  }

  const mailto = createOrderMailto(order);
  els.orderEmailNotice.classList.remove("hidden");
  els.orderEmailNotice.innerHTML = `
    <strong>Order sent to ${escapeHtml(STORE_EMAIL)}</strong>
    <span>Order ${escapeHtml(order.id)} was submitted through FormSubmit. ${escapeHtml(syncSummary)}</span>
    <a href="${mailto}">Send fallback email</a>
  `;
}

function createOrderMailto(order) {
  const subject = encodeURIComponent(`ThesHubHub Order ${order.id}`);
  const body = encodeURIComponent([
    `Order ID: ${order.id}`,
    `Status: ${order.status}`,
    `Category: ${order.categoryLabel}`,
    `Product: ${order.plan}`,
    `Price: ${order.price}`,
    `Name: ${order.customerName}`,
    `Phone / WhatsApp: ${order.phone}`,
    `Email: ${order.email}`,
    order.pubgUid ? `PUBG UID: ${order.pubgUid}` : "",
    order.mlbbUserId ? `MLBB User ID: ${order.mlbbUserId}` : "",
    order.mlbbRegionId ? `MLBB Region ID: ${order.mlbbRegionId}` : "",
    order.note ? `Note: ${order.note}` : "",
    `Payment screenshot filename: ${order.screenshotFilename}`,
    order.screenshotUrl ? `Cloud screenshot URL: ${order.screenshotUrl}` : "",
    "",
    "Please attach the payment screenshot manually if FormSubmit did not deliver it."
  ].filter(Boolean).join("\n"));

  return `mailto:${STORE_EMAIL}?subject=${subject}&body=${body}`;
}

function createOrderCode() {
  const number = Math.floor(10000 + Math.random() * 90000);
  return `THH-${Date.now().toString().slice(-6)}-${number}`;
}

function renderOrders() {
  const orders = getLocalOrders();
  const query = (els.orderSearch.value || "").toLowerCase().trim();
  const filtered = orders.filter((order) => {
    const statusMatch = state.orderFilter === "all" || normalizeOrderStatus(order.status) === state.orderFilter;
    const searchText = `${order.id} ${order.plan} ${order.price} ${order.customerName} ${order.categoryLabel}`.toLowerCase();
    return statusMatch && (!query || searchText.includes(query));
  });

  els.ordersList.innerHTML = "";

  if (!filtered.length) {
    els.ordersList.innerHTML = '<div class="empty-state">No orders found yet.</div>';
    return;
  }

  filtered.forEach((order) => els.ordersList.appendChild(createOrderCard(order)));
  refreshPurchasePopupMessages();
}

function createOrderCard(order, options = {}) {
  const card = document.createElement("article");
  card.className = "order-card";
  const idHtml = escapeHtml(order.id);
  const date = new Date(order.createdAt).toLocaleString();
  const gameIds = getGameIdLine(order);
  const screenshotLink = options.admin && order.screenshotUrl
    ? `<a class="inline-link" href="${escapeHtml(order.screenshotUrl)}" target="_blank" rel="noreferrer">View screenshot</a>`
    : "";
  const syncBadge = `<span class="sync-badge ${escapeHtml(order.syncState || "local")}">${escapeHtml(getSyncBadgeLabel(order))}</span>`;

  card.innerHTML = `
    <div class="order-top">
      <div>
        <strong>${idHtml}</strong>
        <p class="form-note">${escapeHtml(date)}</p>
      </div>
      <div class="order-top-actions">
        <span class="status ${escapeHtml(normalizeOrderStatus(order.status))}">${escapeHtml(normalizeOrderStatus(order.status))}</span>
        ${syncBadge}
      </div>
    </div>
    <div class="order-meta">
      <div><span>Product</span><strong>${escapeHtml(order.plan)}</strong></div>
      <div><span>Total</span><strong>${escapeHtml(order.price || "N/A")}</strong></div>
      <div><span>Screenshot</span><strong>${escapeHtml(order.screenshotFilename || "N/A")}</strong></div>
    </div>
    ${order.couponCode ? `<p class="form-note">Coupon used: ${escapeHtml(order.couponCode)}</p>` : ""}
    ${gameIds ? `<p class="form-note">${gameIds}</p>` : ""}
    ${screenshotLink}
    ${order.note ? `<p>${escapeHtml(order.note)}</p>` : ""}
    <div class="button-row">
      <button class="button ghost" type="button" data-buy-again="${escapeHtml(order.productId)}">Buy Again</button>
      ${options.admin ? `<button class="button primary" type="button" data-admin-order="deliver" data-order-id="${idHtml}" data-order-source="${escapeHtml(order.backend || "local")}">Mark Delivered</button><button class="button ghost" type="button" data-admin-order="refund" data-order-id="${idHtml}" data-order-source="${escapeHtml(order.backend || "local")}">Mark Refunded</button><button class="button danger" type="button" data-admin-order="delete" data-order-id="${idHtml}" data-order-source="${escapeHtml(order.backend || "local")}">Delete</button>` : ""}
    </div>
  `;
  return card;
}

function getSyncBadgeLabel(order) {
  if (order.syncState === "synced") {
    return "Cloud Synced";
  }
  if (order.syncState === "failed") {
    return "Local Only";
  }
  return state.supabase.ready ? "Pending Sync" : "Browser Saved";
}

function getGameIdLine(order) {
  if (order.pubgUid) {
    return `PUBG UID: ${escapeHtml(order.pubgUid)}`;
  }

  if (order.mlbbUserId || order.mlbbRegionId) {
    return `MLBB ID: ${escapeHtml(order.mlbbUserId || "N/A")} / Region: ${escapeHtml(order.mlbbRegionId || "N/A")}`;
  }

  return "";
}

async function unlockAdmin() {
  if (!ADMIN_PASSWORD) {
    alert("Admin password is not configured for this deployment yet.");
    return;
  }

  const cooldownRemaining = getAdminCooldownRemainingMs();
  if (cooldownRemaining > 0) {
    const seconds = Math.ceil(cooldownRemaining / 1000);
    alert(`Too many failed attempts. Try again in ${seconds} seconds.`);
    return;
  }

  if (els.adminPassword.value !== ADMIN_PASSWORD) {
    registerFailedAdminAttempt();
    const remaining = Math.max(0, ADMIN_MAX_FAILED_ATTEMPTS - state.adminFailedAttempts);
    if (getAdminCooldownRemainingMs() > 0) {
      alert("Too many failed attempts. Admin login is temporarily locked for 60 seconds.");
      return;
    }
    alert(`Wrong admin password. Please try again. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining before a short lock.`);
    return;
  }

  clearAdminFailedAttempts();
  unlockAdminUi("password");
}

function unlockLocalAdminPreview() {
  return unlockAdmin();
}

async function signOutAdmin() {
  lockAdminUi();
}

function getAdminCooldownRemainingMs() {
  return Math.max(0, state.adminCooldownUntil - Date.now());
}

function registerFailedAdminAttempt() {
  state.adminFailedAttempts += 1;
  if (state.adminFailedAttempts >= ADMIN_MAX_FAILED_ATTEMPTS) {
    state.adminCooldownUntil = Date.now() + ADMIN_LOCKOUT_MS;
    state.adminFailedAttempts = 0;
  }
}

function clearAdminFailedAttempts() {
  state.adminFailedAttempts = 0;
  state.adminCooldownUntil = 0;
}

function noteAdminActivity() {
  if (!state.adminUnlocked || state.currentView !== "admin") {
    return;
  }
  resetAdminInactivityTimer();
}

function resetAdminInactivityTimer() {
  stopAdminInactivityTimer();
  if (!state.adminUnlocked) {
    return;
  }
  state.adminInactivityTimer = window.setTimeout(() => {
    if (!state.adminUnlocked) {
      return;
    }
    lockAdminUi();
    alert("Admin was locked after inactivity. Enter the password again to continue.");
  }, ADMIN_INACTIVITY_MS);
}

function stopAdminInactivityTimer() {
  if (state.adminInactivityTimer) {
    window.clearTimeout(state.adminInactivityTimer);
    state.adminInactivityTimer = null;
  }
}

function startAdminOrdersAutoRefresh() {
  if (!state.adminUnlocked || !state.supabase.ready) {
    return;
  }

  stopAdminOrdersAutoRefresh();
  state.adminRefreshTimer = window.setInterval(() => {
    if (state.currentView === "admin" && state.adminUnlocked) {
      void refreshAdminOrders();
    }
  }, 12000);
}

function stopAdminOrdersAutoRefresh() {
  if (state.adminRefreshTimer) {
    window.clearInterval(state.adminRefreshTimer);
    state.adminRefreshTimer = null;
  }
}

async function refreshAdminOrders(showPulse = false) {
  if (!state.adminUnlocked) {
    return;
  }

  if (els.refreshAdminOrders) {
    els.refreshAdminOrders.disabled = true;
    els.refreshAdminOrders.textContent = "Refreshing...";
  }

  if (els.adminOrdersHint && showPulse) {
    els.adminOrdersHint.textContent = state.supabase.ready
      ? "Checking Supabase for new orders..."
      : "Showing browser-saved orders on this device.";
  }

  try {
    const orders = await renderAdminOrders();
    processAdminOrderNotifications(orders);
    if (els.adminOrdersHint) {
      els.adminOrdersHint.textContent = state.supabase.ready
        ? `Last checked ${new Date().toLocaleTimeString()}. New orders refresh here automatically while Admin is open.`
        : "Showing browser-saved orders on this device.";
    }
  } finally {
    if (els.refreshAdminOrders) {
      els.refreshAdminOrders.disabled = false;
      els.refreshAdminOrders.textContent = "Refresh";
    }
  }
}

function populateAdminCategorySelect() {
  document.querySelectorAll('#addProductForm select[name="category"]').forEach((select) => {
    select.innerHTML = "";
    Object.entries(categories).forEach(([value, category]) => select.add(new Option(category.label, value)));
  });
}

function handleCouponSave(event) {
  event.preventDefault();
  if (!canManageAdminData()) {
    alert("Secure admin access is required to manage coupon codes.");
    return;
  }
  const formData = new FormData(els.couponForm);
  const coupon = normalizeCoupon({
    code: formData.get("code"),
    type: formData.get("type"),
    value: formData.get("value"),
    category: formData.get("category"),
    active: formData.get("active") === "true"
  });

  if (!coupon) {
    alert("Please enter a valid coupon code and value.");
    return;
  }

  const coupons = getCoupons().filter((item) => item.code !== coupon.code);
  coupons.unshift(coupon);
  saveCoupons(coupons);
  if (state.appliedCouponCode === coupon.code) {
    state.activeCoupon = coupon.active ? coupon : null;
  }
  els.couponForm.reset();
  populateCouponCategorySelect();
  renderAdminCoupons();
  updateCheckoutSummary();
}

function renderAdminCoupons() {
  if (!els.adminCouponList) {
    return;
  }

  const coupons = getCoupons();
  els.adminCouponList.innerHTML = "";

  if (!coupons.length) {
    els.adminCouponList.innerHTML = '<div class="empty-state">No coupon codes created yet.</div>';
    return;
  }

  coupons.forEach((coupon) => {
    const item = document.createElement("div");
    item.className = "coupon-admin-item";
    item.innerHTML = `
      <div>
        <strong>${escapeHtml(coupon.code)}</strong>
        <p class="form-note">${escapeHtml(formatCouponLabel(coupon))}</p>
      </div>
      <div class="button-row">
        <button class="button ghost" type="button" data-coupon-action="toggle" data-coupon-code="${escapeHtml(coupon.code)}">${coupon.active ? "Disable" : "Enable"}</button>
        <button class="button danger" type="button" data-coupon-action="delete" data-coupon-code="${escapeHtml(coupon.code)}">Delete</button>
      </div>
    `;
    els.adminCouponList.appendChild(item);
  });
}

function formatCouponLabel(coupon) {
  const value = coupon.type === "percent" ? `${coupon.value}% off` : `${coupon.value} off`;
  const categoryLabel = coupon.category === "all" ? "All categories" : categories[coupon.category].label;
  const status = coupon.active ? "Active" : "Disabled";
  return `${value} | ${categoryLabel} | ${status}`;
}

function handleCouponAction(button) {
  if (!canManageAdminData()) {
    alert("Secure admin access is required to manage coupon codes.");
    return;
  }
  const code = String(button.dataset.couponCode || "").trim().toUpperCase();
  if (!code) {
    return;
  }

  let coupons = getCoupons();
  if (button.dataset.couponAction === "delete") {
    coupons = coupons.filter((coupon) => coupon.code !== code);
    if (state.appliedCouponCode === code) {
      resetCouponState({ preserveCode: false });
    }
  } else if (button.dataset.couponAction === "toggle") {
    coupons = coupons.map((coupon) => coupon.code === code ? { ...coupon, active: !coupon.active } : coupon);
    if (state.appliedCouponCode === code) {
      state.activeCoupon = coupons.find((coupon) => coupon.code === code && coupon.active) || null;
    }
  }

  saveCoupons(coupons);
  renderAdminCoupons();
  updateCheckoutSummary();
}

function handleAddProduct(event) {
  event.preventDefault();
  if (!canManageAdminData()) {
    alert("Secure admin access is required to add products.");
    return;
  }
  const formData = new FormData(els.addProductForm);
  const product = {
    id: `custom-${Date.now()}`,
    category: formData.get("category"),
    name: String(formData.get("name")).trim(),
    price: String(formData.get("price")).trim(),
    description: String(formData.get("description") || "").trim()
  };

  const customProducts = readJson(STORAGE_KEYS.customProducts, []);
  customProducts.push(product);
  writeJson(STORAGE_KEYS.customProducts, customProducts);
  els.addProductForm.reset();
  renderProducts();
}

function refreshAdminProductSelect() {
  if (!els.adminProductSelect) {
    return;
  }

  const hiddenProducts = readJson(STORAGE_KEYS.hiddenProducts, []);
  const products = getAllProducts({ includeHidden: true });
  els.adminProductSelect.innerHTML = "";

  products.forEach((product) => {
    const hiddenLabel = hiddenProducts.includes(product.id) ? " (hidden)" : "";
    els.adminProductSelect.add(new Option(`${categories[product.category].label} - ${product.name}${hiddenLabel}`, product.id));
  });

  fillAdminEditForm();
}

function fillAdminEditForm() {
  const product = getProductById(els.adminProductSelect.value, { includeHidden: true });
  if (!product) {
    return;
  }

  els.editProductForm.elements.name.value = product.name;
  els.editProductForm.elements.price.value = product.price;
  els.editProductForm.elements.description.value = product.description || "";
}

function handleEditProduct(event) {
  event.preventDefault();
  if (!canManageAdminData()) {
    alert("Secure admin access is required to edit products.");
    return;
  }
  const productId = els.adminProductSelect.value;
  const productEdits = readJson(STORAGE_KEYS.productEdits, {});
  productEdits[productId] = {
    name: els.editProductForm.elements.name.value.trim(),
    price: els.editProductForm.elements.price.value.trim(),
    description: els.editProductForm.elements.description.value.trim()
  };
  writeJson(STORAGE_KEYS.productEdits, productEdits);
  renderProducts();
}

function handleRemoveProduct() {
  if (!canManageAdminData()) {
    alert("Secure admin access is required to remove products.");
    return;
  }
  const productId = els.adminProductSelect.value;
  const hiddenProducts = readJson(STORAGE_KEYS.hiddenProducts, []);
  if (!hiddenProducts.includes(productId)) {
    hiddenProducts.push(productId);
    writeJson(STORAGE_KEYS.hiddenProducts, hiddenProducts);
  }
  renderProducts();
}

function handleRestoreProducts() {
  if (!canManageAdminData()) {
    alert("Secure admin access is required to restore products.");
    return;
  }
  writeJson(STORAGE_KEYS.hiddenProducts, []);
  renderProducts();
}

async function loadPaymentSettings() {
  let settings = getLocalPaymentSettings();

  if (state.supabase.ready && canUseRemoteBrowserFeatures()) {
    try {
      const remoteSettings = await getPaymentSettingsFromSupabase();
      if (remoteSettings) {
        settings = remoteSettings;
        cachePaymentSettingsLocally(settings);
      }
    } catch (error) {
      console.warn("Could not load shared payment settings", error);
    }
  }

  applyPaymentSettingsToUi(settings);
}

async function handlePaymentSave(event) {
  event.preventDefault();
  if (!canManageAdminData()) {
    alert("Secure admin access is required to update payment settings.");
    return;
  }
  const formData = new FormData(els.paymentForm);
  const localSettings = getLocalPaymentSettings();
  const settings = {
    wallet: String(formData.get("wallet") || "").trim(),
    bank: String(formData.get("bank") || "").trim(),
    account: String(formData.get("account") || "").trim(),
    qrUrl: localSettings.qrUrl || "",
    qrPath: localSettings.qrPath || ""
  };

  const qrFile = els.qrUpload.files[0];
  let compressedQrDataUrl = "";
  if (qrFile) {
    compressedQrDataUrl = await compressImage(qrFile, 900, 0.78);
    settings.qrUrl = compressedQrDataUrl;
  }

  cachePaymentSettingsLocally(settings);
  applyPaymentSettingsToUi(settings);

  if (state.supabase.ready && canManageCloudAdminData()) {
    try {
      const sharedSettings = await savePaymentSettingsToSupabase(settings, compressedQrDataUrl);
      cachePaymentSettingsLocally(sharedSettings);
      applyPaymentSettingsToUi(sharedSettings);
    } catch (error) {
      console.error("Could not sync payment settings to Supabase", error);
      alert(`Saved in this browser, but could not sync payment settings to other devices: ${formatSupabaseError(error)}`);
    }
  }

  els.qrUpload.value = "";
}

function compressImage(file, maxSize, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function getPaymentSettingsFromSupabase() {
  const { data, error } = await state.supabase.client
    .from(SUPABASE_CONFIG.settingsTable)
    .select("*")
    .eq("setting_key", SUPABASE_CONFIG.paymentSettingsKey)
    .limit(1);

  if (error) {
    throw error;
  }

  if (!data || !data.length) {
    return null;
  }

  return mapPaymentSettingsRow(data[0]);
}

async function savePaymentSettingsToSupabase(settings, compressedQrDataUrl) {
  let qrUrl = settings.qrUrl || "";
  let qrPath = settings.qrPath || "";

  if (compressedQrDataUrl) {
    const uploadedQr = await uploadPaymentQrToSupabase(compressedQrDataUrl);
    qrUrl = uploadedQr.url;
    qrPath = uploadedQr.path;

    if (settings.qrPath && settings.qrPath !== qrPath) {
      await removeStorageObject(SUPABASE_CONFIG.assetsBucket, settings.qrPath);
    }
  }

  const payload = createPaymentSettingsPayload({
    wallet: settings.wallet,
    bank: settings.bank,
    account: settings.account,
    qrUrl,
    qrPath
  });

  const { data, error } = await state.supabase.client
    .from(SUPABASE_CONFIG.settingsTable)
    .upsert(payload, { onConflict: "setting_key" })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapPaymentSettingsRow(data);
}

async function clearPaymentQrFromSupabase(previousQrPath) {
  const payload = createPaymentSettingsPayload({
    wallet: els.paymentForm.elements.wallet.value.trim(),
    bank: els.paymentForm.elements.bank.value.trim(),
    account: els.paymentForm.elements.account.value.trim(),
    qrUrl: "",
    qrPath: ""
  });

  const { error } = await state.supabase.client
    .from(SUPABASE_CONFIG.settingsTable)
    .upsert(payload, { onConflict: "setting_key" });

  if (error) {
    throw error;
  }

  if (previousQrPath) {
    await removeStorageObject(SUPABASE_CONFIG.assetsBucket, previousQrPath);
  }
}

async function uploadPaymentQrToSupabase(dataUrl) {
  const path = `payment-settings/qr-${Date.now()}.jpg`;
  const blob = dataUrlToBlob(dataUrl);
  const bucket = state.supabase.client.storage.from(SUPABASE_CONFIG.assetsBucket);
  const { error } = await bucket.upload(path, blob, {
    upsert: true,
    contentType: "image/jpeg"
  });

  if (error) {
    throw error;
  }

  const { data } = bucket.getPublicUrl(path);
  return {
    path,
    url: data && data.publicUrl ? data.publicUrl : ""
  };
}

async function removeStorageObject(bucketName, path) {
  if (!path) {
    return;
  }

  const { error } = await state.supabase.client.storage.from(bucketName).remove([path]);
  if (error) {
    throw error;
  }
}

function createPaymentSettingsPayload(settings) {
  return {
    setting_key: SUPABASE_CONFIG.paymentSettingsKey,
    wallet: settings.wallet || null,
    bank: settings.bank || null,
    account: settings.account || null,
    qr_url: settings.qrUrl || null,
    qr_path: settings.qrPath || null,
    updated_at: new Date().toISOString()
  };
}

function mapPaymentSettingsRow(row) {
  return {
    wallet: row.wallet || "",
    bank: row.bank || "",
    account: row.account || "",
    qrUrl: row.qr_url || "",
    qrPath: row.qr_path || ""
  };
}

function dataUrlToBlob(dataUrl) {
  const [meta, content] = String(dataUrl).split(",");
  const mimeMatch = /data:(.*?);base64/.exec(meta || "");
  const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const binary = atob(content || "");
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mimeType });
}

function renderQr(qrValue = localStorage.getItem(STORAGE_KEYS.qr) || "") {
  const qr = qrValue;
  if (qr) {
    els.qrBox.innerHTML = `<img src="${qr}" alt="Payment QR code">`;
  } else {
    els.qrBox.innerHTML = "<span>No QR uploaded yet</span>";
  }
}

async function removeQr() {
  if (!canManageAdminData()) {
    alert("Secure admin access is required to remove the payment QR.");
    return;
  }
  const settings = getLocalPaymentSettings();
  const nextSettings = {
    ...settings,
    qrUrl: "",
    qrPath: ""
  };

  cachePaymentSettingsLocally(nextSettings);
  applyPaymentSettingsToUi(nextSettings);

  if (state.supabase.ready && canManageCloudAdminData()) {
    try {
      await clearPaymentQrFromSupabase(settings.qrPath);
    } catch (error) {
      console.error("Could not remove shared QR", error);
      alert(`Removed from this browser, but could not remove the shared QR: ${formatSupabaseError(error)}`);
    }
  }
}

async function renderAdminOrders() {
  if (!els.adminOrdersList || !state.adminUnlocked) {
    return [];
  }

  let orders = [];

  if (state.supabase.ready && canManageCloudAdminData()) {
    try {
      orders = await getAdminOrdersFromSupabase();
    } catch (error) {
      console.warn("Falling back to local admin orders", error);
      orders = state.adminAuthMode === "local" ? getLocalOrders() : [];
    }
  } else {
    orders = getLocalOrders();
  }

  const filteredOrders = orders.filter((order) => {
    return state.adminOrderFilter === "all" || normalizeOrderStatus(order.status) === state.adminOrderFilter;
  });

  els.adminOrdersList.innerHTML = "";

  if (!filteredOrders.length) {
    els.adminOrdersList.innerHTML = `<div class="empty-state">${state.adminOrderFilter === "all" ? (state.supabase.ready ? "No Supabase or local fallback orders yet." : "No local orders yet.") : `No ${escapeHtml(state.adminOrderFilter)} orders yet.`}</div>`;
    return orders;
  }

  filteredOrders.forEach((order) => els.adminOrdersList.appendChild(createOrderCard(order, { admin: true })));
  return orders;
}

function processAdminOrderNotifications(orders) {
  const orderIds = new Set(orders.map((order) => order.id).filter(Boolean));

  if (!state.adminHasOrderBaseline) {
    state.adminKnownOrderIds = orderIds;
    state.adminHasOrderBaseline = true;
    return;
  }

  const newOrders = orders.filter((order) => !state.adminKnownOrderIds.has(order.id));
  state.adminKnownOrderIds = orderIds;

  if (!newOrders.length) {
    resetAdminTitle();
    return;
  }

  const latestOrder = newOrders[0];
  const message = newOrders.length === 1
    ? `New order received: ${latestOrder.plan} (${latestOrder.id})`
    : `${newOrders.length} new orders received`;

  showAdminToast(message);
  flashAdminTitle(message);

  if ("Notification" in window && Notification.permission === "granted") {
    const detail = newOrders.length === 1
      ? `${latestOrder.customerName || "Customer"} ordered ${latestOrder.plan}`
      : "Open Admin Panel to review the new orders.";
    try {
      const notification = new Notification("ThesHubHub Admin", {
        body: detail,
        tag: "theshubhub-admin-orders"
      });
      window.setTimeout(() => notification.close(), 8000);
    } catch (error) {
      console.warn("Browser notification failed", error);
    }
  }
}

function showAdminToast(message) {
  if (!els.adminToast) {
    return;
  }

  els.adminToast.textContent = message;
  els.adminToast.classList.remove("hidden");
  els.adminToast.classList.add("active");

  window.clearTimeout(showAdminToast.dismissTimer);
  showAdminToast.dismissTimer = window.setTimeout(() => {
    els.adminToast.classList.remove("active");
    els.adminToast.classList.add("hidden");
  }, 6000);
}

function flashAdminTitle(message) {
  document.title = `New Order - ${state.adminTitleOriginal}`;
  window.clearTimeout(flashAdminTitle.resetTimer);
  flashAdminTitle.resetTimer = window.setTimeout(() => {
    resetAdminTitle();
  }, 12000);
}

function resetAdminTitle() {
  document.title = state.adminTitleOriginal;
}

async function requestAdminNotificationPermission() {
  if (!("Notification" in window)) {
    showAdminToast("This browser does not support notifications.");
    return;
  }

  const permission = await Notification.requestPermission();
  updateAdminAlertButton(permission);

  if (permission === "granted") {
    showAdminToast("Admin browser alerts enabled.");
    try {
      const notification = new Notification("ThesHubHub Admin", {
        body: "You will now be notified when new orders arrive while this admin page is open.",
        tag: "theshubhub-admin-ready"
      });
      window.setTimeout(() => notification.close(), 5000);
    } catch (error) {
      console.warn("Admin notification preview failed", error);
    }
    return;
  }

  showAdminToast("Browser alerts were not enabled. In-app admin alerts still work.");
}

function updateAdminAlertButton(forcedPermission) {
  if (!els.enableAdminAlerts) {
    return;
  }

  if (!("Notification" in window)) {
    els.enableAdminAlerts.textContent = "Alerts Unsupported";
    els.enableAdminAlerts.disabled = true;
    return;
  }

  const permission = forcedPermission || Notification.permission;
  if (permission === "granted") {
    els.enableAdminAlerts.textContent = "Alerts Enabled";
    els.enableAdminAlerts.disabled = true;
    return;
  }

  if (permission === "denied") {
    els.enableAdminAlerts.textContent = "Alerts Blocked";
    els.enableAdminAlerts.disabled = true;
    return;
  }

  els.enableAdminAlerts.textContent = "Enable Alerts";
  els.enableAdminAlerts.disabled = false;
}

async function hydrateAdminScreenshotUrls(orders) {
  await Promise.all((orders || []).map(async (order) => {
    if (!order || !order.screenshotUrl || /^https?:\/\//i.test(order.screenshotUrl)) {
      return;
    }

    try {
      const { data, error } = await state.supabase.client.storage
        .from(SUPABASE_CONFIG.screenshotsBucket)
        .createSignedUrl(order.screenshotUrl, 60 * 30);

      if (!error && data && data.signedUrl) {
        order.screenshotUrl = data.signedUrl;
      } else {
        order.screenshotUrl = "";
      }
    } catch (error) {
      console.warn("Could not create signed screenshot URL", error);
      order.screenshotUrl = "";
    }
  }));
}

function refreshPurchasePopupMessages() {
  const products = getAllProducts();
  const seededMessages = products.slice(0, 8).map((product, index) => ({
    id: `seed-${product.id}`,
    message: `Someone bought ${product.name} ${index + 1} ${index === 0 ? "minute" : "minutes"} ago.`
  }));
  const orderMessages = getLocalOrders()
    .slice(0, 8)
    .map((order) => ({
      id: order.id,
      message: `${order.customerName || "Someone"} bought ${order.plan} ${formatRelativeOrderTime(order.createdAt)}.`
    }));

  state.purchasePopupMessages = [...orderMessages, ...seededMessages].slice(0, 10);
  if (state.purchasePopupIndex >= state.purchasePopupMessages.length) {
    state.purchasePopupIndex = 0;
  }
}

function startPurchasePopupLoop() {
  if (!els.purchasePopup) {
    return;
  }

  refreshPurchasePopupMessages();
  showNextPurchasePopup();
  window.clearInterval(state.purchasePopupTimer);
  state.purchasePopupTimer = window.setInterval(showNextPurchasePopup, 6500);
}

function showNextPurchasePopup() {
  if (!els.purchasePopup || !state.purchasePopupMessages.length) {
    return;
  }

  const next = state.purchasePopupMessages[state.purchasePopupIndex % state.purchasePopupMessages.length];
  state.purchasePopupIndex = (state.purchasePopupIndex + 1) % state.purchasePopupMessages.length;
  els.purchasePopup.textContent = next.message;
  els.purchasePopup.classList.remove("hidden");
  els.purchasePopup.classList.add("visible");

  window.clearTimeout(showNextPurchasePopup.hideTimer);
  showNextPurchasePopup.hideTimer = window.setTimeout(() => {
    if (els.purchasePopup) {
      els.purchasePopup.classList.remove("visible");
    }
  }, 4200);
}

function formatRelativeOrderTime(dateValue) {
  const diffMs = Math.max(60000, Date.now() - new Date(dateValue || Date.now()).getTime());
  const minutes = Math.round(diffMs / 60000);

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

async function getAdminOrdersFromSupabase() {
  const { data, error } = await state.supabase.client
    .from(SUPABASE_CONFIG.ordersTable)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const remoteOrders = (data || []).map(mapSupabaseOrder);
  await hydrateAdminScreenshotUrls(remoteOrders);
  const localOnlyOrders = getLocalOrders()
    .filter((order) => !remoteOrders.some((remoteOrder) => remoteOrder.id === order.id))
    .map((order) => ({
      ...order,
      syncState: order.syncState || "local",
      backend: order.backend || "local"
    }));

  const merged = [...remoteOrders, ...localOnlyOrders].sort((left, right) => getOrderTimestamp(right) - getOrderTimestamp(left));
  state.supabase.adminOrders = merged;
  return merged;
}

async function handleAdminOrderAction(button) {
  if (!canManageAdminData()) {
    alert("Secure admin access is required for order actions.");
    return;
  }

  const action = button.dataset.adminOrder;
  const orderId = button.dataset.orderId;
  const source = button.dataset.orderSource || "local";
  button.disabled = true;

  try {
    if (state.supabase.ready && source === "supabase" && canManageCloudAdminData()) {
      if (action === "deliver") {
        const { error } = await state.supabase.client
          .from(SUPABASE_CONFIG.ordersTable)
          .update({ status: "Completed" })
          .eq("order_code", orderId);

        if (error) {
          throw error;
        }
      }

      if (action === "refund") {
        const { error } = await state.supabase.client
          .from(SUPABASE_CONFIG.ordersTable)
          .update({ status: "Refunded" })
          .eq("order_code", orderId);

        if (error) {
          throw error;
        }
      }

      if (action === "delete") {
        const { error } = await state.supabase.client
          .from(SUPABASE_CONFIG.ordersTable)
          .delete()
          .eq("order_code", orderId);

        if (error) {
          throw error;
        }
      }
    }

    applyLocalAdminOrderAction(action, orderId);
    renderOrders();
    await renderAdminOrders();
  } catch (error) {
    alert(`Could not update this order in Supabase: ${formatSupabaseError(error)}`);
  } finally {
    button.disabled = false;
  }
}

function applyLocalAdminOrderAction(action, orderId) {
  let orders = getLocalOrders();

  if (action === "deliver") {
    orders = orders.map((order) => order.id === orderId ? { ...order, status: "Completed", syncState: order.syncState || "local" } : order);
  }

  if (action === "refund") {
    orders = orders.map((order) => order.id === orderId ? { ...order, status: "Refunded", syncState: order.syncState || "local" } : order);
  }

  if (action === "delete") {
    orders = orders.filter((order) => order.id !== orderId);
  }

  saveLocalOrders(orders);
}

async function clearOrders() {
  if (!canManageAdminData()) {
    alert("Secure admin access is required to clear orders.");
    return;
  }
  const message = state.supabase.ready && canManageCloudAdminData()
    ? "Clear all Supabase orders and this browser cache?"
    : "Clear all locally saved orders?";

  if (!confirm(message)) {
    return;
  }

  try {
    if (state.supabase.ready && canManageCloudAdminData()) {
      const { error } = await state.supabase.client
        .from(SUPABASE_CONFIG.ordersTable)
        .delete()
        .not("id", "is", null);

      if (error) {
        throw error;
      }
    }

    writeJson(STORAGE_KEYS.orders, []);
    renderOrders();
    await renderAdminOrders();
  } catch (error) {
    alert(`Could not clear orders: ${formatSupabaseError(error)}`);
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function runSmokeTests() {
  const firstProduct = getAllProducts()[0];
  const pubgProduct = getProductById("pubg-60") || firstProduct;
  const mlbbProduct = getProductById("mlbb-706") || firstProduct;
  const edited = applyProductEdit(firstProduct, { name: "Smoke Test Product", price: "NPR 1" });
  const invalidPubg = validateCheckoutData({
    category: "pubg",
    plan: firstProduct.id,
    customer_name: "Test",
    phone: "9800000000",
    email: "test@example.com",
    screenshotFilename: "pay.png"
  });
  const validPubg = validateCheckoutData({
    category: "pubg",
    plan: firstProduct.id,
    customer_name: "Test",
    phone: "9800000000",
    email: "test@example.com",
    pubg_uid: "123456789",
    screenshotFilename: "pay.png"
  });
  const mergedOrders = mergeRemoteOrdersIntoLocal(
    [
      {
        id: "THH-SYNC",
        createdAt: new Date().toISOString(),
        plan: "60 UC",
        productId: "pubg-60",
        price: "Rs 150",
        customerName: "Smoke",
        categoryLabel: "PUBG UC",
        screenshotFilename: "screen.png",
        status: "Pending"
      }
    ],
    [
      {
        id: "remote-id",
        order_code: "THH-SYNC",
        created_at: new Date().toISOString(),
        category: "pubg",
        plan: "60 UC",
        customer_name: "Smoke",
        phone: "9800000000",
        email: "smoke@example.com",
        screenshot_url: "https://example.com/screen.png",
        screenshot_filename: "screen.png",
        status: "Completed",
        price: "Rs 150",
        product_id: "pubg-60"
      }
    ]
  );
  const paymentPayload = createPaymentSettingsPayload({
    wallet: "9800000000",
    bank: "Nabil",
    account: "123456789",
    qrUrl: "https://example.com/qr.jpg",
    qrPath: "payment-settings/qr.jpg"
  });
  const paymentSettings = mapPaymentSettingsRow({
    wallet: "9800000000",
    bank: "Nabil",
    account: "123456789",
    qr_url: "https://example.com/qr.jpg",
    qr_path: "payment-settings/qr.jpg"
  });
  const refundedOrders = [
    { id: "THH-1", status: "Pending" },
    { id: "THH-2", status: "Completed" }
  ].map((order) => order.id === "THH-2" ? { ...order, status: "Refunded" } : order);
  const testOrder = {
    id: "THH-SMOKE",
    createdAt: new Date().toISOString(),
    plan: "60 UC",
    productId: "pubg-60",
    price: "Rs 150",
    customerName: "Smoke",
    categoryLabel: "PUBG UC",
    pubgUid: "123",
    screenshotFilename: "screen.png",
    status: "Pending",
    syncState: "synced",
    screenshotUrl: "https://example.com/screen.png"
  };
  const orderCard = createOrderCard(testOrder);
  const coupon = findCouponByCode("WELCOME10");
  const couponPricing = getCheckoutPricing(pubgProduct, coupon);
  const mlbbBadges = getProductBadges(mlbbProduct);
  const modalDetails = getProductDetailContent(mlbbProduct);

  prepareCheckout(firstProduct.category, firstProduct.id);
  refreshPurchasePopupMessages();

  console.groupCollapsed("ThesHubHub smoke tests");
  console.assert(document.querySelectorAll(".product-card").length > 0, "product rendering: expected visible product cards");
  console.assert(els.checkoutCategory.options.length === 1 && els.checkoutCategory.value === firstProduct.category, "checkout auto-selection: expected selected category only");
  console.assert(els.checkoutProduct.value === firstProduct.id, "checkout auto-selection: expected selected product");
  console.assert(edited.name === "Smoke Test Product" && edited.price === "NPR 1", "admin product edit: expected edited product fields");
  console.assert(isProductHidden(firstProduct.id, [firstProduct.id]), "admin remove: expected removed product id to be hidden");
  console.assert(!isProductHidden(firstProduct.id, ["other-product"]), "admin remove: expected unrelated product to stay visible");
  console.assert(Boolean(coupon) && couponPricing.finalAmount < couponPricing.originalAmount, "coupon system: expected active coupon to reduce checkout total");
  console.assert(!invalidPubg.valid && invalidPubg.missing.includes("PUBG UID"), "required checkout validation: PUBG UID should be required");
  console.assert(validPubg.valid, "required checkout validation: valid PUBG payload should pass");
  console.assert(Array.isArray(mlbbBadges) && mlbbBadges.length > 0, "product badges: expected featured tags for best-selling products");
  console.assert(/Region ID/i.test(modalDetails.required) && /payment confirmation/i.test(modalDetails.delivery), "product detail modal: expected category-specific delivery and required info");
  console.assert(mergedOrders[0].status === "Completed" && mergedOrders[0].syncState === "synced", "Supabase order sync: expected remote status to merge into local order");
  console.assert(createStoragePath("THH-1", "My Screen Shot.png").includes("my-screen-shot.png"), "Supabase storage path: expected sanitized screenshot filename");
  console.assert(paymentPayload.setting_key === SUPABASE_CONFIG.paymentSettingsKey && paymentPayload.qr_url === "https://example.com/qr.jpg", "payment settings payload: expected shared payment payload fields");
  console.assert(paymentSettings.qrPath === "payment-settings/qr.jpg" && paymentSettings.bank === "Nabil", "payment settings mapping: expected shared payment row to map correctly");
  console.assert(refundedOrders[1].status === "Refunded" && normalizeOrderStatus(refundedOrders[1].status) === "Refunded", "admin refund action: expected refunded status to stay visible for My Orders");
  console.assert(state.purchasePopupMessages.length > 0, "recently purchased popup: expected rotating activity messages");
  console.assert(orderCard.textContent.includes("THH-SMOKE") && orderCard.textContent.includes("Pending"), "My Orders rendering: expected order card content");
  console.groupEnd();
}

window.ThesHubHubApp = {
  getAllProducts,
  startCheckout,
  validateCheckoutData,
  renderOrders,
  runSmokeTests,
  syncLocalOrdersFromSupabase
};
