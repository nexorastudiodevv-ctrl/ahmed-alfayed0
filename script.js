document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.querySelectorAll("[data-whatsapp-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const topic = String(formData.get("topic") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const labels = form.dataset.language === "ar"
      ? { name: "الاسم", email: "البريد الإلكتروني", request: "نوع الطلب" }
      : { name: "Name", email: "Email", request: "Request" };
    const lines = [
      `${labels.name}: ${name}`,
      email ? `${labels.email}: ${email}` : "",
      `${labels.request}: ${topic}`,
      "",
      message,
    ].filter((line) => line !== undefined);
    const whatsappUrl = `https://wa.me/201152183562?text=${encodeURIComponent(lines.join("\n"))}`;
    const whatsappWindow = window.open(whatsappUrl, "_blank");

    if (whatsappWindow) {
      whatsappWindow.opener = null;
    } else {
      window.location.assign(whatsappUrl);
    }
  });
});

if ("serviceWorker" in navigator && window.isSecureContext) {
  navigator.serviceWorker.register("/service-worker.js")
    .catch((error) => console.error("Nexora PWA service worker registration failed:", error));
}

const installButton = document.querySelector("[data-pwa-install]");
let installPrompt;

if (installButton) {
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    || navigator.standalone === true;
  if (isStandalone) installButton.hidden = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
  });

  installButton.addEventListener("click", async () => {
    if (!installPrompt) {
      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
        || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      const message = document.documentElement.lang === "ar"
        ? (isIOS
          ? "لتثبيت الموقع على iPhone أو iPad: افتح قائمة المشاركة في Safari، ثم اختر «إضافة إلى الشاشة الرئيسية»."
          : "لتثبيت الموقع، افتح قائمة المتصفح واختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».")
        : (isIOS
          ? "To install on iPhone or iPad, open Safari's Share menu and choose “Add to Home Screen”."
          : "To install this site, open your browser menu and choose “Install app” or “Add to Home screen”.");
      window.alert(message);
      return;
    }

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") installButton.hidden = true;
      installPrompt = null;
    } catch (error) {
      console.error("Nexora PWA installation prompt failed:", error);
      installPrompt = null;
    }
  });

  window.addEventListener("appinstalled", () => {
    installButton.hidden = true;
    installPrompt = null;
  });
}
