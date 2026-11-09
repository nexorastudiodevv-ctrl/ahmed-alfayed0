const isEnglish = document.documentElement.lang.toLowerCase().startsWith("en");
const labels = isEnglish
  ? {
      heading: "Share this article",
      native: "Share",
      copy: "Copy link",
      copied: "Link copied.",
      copyFailed: "Could not copy the link. Copy it from the address bar.",
      shareFailed: "Could not open the share dialog.",
    }
  : {
      heading: "شارك المقال",
      native: "مشاركة",
      copy: "نسخ الرابط",
      copied: "تم نسخ الرابط.",
      copyFailed: "تعذر نسخ الرابط. يمكنك نسخه من شريط العنوان.",
      shareFailed: "تعذرت مشاركة المقال.",
    };

const articleHeader = document.querySelector(".blog-article-header");

if (articleHeader && !document.querySelector("[data-article-share]")) {
  const shareBar = document.createElement("section");
  shareBar.className = "blog-article-share";
  shareBar.dataset.articleShare = "";
  shareBar.setAttribute("aria-label", labels.heading);

  const heading = document.createElement("h2");
  heading.textContent = labels.heading;
  shareBar.append(heading);

  const actions = document.createElement("div");
  actions.className = "blog-article-share-actions";

  const status = document.createElement("span");
  status.className = "blog-article-share-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");

  const getShareDetails = () => ({
    title: document.querySelector(".blog-article-header h1")?.textContent?.trim() || document.title,
    url: window.location.href,
  });

  const addShareLink = (label, icon, getUrl) => {
    const link = document.createElement("a");
    link.className = `blog-article-share-link blog-article-share-brand blog-article-share-${icon.name}`;
    link.setAttribute("aria-label", label);
    link.title = label;
    link.innerHTML = icon.svg;
    link.href = getUrl(getShareDetails());
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.addEventListener("click", () => {
      link.href = getUrl(getShareDetails());
    });
    actions.append(link);
  };

  if (navigator.share) {
    const nativeButton = document.createElement("button");
    nativeButton.className = "blog-article-share-link";
    nativeButton.type = "button";
    nativeButton.textContent = labels.native;
    nativeButton.addEventListener("click", async () => {
      const { title, url } = getShareDetails();
      try {
        await navigator.share({ title, url });
        status.textContent = "";
      } catch (error) {
        if (error.name !== "AbortError") {
          status.textContent = labels.shareFailed;
          console.error("Could not share article.", error);
        }
      }
    });
    actions.append(nativeButton);
  }

  addShareLink("WhatsApp", {
    name: "whatsapp",
    svg: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.52 3.48A11.86 11.86 0 0 0 12.08 0C5.5 0 .15 5.34.15 11.92c0 2.1.55 4.15 1.6 5.96L.05 24l6.27-1.64a11.9 11.9 0 0 0 5.76 1.47h.01c6.57 0 11.92-5.35 11.92-11.92 0-3.18-1.24-6.17-3.49-8.43ZM12.09 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.72.98.99-3.63-.23-.37a9.9 9.9 0 0 1-1.52-5.27c0-5.46 4.45-9.9 9.9-9.9 2.65 0 5.14 1.03 7.01 2.9a9.85 9.85 0 0 1 2.9 7c0 5.46-4.45 9.9-9.92 9.9Zm5.43-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.8-1.49-1.78-1.67-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.08-.8.38-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.21 5.09 4.5.71.3 1.27.49 1.7.63.72.23 1.37.2 1.89.12.58-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z"/></svg>',
  }, ({ title, url }) =>
    `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  );
  addShareLink("Facebook", {
    name: "facebook",
    svg: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M13.5 21v-8.2h2.76l.41-3.2H13.5V7.56c0-.93.26-1.56 1.59-1.56h1.7V3.14C16.5 3.05 15.5 3 14.33 3c-2.46 0-4.14 1.5-4.14 4.25V9.6H7.41v3.2h2.78V21h3.31Z"/></svg>',
  }, ({ url }) =>
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  );
  addShareLink("Telegram", {
    name: "telegram",
    svg: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M21.94 4.66 18.7 19.94c-.24 1.08-.88 1.35-1.78.84l-4.92-3.63-2.38 2.29c-.26.26-.48.48-.98.48l.35-5.01 9.12-8.24c.4-.35-.09-.55-.62-.2L6.22 13.57l-4.85-1.52c-1.06-.33-1.08-1.06.22-1.57L20.56 3.3c.88-.32 1.65.22 1.38 1.36Z"/></svg>',
  }, ({ title, url }) =>
    `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  );
  addShareLink(isEnglish ? "X" : "إكس", {
    name: "x",
    svg: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M18.9 2H22l-6.78 7.75L23.2 22h-6.25l-4.9-7.58L5.42 22H2.3l7.25-8.29L1.8 2h6.4l4.43 6.96L18.9 2Zm-1.1 17.86h1.73L7.28 4.03H5.42L17.8 19.86Z"/></svg>',
  }, ({ title, url }) =>
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  );

  const copyButton = document.createElement("button");
  copyButton.className = "blog-article-share-link";
  copyButton.type = "button";
  copyButton.textContent = labels.copy;
  copyButton.addEventListener("click", async () => {
    if (!navigator.clipboard?.writeText) {
      status.textContent = labels.copyFailed;
      return;
    }

    try {
      await navigator.clipboard.writeText(getShareDetails().url);
      status.textContent = labels.copied;
    } catch (error) {
      status.textContent = labels.copyFailed;
      console.error("Could not copy article link.", error);
    }
  });
  actions.append(copyButton);

  shareBar.append(actions, status);
  const articleCover = articleHeader.parentElement.querySelector("[data-article-cover]");
  (articleCover || articleHeader).insertAdjacentElement("afterend", shareBar);
}
