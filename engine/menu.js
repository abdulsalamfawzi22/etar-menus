/* ==========================================================================
   إطار — محرّك المنيو الرقمي  |  menu.js
   يقرأ menu.json ويبني الصفحة كاملة. ملف مشترك — لا تضع فيه شيئاً خاصاً بعميل.
   ========================================================================== */
(function () {
  "use strict";

  var UI = {
    ar: {
      draft: "نموذج مبدئي للعرض — الأصناف والأسعار مؤقتة وتُستبدل بقائمتكم الحقيقية",
      draftBy: "من تنفيذ إطار",
      langBtn: "English",
      open: "مفتوح الآن",
      note: "جميع الأسعار شاملة ضريبة القيمة المضافة",
      ctaT: "تحتاج شي؟",
      ctaS: "تواصل معنا مباشرة",
      ctaB: "اطلب عبر واتساب",
      best: "الأكثر طلباً",
      new: "جديد",
      tabsLabel: "أقسام المنيو",
      waMsg: "السلام عليكم، شفت المنيو وأبغى أستفسر."
    },
    en: {
      draft: "Preview draft — items and prices are placeholders and will be replaced with your real menu",
      draftBy: "Built by Etar",
      langBtn: "العربية",
      open: "Open now",
      note: "All prices include VAT",
      ctaT: "Need anything?",
      ctaS: "Talk to us directly",
      ctaB: "Chat on WhatsApp",
      best: "Best seller",
      new: "New",
      tabsLabel: "Menu categories",
      waMsg: "Hello, I saw the menu and would like to ask about something."
    }
  };

  var DATA = null;
  var lang = "ar";
  var LS_KEY = "etar_menu_lang";

  function u(k) { return UI[lang][k]; }
  function pick(obj, key) { return lang === "ar" ? obj[key + "Ar"] || obj.ar : obj[key + "En"] || obj.en; }

  /* فاصل زخرفي: خط — معيّن — خط */
  function ornament() {
    var o = el("div", "ornament");
    o.setAttribute("aria-hidden", "true");
    o.appendChild(el("i"));
    o.appendChild(el("b"));
    o.appendChild(el("i"));
    return o;
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* ---------------- بناء الصفحة ---------------- */
  function render() {
    var b = DATA.brand;
    var root = document.documentElement;

    root.setAttribute("lang", lang);
    root.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    root.setAttribute("data-theme", b.theme === "dark" ? "dark" : "light");
    root.style.setProperty("--brand", b.color || "#c9a227");
    root.style.setProperty("--brand-2", b.color2 || "#8a5a2b");

    var name = lang === "ar" ? b.ar : b.en;
    document.title = name + (lang === "ar" ? " | المنيو" : " | Menu");

    var app = document.getElementById("app");
    app.textContent = "";

    /* شريط النموذج المبدئي */
    if (DATA.draft) {
      var db = el("div", "draft-bar");
      db.appendChild(el("b", null, "⚠️"));
      db.appendChild(el("span", null, u("draft")));
      db.appendChild(el("b", null, "· " + u("draftBy")));
      app.appendChild(db);
    }

    /* الغلاف والرأس */
    var cover = el("div", "m-cover");
    cover.setAttribute("aria-hidden", "true");
    app.appendChild(cover);

    var head = el("header", "m-head");
    var logo = el("div", "m-logo");
    logo.setAttribute("aria-hidden", "true");
    logo.appendChild(el("span", null, b.initial || name.slice(0, 3)));
    head.appendChild(logo);

    head.appendChild(el("h1", null, name));
    head.appendChild(el("p", "m-tagline", pick(b, "tagline")));
    head.appendChild(ornament());

    var meta = el("div", "m-meta");
    var openSpan = el("span");
    openSpan.appendChild(el("b", null, u("open")));
    openSpan.appendChild(document.createTextNode(" · " + pick(b, "hours")));
    meta.appendChild(openSpan);
    head.appendChild(meta);

    var langBtn = el("button", "m-lang", u("langBtn"));
    langBtn.type = "button";
    langBtn.addEventListener("click", function () {
      setLang(lang === "ar" ? "en" : "ar");
    });
    head.appendChild(langBtn);
    app.appendChild(head);

    /* شريط الأقسام */
    var nav = el("nav", "m-tabs");
    nav.setAttribute("aria-label", u("tabsLabel"));
    var scroll = el("div", "m-tabs-scroll");
    DATA.categories.forEach(function (c) {
      var a = el("a", "m-tab", lang === "ar" ? c.ar : c.en);
      a.href = "#" + c.id;
      scroll.appendChild(a);
    });
    nav.appendChild(scroll);
    app.appendChild(nav);

    /* الأقسام والأصناف */
    var main = el("main", "m-main");
    DATA.categories.forEach(function (c) {
      var sec = el("section", "m-cat");
      sec.id = c.id;

      var head2 = el("div", "cat-head");
      if (c.icon) {
        var ic = el("span", "cat-icon", c.icon);
        ic.setAttribute("aria-hidden", "true");
        head2.appendChild(ic);
      }
      head2.appendChild(el("h2", null, lang === "ar" ? c.ar : c.en));
      head2.appendChild(ornament());
      sec.appendChild(head2);

      var panel = el("div", "m-panel");
      c.items.forEach(function (it) { panel.appendChild(buildItem(it, c)); });
      sec.appendChild(panel);
      main.appendChild(sec);
    });

    var note = el("div", "m-note");
    note.appendChild(ornament());
    note.appendChild(el("p", null, u("note")));
    main.appendChild(note);
    app.appendChild(main);

    /* الشريط السفلي */
    var wa = (b.whatsapp || "").replace(/\D/g, "");
    if (wa) {
      var cta = el("div", "m-cta");
      var txt = el("div", "m-cta-txt");
      txt.appendChild(el("b", null, u("ctaT")));
      txt.appendChild(el("span", null, u("ctaS")));
      cta.appendChild(txt);

      var btn = el("a", "m-cta-btn", u("ctaB"));
      btn.href = "https://wa.me/" + wa + "?text=" + encodeURIComponent(u("waMsg"));
      btn.target = "_blank";
      btn.rel = "noopener";
      cta.appendChild(btn);
      app.appendChild(cta);
    }

    initTabs();
    initReveal();
  }

  /* ظهور الأقسام عند التمرير */
  function initReveal() {
    var cats = document.querySelectorAll(".m-cat");
    if (!("IntersectionObserver" in window)) {
      cats.forEach(function (c) { c.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        io.unobserve(en.target);
      });
    }, { threshold: 0.06, rootMargin: "0px 0px -30px 0px" });
    cats.forEach(function (c) { io.observe(c); });
  }

  function buildItem(it, cat) {
    var art = el("article", "m-item");

    // الصورة تُعرض فقط إن وُجدت فعلاً. بديلها ليس إيموجي مكرراً —
    // المنيو النصّي بالخط المنقّط أنظف وأفخم.
    if (it.img) {
      var thumb = el("div", "m-thumb");
      thumb.setAttribute("aria-hidden", "true");
      var im = el("img");
      im.src = "img/" + it.img;
      im.alt = "";
      im.loading = "lazy";
      im.decoding = "async";
      thumb.appendChild(im);
      art.appendChild(thumb);
    } else {
      art.classList.add("no-img");
    }

    var body = el("div", "m-body");
    var h3 = el("h3", "m-name");
    h3.appendChild(el("span", null, lang === "ar" ? it.ar : it.en));
    if (it.tag === "best") h3.appendChild(el("span", "tag tag-best", u("best")));
    if (it.tag === "new")  h3.appendChild(el("span", "tag tag-new", u("new")));
    body.appendChild(h3);

    var desc = pick(it, "desc");
    if (desc && desc !== it.ar && desc !== it.en) body.appendChild(el("p", "m-desc", desc));
    art.appendChild(body);

    var lead = el("span", "leader");
    lead.setAttribute("aria-hidden", "true");
    art.appendChild(lead);

    var price = el("div", "m-price");
    price.appendChild(el("b", null, String(it.price)));
    price.appendChild(el("small", null, lang === "ar"
      ? (DATA.brand.currencyAr || "ر.س")
      : (DATA.brand.currencyEn || "SAR")));
    art.appendChild(price);

    return art;
  }

  /* ---------------- شريط الأقسام النشط ---------------- */
  function initTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".m-tab"));
    var sections = tabs
      .map(function (a) { return document.querySelector(a.getAttribute("href")); })
      .filter(Boolean);
    if (!sections.length) return;

    function activate(id) {
      tabs.forEach(function (a) {
        var on = a.getAttribute("href") === "#" + id;
        a.classList.toggle("active", on);
        if (on) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");

        // تمرير الشريط أفقياً فقط. استخدام a.scrollIntoView هنا يخطف تمرير
        // الصفحة كاملةً بسبب الشريط اللاصق + scroll-padding-top.
        if (on) {
          var box = a.parentElement;
          if (box && box.scrollTo) {
            box.scrollTo({
              left: a.offsetLeft - (box.clientWidth - a.offsetWidth) / 2,
              behavior: "smooth"
            });
          }
        }
      });
    }

    if ("IntersectionObserver" in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) activate(en.target.id);
        });
      }, { rootMargin: "-30% 0px -60% 0px", threshold: 0 });
      sections.forEach(function (s) { spy.observe(s); });
    }

    var hash = (location.hash || "").slice(1);
    activate(hash && document.getElementById(hash) ? hash : sections[0].id);
  }

  /* ---------------- اللغة ---------------- */
  function setLang(next) {
    lang = Object.prototype.hasOwnProperty.call(UI, next) ? next : "ar";
    try { localStorage.setItem(LS_KEY, lang); } catch (e) { /* تجاهل */ }
    render();
  }

  /* ---------------- الإقلاع ---------------- */
  function boot() {
    var saved = null;
    try { saved = localStorage.getItem(LS_KEY); } catch (e) { /* تجاهل */ }
    lang = Object.prototype.hasOwnProperty.call(UI, saved) ? saved : "ar";

    fetch("menu.json", { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (d) { DATA = d; render(); })
      .catch(function (err) {
        document.getElementById("app").innerHTML =
          '<p style="padding:40px;text-align:center;color:#b91c1c">' +
          'تعذّر تحميل المنيو. تأكد من فتح الصفحة عبر سيرفر وليس من الملف مباشرة.</p>';
        console.error("[إطار] فشل تحميل menu.json:", err);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
