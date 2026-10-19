import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const categoryNames = {
  ai: "الذكاء الاصطناعي",
  programming: "البرمجة والتطوير",
  pdf: "ملفات PDF",
  wifi: "Wi-Fi والشبكات",
  "quran-hadith": "القرآن والحديث",
  "android-safety": "أمان تطبيقات Android",
  shopping: "التسوق والعروض",
};

const isConfigured = Object.values(firebaseConfig).every(
  (value) => value && !value.startsWith("REPLACE_WITH"),
);
const articleRoot = document.querySelector("[data-cms-article]");
const app = isConfigured ? initializeApp(firebaseConfig) : null;
const database = app ? getFirestore(app) : null;
if (articleRoot) articleRoot.querySelector("[data-cms-loading]")?.remove();

function addTextElement(parent, tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
}

function formatDate(value) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "long" }).format(date);
}

function createArticleCard(article) {
  const card = document.createElement("article");
  card.className = "blog-card blog-card-cms";
  card.dataset.blogCategory = article.category;
  const metadata = document.createElement("div");
  metadata.className = "blog-card-meta";
  addTextElement(metadata, "span", "blog-category", categoryNames[article.category] || "مقال");
  const time = addTextElement(metadata, "time", "", formatDate(article.publishedAt));
  time.dateTime = article.publishedAt;
  card.append(metadata);
  addTextElement(card, "h2", "", article.title);
  addTextElement(card, "p", "", article.excerpt);
  const link = document.createElement("a");
  link.className = "blog-card-link";
  link.href = `article.html?slug=${encodeURIComponent(article.slug)}`;
  link.append(document.createTextNode("اقرأ المقال "));
  addTextElement(link, "span", "", "←");
  card.append(link);
  return card;
}

async function showPublishedArticles() {
  const grid = document.querySelector(".blog-grid");
  const snapshot = await getDocs(query(
    collection(database, "articles"),
    where("status", "==", "published"),
  ));
  const articles = snapshot.docs
    .map((item) => item.data())
    .filter((article) => article.title && article.slug && article.category && article.publishedAt)
    .sort((first, second) => second.publishedAt.localeCompare(first.publishedAt));
  const fragment = document.createDocumentFragment();
  articles.forEach((article) => fragment.append(createArticleCard(article)));
  grid.prepend(fragment);
  document.dispatchEvent(new Event("blog:cards-changed"));
}

if (document.querySelector(".blog-grid") && isConfigured) {
  showPublishedArticles().catch((error) => {
    const message = document.querySelector("[data-blog-load-error]");
    if (message) {
      message.hidden = false;
      message.textContent = "تعذّر تحميل المقالات الجديدة من خدمة النشر. المقالات الموجودة ما زالت متاحة.";
    }
    console.error("Could not load CMS articles.", error);
  });
}

if (articleRoot && isConfigured) {
  const slug = new URLSearchParams(window.location.search).get("slug");
  if (!slug) {
    addTextElement(articleRoot, "p", "blog-cms-message", "لم يتم تحديد المقال المطلوب.");
  } else {
    getDoc(doc(database, "articles", slug)).then(async (snapshot) => {
      if (!snapshot.exists() || snapshot.data().status !== "published") {
        addTextElement(articleRoot, "p", "blog-cms-message", "المقال غير موجود أو لم يتم نشره.");
        return;
      }
      const article = snapshot.data();
      document.title = `${article.title} | مدونة Nexora`;
      document.querySelector('meta[name="description"]')?.setAttribute("content", article.excerpt);
      document.querySelector('link[rel="canonical"]')?.setAttribute("href", window.location.href);
      addTextElement(articleRoot, "span", "blog-category", categoryNames[article.category] || "مقال");
      const heading = addTextElement(articleRoot, "h1", "", article.title);
      heading.className = "blog-cms-title";
      addTextElement(articleRoot, "p", "blog-article-summary", article.excerpt);
      const date = addTextElement(articleRoot, "time", "blog-cms-date", formatDate(article.publishedAt));
      date.dateTime = article.publishedAt;
      const content = document.createElement("div");
      content.className = "blog-article-content";
      article.content.split(/\n\s*\n/).forEach((block) => {
        const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
        if (lines.length === 0) return;
        if (lines.every((line) => line.startsWith("- "))) {
          const list = document.createElement("ul");
          lines.forEach((line) => addTextElement(list, "li", "", line.slice(2)));
          content.append(list);
        } else if (lines.length === 1 && lines[0].startsWith("## ")) {
          addTextElement(content, "h2", "", lines[0].slice(3));
        } else {
          addTextElement(content, "p", "", lines.join("\n"));
        }
      });
      articleRoot.append(content);

      const offerList = document.createElement("section");
      offerList.className = "blog-cms-offers";
      const publishedOffers = [];
      for (const offerId of article.offerIds || []) {
        const offerSnapshot = await getDoc(doc(database, "affiliateOffers", offerId));
        if (offerSnapshot.exists() && offerSnapshot.data().status === "published") {
          publishedOffers.push(offerSnapshot.data());
        }
      }
      if (publishedOffers.length) {
        addTextElement(offerList, "h2", "", "عروض ومنتجات موصى بها");
        addTextElement(offerList, "p", "blog-cms-disclosure", "قد نحصل على عمولة عند الشراء عبر بعض الروابط، دون تكلفة إضافية عليك.");
        publishedOffers.forEach((offer) => {
          const card = document.createElement("article");
          card.className = "blog-cms-offer";
          if (offer.imageUrl) {
            const image = document.createElement("img");
            image.src = offer.imageUrl;
            image.alt = `${offer.product} — ${offer.partner}`;
            image.loading = "lazy";
            card.append(image);
          }
          addTextElement(card, "p", "blog-cms-partner", offer.partner);
          addTextElement(card, "h3", "", offer.product);
          addTextElement(card, "p", "", offer.description);
          if (offer.discountCode) addTextElement(card, "p", "blog-cms-code", `كود الخصم: ${offer.discountCode}`);
          const link = addTextElement(card, "a", "blog-cms-cta", "اعرف أكثر عن العرض");
          link.href = offer.url;
          link.target = "_blank";
          link.rel = "sponsored nofollow noopener noreferrer";
          card.append(link);
          offerList.append(card);
        });
        articleRoot.append(offerList);
      }
    }).catch((error) => {
      addTextElement(articleRoot, "p", "blog-cms-message", "تعذّر تحميل المقال. يرجى المحاولة لاحقًا.");
      console.error("Could not load CMS article.", error);
    });
  }
} else if (articleRoot) {
  addTextElement(articleRoot, "p", "blog-cms-message", "لم تُربط المدونة بخدمة النشر بعد.");
}
