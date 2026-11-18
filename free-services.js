import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  increment,
  query,
  updateDoc,
  where,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const isArabic = document.documentElement.lang === "ar";
const isConfigured = Object.values(firebaseConfig).every(
  (value) => value && !value.startsWith("REPLACE_WITH"),
);

const labels = isArabic ? {
  ai: "الذكاء الاصطناعي",
  design: "التصميم والإبداع",
  development: "البرمجة والتطوير",
  productivity: "الإنتاجية",
  education: "التعليم",
  network: "الشبكات والأدوات",
  pdf: "ملفات PDF",
  other: "خدمات أخرى",
  free: "مجاني بالكامل",
  freemium: "خطة مجانية",
  website: "زيارة الموقع",
  app: "تحميل التطبيق",
  "web-app": "فتح التطبيق",
  loading: "جارٍ تحميل الخدمات…",
  empty: "لا توجد خدمات منشورة حاليًا.",
  title: "الخدمات المجانية المفيدة",
  heading: "أدوات ومواقع <em>تقدر تبدأ بها مجانًا.</em>",
  description: "مجموعة مختارة من المواقع والتطبيقات المفيدة، مع تنبيه واضح عند وجود خطة مدفوعة.",
} : {
  ai: "Artificial intelligence",
  design: "Design & creativity",
  development: "Development",
  productivity: "Productivity",
  education: "Education",
  network: "Networks & tools",
  pdf: "PDF tools",
  other: "Other services",
  free: "Free",
  freemium: "Free plan",
  website: "Visit website",
  app: "Download app",
  "web-app": "Open app",
  loading: "Loading services…",
  empty: "No published services yet.",
  title: "Useful free services",
  heading: "Tools and websites <em>you can start with for free.</em>",
  description: "A curated collection of useful websites and apps, with a clear notice when a paid plan is available.",
};

const suggestedServices = [{
  id: null,
  name: "Canva",
  category: "design",
  serviceType: "web-app",
  pricing: "freemium",
  description: isArabic
    ? "صمم منشورات السوشيال ميديا والعروض التقديمية والفيديوهات واللوجوهات بقوالب جاهزة وخطة مجانية."
    : "Design social media posts, presentations, videos, and logos with ready-made templates and a free plan.",
  url: "https://www.canva.com/",
  imageUrl: "assets/canva-guide-cover.svg",
  isCover: true,
  order: 10,
  articleUrl: isArabic ? "blog/canva-guide.html" : "blog/canva-guide-en.html",
}, {
  id: null,
  name: "CyberChef",
  category: "development",
  serviceType: "web-app",
  pricing: "free",
  description: isArabic
    ? "أداة ويب مجانية من GCHQ لتحليل النصوص وفك التشفير والتحويل والتشفير والضغط وفحص البيانات."
    : "A free GCHQ web tool for text analysis, decoding, encoding, encryption, compression, and data inspection.",
  url: "https://gchq.github.io/CyberChef/",
  imageUrl: "https://github.com/gchq.png",
  order: 20,
}, {
  id: null,
  name: "IT Tools",
  category: "development",
  serviceType: "web-app",
  pricing: "free",
  description: isArabic
    ? "مجموعة أدوات مطورين مفتوحة المصدر للتحويل والترميز وفحص JSON وتوليد مفاتيح وتنفيذ مهام يومية."
    : "An open-source collection of developer tools for conversion, encoding, JSON inspection, key generation, and daily tasks.",
  url: "https://it-tools.tech/",
  imageUrl: "https://github.com/CorentinTh.png",
  order: 30,
}, {
  id: null,
  name: "Squoosh",
  category: "other",
  serviceType: "web-app",
  pricing: "free",
  description: isArabic
    ? "ضغط وتحويل الصور مباشرة في المتصفح من مشروع Google Chrome Labs، بدون رفعها إلى خادم خارجي."
    : "Compress and convert images directly in the browser using Google Chrome Labs Squoosh, without uploading them to a server.",
  url: "https://squoosh.app/",
  imageUrl: "https://github.com/GoogleChromeLabs.png",
  order: 40,
}, {
  id: null,
  name: "PDF.js Viewer",
  category: "pdf",
  serviceType: "web-app",
  pricing: "free",
  description: isArabic
    ? "عارض PDF رسمي مفتوح المصدر من Mozilla لفتح ملفات PDF وقراءة الصفحات والبحث فيها في المتصفح."
    : "Mozilla’s open-source PDF reader for opening, viewing, searching, and navigating PDF documents in the browser.",
  url: "https://mozilla.github.io/pdf.js/web/viewer.html",
  imageUrl: "https://github.com/mozilla.png",
  order: 50,
}, {
  id: null,
  name: "Excalidraw",
  category: "productivity",
  serviceType: "web-app",
  pricing: "free",
  description: isArabic
    ? "لوحة رسم بيضاء مفتوحة المصدر لرسم المخططات والجداول والخرائط الذهنية والتعاون بصريًا."
    : "An open-source virtual whiteboard for hand-drawn diagrams, flowcharts, mind maps, and visual collaboration.",
  url: "https://excalidraw.com/",
  imageUrl: "https://github.com/excalidraw.png",
  order: 60,
}];

const root = document.querySelector("[data-free-services]");
if (!root) throw new Error("Free services section not found.");

root.querySelector("[data-free-services-title]").textContent = labels.title;
root.querySelector("[data-free-services-heading]").innerHTML = labels.heading;
root.querySelector("[data-free-services-description]").textContent = labels.description;

const grid = root.querySelector("[data-free-services-grid]");

function createCard(service, database) {
  const card = document.createElement("article");
  card.className = "free-service-card";

  if (service.imageUrl) {
    const image = document.createElement("img");
    image.className = service.isCover ? "free-service-cover" : "free-service-logo";
    image.src = service.imageUrl;
    image.alt = service.name;
    image.loading = "lazy";
    card.append(image);
  }

  const category = document.createElement("p");
  category.className = "free-service-category";
  category.textContent = labels[service.category] || service.category;
  card.append(category);

  const title = document.createElement("h3");
  title.textContent = service.name;
  card.append(title);

  const description = document.createElement("p");
  description.className = "free-service-description";
  description.textContent = service.description;
  card.append(description);

  const badge = document.createElement("span");
  badge.className = `free-service-badge ${service.pricing === "free" ? "is-free" : ""}`;
  badge.textContent = labels[service.pricing] || labels.free;
  card.append(badge);

  const link = document.createElement("a");
  link.className = "free-service-link free-service-open";
  link.href = service.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = `${labels[service.serviceType] || labels.website} ↗`;
  if (service.id) {
    link.addEventListener("click", () => {
      updateDoc(doc(database, "freeServices", service.id), { clicks: increment(1) }).catch((error) => {
        console.error("Could not record the service click.", error);
      });
    });
  }
  card.append(link);

  if (service.articleUrl) {
    const articleLink = document.createElement("a");
    articleLink.className = "free-service-guide";
    articleLink.href = service.articleUrl;
    articleLink.textContent = isArabic ? "اقرأ دليل Canva الكامل" : "Read the complete Canva guide";
    card.insertBefore(articleLink, link);
  }
  return card;
}

async function loadServices() {
  if (!isConfigured) {
    grid.replaceChildren();
    suggestedServices.forEach((service) => grid.append(createCard(service, null)));
    return;
  }
  grid.replaceChildren();
  suggestedServices.forEach((service) => grid.append(createCard(service, null)));
  const app = initializeApp(firebaseConfig);
  const database = getFirestore(app);
  const snapshot = await getDocs(query(
    collection(database, "freeServices"),
    where("status", "==", "published"),
  ));
  const services = snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .filter((service) => service.name && service.description && service.url)
    .sort((first, second) => (first.order ?? 100) - (second.order ?? 100));
  const combinedServices = [
    ...suggestedServices,
    ...services.filter((service) =>
      !suggestedServices.some((suggested) =>
        suggested.name.toLocaleLowerCase() === String(service.name).toLocaleLowerCase()
      )
    ),
  ].sort((first, second) => (first.order ?? 100) - (second.order ?? 100));
  grid.replaceChildren();
  if (!combinedServices.length) {
    grid.textContent = labels.empty;
    return;
  }
  combinedServices.forEach((service) => grid.append(createCard(service, database)));
}

grid.textContent = labels.loading;
loadServices().catch((error) => {
  console.error("Could not load free services.", error);
  grid.replaceChildren();
  suggestedServices.forEach((service) => grid.append(createCard(service, null)));
});
