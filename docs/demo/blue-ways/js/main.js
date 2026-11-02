/*
Template Name: blueways-hotel-reservation-website-template
File Name: main.js
Author Name: ThemeVault
Author URI: https://www.themevault.net/
Version: 2.0

Dependency-free. Bootstrap's own bundle drives the navbar, tabs, carousel,
accordion and scrollspy; everything below replaces what jQuery and its plugins
used to do.
*/
(function () {
    "use strict";

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Back to top — fades in past 100px, returns to the top */
    var toTop = document.getElementById("back-to-top");
    if (toTop) {
        var toggleToTop = function () { toTop.classList.toggle("is-visible", window.scrollY > 100); };
        toggleToTop();
        window.addEventListener("scroll", toggleToTop, { passive: true });
        toTop.addEventListener("click", function (e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
        });
    }

    /* BS3 marked the active tab on the <li>; BS5 marks the <a>. Templates key CSS on li.active (flowerspetal, wrap-d-style) — keep both in step */
    /* BS3's tab plugin worked from any trigger; BS5's needs a .nav / .list-group / [role=tablist] ancestor or it silently does nothing
       (homeapart: eight grid columns switch the portfolio panes). Give such triggers their nearest .row as the tablist. */
    document.querySelectorAll('[data-bs-toggle="tab"], [data-bs-toggle="pill"]').forEach(function (t) {
        if (t.closest('.nav, .list-group, [role="tablist"]')) return;
        var host = t.closest(".row") || t.parentElement.parentElement; if (host && !host.getAttribute("role")) host.setAttribute("role", "tablist");
    });
    /* BS5's scrollspy marks the <a>.active and colours it at (0,3,0) — above a template's ".navbar-default .navbar-nav > li > a" (0,2,2), so
       the spied item went grey (homeapart's "About" on the tablet). BS3 marked the <li>; do the same and take the class off the <a>. */
    document.addEventListener("activate.bs.scrollspy", function (e) {
        var a = e.relatedTarget; if (!a || !a.closest) return;
        var ul = a.closest(".navbar-nav, .nav, ul"); if (ul) ul.querySelectorAll("li.active").forEach(function (li) { li.classList.remove("active"); });
        var li = a.closest("li"); if (li) li.classList.add("active");
        a.classList.remove("active");
    });
    document.addEventListener("shown.bs.tab", function (e) { var a = e.target, ul = a.closest('.nav, [role="tablist"]'); if (!ul) return; ul.querySelectorAll("li").forEach(function (li) { li.classList.remove("active"); }); ul.querySelectorAll("[data-bs-toggle]").forEach(function (t) { if (t !== a) t.classList.remove("active"); }); var li = a.closest("li"); if (li) li.classList.add("active"); });
    /* BS3 marked an open dropdown's parent with .open; BS5 uses .show. Templates
       key CSS on .open (wrap-d-style slides its cart panel in on it) — mirror it. */
    document.addEventListener("shown.bs.dropdown", function (e) { var p = e.target.closest(".dropdown, .btn-group, .dropup") || e.target.parentElement; if (p) p.classList.add("open"); });
    document.addEventListener("hidden.bs.dropdown", function (e) { var p = e.target.closest(".dropdown, .btn-group, .dropup") || e.target.parentElement; if (p) p.classList.remove("open"); });

    /* Tapping a link in the collapsed menu closes it. The dropdown-toggle
       exclusion matters: without it, adding a submenu later makes the whole
       menu retract the moment it is tapped. */
    var collapse = document.querySelector(".navbar-collapse");
    if (collapse) {
        collapse.addEventListener("click", function (e) {
            /* any destination: a .dropdown-item or a bare submenu <a href> too, never an href-less submenu opener */
            var link = e.target.closest("a[href]");
            if (!link || link.classList.contains("dropdown-toggle") || link.getAttribute("href") === "#") return;
            if (!collapse.classList.contains("show")) return;
            var inst = window.bootstrap && bootstrap.Collapse.getInstance(collapse);
            if (inst) inst.hide();
        });
    }

    /* Lightbox — replaces magnific-popup. Arrows and the keyboard step through
       the set; focus is trapped and restored. */
    var popupLinks = Array.prototype.slice.call(document.querySelectorAll("[data-image-popup], [data-lightbox], [data-fancybox]")); /* the port keeps v1's own lightbox attribute (lightbox.js data-lightbox, fancybox) — sojournion */
    if (popupLinks.length) {
        var box = document.createElement("div");
        box.className = "tv-lightbox";
        box.setAttribute("role", "dialog");
        box.setAttribute("aria-modal", "true");
        box.setAttribute("aria-label", "Image viewer");
        box.innerHTML =
            '<button type="button" class="tv-lb-close" aria-label="Close">&times;</button>' +
            '<button type="button" class="tv-lb-prev" aria-label="Previous image">&#10094;</button>' +
            '<img alt="">' +
            '<button type="button" class="tv-lb-next" aria-label="Next image">&#10095;</button>';
        document.body.appendChild(box);
        var lbImg = box.querySelector("img"), current = 0, lastFocus = null;
        var show = function (i) {
            current = (i + popupLinks.length) % popupLinks.length;
            var link = popupLinks[current];
            lbImg.src = link.getAttribute("href");
            var inner = link.querySelector("img");
            lbImg.alt = (inner && inner.getAttribute("alt")) || "Gallery image";
        };
        var open = function (i) {
            lastFocus = document.activeElement; show(i);
            box.classList.add("is-open"); document.body.style.overflow = "hidden";
            box.querySelector(".tv-lb-close").focus();
        };
        var close = function () {
            box.classList.remove("is-open"); document.body.style.overflow = "";
            lbImg.removeAttribute("src"); if (lastFocus) lastFocus.focus();
        };
        /* ONE delegated listener: the carousel runs after this and clones its slides with cloneNode, which drops per-link
           listeners — a tap on a looped (cloned) gallery slide opened nothing (barbeard's works carousel). A clone maps back
           to its original by href, so the arrows still step through the real set only. */
        document.addEventListener("click", function (e) {
            var link = e.target.closest && e.target.closest("[data-image-popup], [data-lightbox], [data-fancybox]");
            if (!link) return;
            var i = popupLinks.indexOf(link), href = link.getAttribute("href");
            if (i < 0) for (var k = 0; k < popupLinks.length; k++) if (popupLinks[k].getAttribute("href") === href) { i = k; break; }
            if (i < 0) return;
            e.preventDefault(); open(i);
        });
        box.querySelector(".tv-lb-close").addEventListener("click", close);
        box.querySelector(".tv-lb-prev").addEventListener("click", function () { show(current - 1); });
        box.querySelector(".tv-lb-next").addEventListener("click", function () { show(current + 1); });
        box.addEventListener("click", function (e) { if (e.target === box) close(); });
        document.addEventListener("keydown", function (e) {
            if (!box.classList.contains("is-open")) return;
            if (e.key === "Escape") close();
            if (e.key === "ArrowLeft") show(current - 1);
            if (e.key === "ArrowRight") show(current + 1);
        });
    }

    /* A static template posts nowhere, so rather than pretend, validate and
       say so plainly. */
    var form = document.querySelector("form.tv-contact-form"); /* form. — a template's own wrapper <div class="tv-contact-form"> (cunsultix contact.html) is not a form */
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            if (!form.checkValidity()) { form.classList.add("was-validated"); return; }
            var note = form.querySelector(".tv-form-note");
            if (note) { note.hidden = false; note.focus(); }
            form.reset(); form.classList.remove("was-validated");
        });
    }
})();

/* Footer year */
(function () { var y = document.getElementById("tv-year"); if (y) y.textContent = String(new Date().getFullYear()); })();

/* No transitions on first paint, and no :hover-driven menus until the visitor moves: a browser can paint the new page with the cursor
   already resting on a nav item, so a hover-opened mega menu or cart panel shows for a moment and then animates shut
   (wrap-d-style, owner note 16). tv-preload drops transitions; tv-nohover keeps hover menus closed until the first real input. */
(function () {
    var body = document.body; body.classList.add("tv-nohover");
    var go = function () { requestAnimationFrame(function () { body.classList.remove("tv-preload"); }); };
    if (document.readyState === "complete") go(); else window.addEventListener("load", go);
    var release = function () { body.classList.remove("tv-nohover"); ["mousemove", "touchstart", "keydown", "wheel"].forEach(function (t) { window.removeEventListener(t, release); }); };
    ["mousemove", "touchstart", "keydown", "wheel"].forEach(function (t) { window.addEventListener(t, release, { passive: true }); });
})();

/* BW-DESIGN START */
/* Blueways 2.0 — design behaviours: header on scroll, smooth in-page scroll (v1's handler), gallery opener, weekly countdown,
   booking-log dates. Plain DOM; Bootstrap's bundle drives the carousels, collapse, dropdown and scrollspy. */
(function () {
    "use strict";
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var body = document.body;


    /* v1: $(".navbar a, .tv-footer-menu-color ul li a, footer a[href='#myPage']").on('click') — animate to the hash, then set it.
       Same selectors (plus the new header), same behaviour; a hash this page does not carry (#myPage on an inner page) goes to the top. */
    document.addEventListener("click", function (e) {
        var a = e.target.closest && e.target.closest(".bw-nav a, .navbar a, .tv-footer-menu-color ul li a, footer a[href='#myPage'], .bw-hero a[href^='#']");
        if (!a || !a.hash) return;
        if (a.pathname.replace(/\/index\.html$/, "/") !== location.pathname.replace(/\/index\.html$/, "/")) return;
        e.preventDefault();
        var hash = a.hash, target = hash === "#myPage" ? null : document.querySelector(hash);
        /* the header is a side column on desktop and scrolls away on smaller screens: nothing overlaps the target.
           From the open phone/tablet menu, measure only once the menu has shut — while open it pushes the page down ~500px. */
        var go = function () {
            var top = target ? target.getBoundingClientRect().top + window.scrollY : 0;
            window.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
        };
        var panel = a.closest(".navbar-collapse.show, .navbar-collapse.collapsing");
        if (panel) panel.addEventListener("hidden.bs.collapse", go, { once: true }); else go();
        if (history.replaceState) history.replaceState(null, "", hash);
    });

    var money = function (n) { return "$" + Math.round(n).toLocaleString("en-US"); };
    var nightsOf = function (form) {
        var a = form.querySelector("[name='checkin']"), b = form.querySelector("[name='checkout']");
        if (!a || !b || !a.value || !b.value) return 0;
        return Math.max(0, Math.round((new Date(b.value + "T00:00") - new Date(a.value + "T00:00")) / 864e5));
    };
    var fmt = function (v) { return v ? new Date(v + "T00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""; };

    /* rooms.html: filter by kind in place, no reload */
    var fList = document.querySelector("[data-bw-filter-list]");
    if (fList) {
        document.querySelectorAll("[data-bw-filter]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var k = btn.getAttribute("data-bw-filter");
                document.querySelectorAll("[data-bw-filter]").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
                fList.querySelectorAll("[data-kind]").forEach(function (c) { c.hidden = k !== "all" && c.getAttribute("data-kind") !== k; });
            });
        });
    }

    /* room-details.html: thumbnails swap the main photo */
    var photo = document.querySelector("[data-bw-photo]");
    if (photo) {
        var thumbs = document.querySelectorAll("[data-bw-thumb]"), cap = document.querySelector("[data-bw-photo-cap]"), count = photo.parentNode.querySelector("figcaption .bw-mono");
        thumbs.forEach(function (t, i) {
            t.addEventListener("click", function () {
                photo.src = t.getAttribute("data-bw-thumb"); photo.alt = t.getAttribute("data-cap");
                if (cap) cap.textContent = t.getAttribute("data-cap");
                if (count) count.textContent = (i + 1) + " / " + thumbs.length;
                thumbs.forEach(function (x) { x.setAttribute("aria-pressed", String(x === t)); });
            });
        });
    }

    /* room-details.html: live price for the chosen dates */
    document.querySelectorAll("[data-bw-quote]").forEach(function (f) {
        var rate = +f.getAttribute("data-bw-quote");
        var upd = function () {
            var n = nightsOf(f), sub = n * rate;
            f.querySelector("[data-bw-q-nights]").textContent = n ? money(rate) + " × " + n + (n > 1 ? " nights" : " night") : "Choose your dates";
            f.querySelector("[data-bw-q-sub]").textContent = n ? money(sub) : "—";
            f.querySelector("[data-bw-q-tax]").textContent = n ? money(sub * .12) : "—";
            f.querySelector("[data-bw-q-total]").textContent = n ? money(sub * 1.12) : "—";
        };
        f.addEventListener("change", upd); f.addEventListener("input", upd); upd();
    });

    /* booking.html: running summary + the offer a package link carried */
    var bf = document.querySelector("form[data-bw-form='booking']");
    var sumUpd = function () {
        if (!bf) return;
        var sel = bf.querySelector("[name='room']"), opt = sel.options[sel.selectedIndex], rate = +(opt && opt.getAttribute("data-price") || 0);
        var n = nightsOf(bf), sub = n * rate, ex = 0;
        bf.querySelectorAll("[name='extra']:checked").forEach(function (x) { ex += +x.getAttribute("data-price"); });
        var set = function (k, v) { var el = document.querySelector("[data-bw-s-" + k + "]"); if (el) el.textContent = v; };
        set("room", rate ? opt.textContent.split(" — ")[0] : "Not chosen");
        var a = bf.querySelector("[name='checkin']").value, b = bf.querySelector("[name='checkout']").value;
        set("dates", a && b ? fmt(a) + " – " + fmt(b) : "Not chosen");
        set("nights", n ? String(n) : "—");
        set("sub", n && rate ? money(sub) : "—");
        set("extras", money(ex));
        set("tax", n && rate ? money((sub + ex) * .12) : "—");
        set("total", n && rate ? money((sub + ex) * 1.12) : "—");
    };
    if (bf) {
        bf.addEventListener("change", sumUpd); bf.addEventListener("input", sumUpd);
        var OFFERS = { "honeymoon-week": ["Honeymoon Packages — 7 nights in an Ocean Villa", "ocean-villa"], "honeymoon-cabana": ["Honeymoon Packages — 5 nights in a Pool Cabana", "pool-cabana"], "weekly-deal": ["Deals this week — Save 50% on the Executive Studio", "executive-studio"] };
        var offer = OFFERS[new URLSearchParams(location.search).get("offer")];
        if (offer) {
            var note = bf.querySelector("[data-bw-offer]"); note.querySelector("span").textContent = "Offer applied: " + offer[0]; note.hidden = false;
            var rs = bf.querySelector("[name='room']"); if (!rs.value) rs.value = offer[1];
        }
    }

    /* booking + table forms: validate, then confirm in place (a static template posts nowhere) */
    document.querySelectorAll("form[data-bw-form]").forEach(function (f) {
        f.addEventListener("submit", function (e) {
            e.preventDefault();
            if (!f.checkValidity()) { f.classList.add("was-validated"); var bad = f.querySelector(":invalid"); if (bad) bad.focus(); return; }
            var kind = f.getAttribute("data-bw-form"), done = document.querySelector("[data-bw-done='" + kind + "']");
            if (!done) return;
            var v = function (n) { var el = f.querySelector("[name='" + n + "']"); return el ? el.value.trim() : ""; };
            var put = function (k, t) { var el = done.querySelector("[data-bw-d-" + k + "]"); if (el && t) el.textContent = t; };
            put("name", v("first_name") || v("name").split(" ")[0]);
            put("email", v("email"));
            put("ref", "BW-" + String(Math.floor(100000 + Math.random() * 900000)));
            put("guests", v("guests"));
            put("when", fmt(v("checkin")) + (v("time") ? " at " + v("time") : ""));
            var dl = done.querySelector("[data-bw-d-sum]");
            if (dl) {
                dl.innerHTML = "";
                [["Room", "room"], ["Dates", "dates"], ["Nights", "nights"], ["Total", "total"]].forEach(function (r) {
                    var src = document.querySelector("[data-bw-s-" + r[1] + "]"); if (!src) return;
                    var d = document.createElement("div"), dt = document.createElement("dt"), dd = document.createElement("dd");
                    dt.textContent = r[0]; dd.textContent = src.textContent; d.appendChild(dt); d.appendChild(dd); dl.appendChild(d);
                });
            }
            (kind === "booking" ? f.closest(".bw-book__grid").querySelectorAll(".bw-bookform, .bw-book__aside") : [f]).forEach(function (x) { x.hidden = true; });
            done.hidden = false; done.focus();
            if (kind === "booking") window.scrollTo({ top: done.getBoundingClientRect().top + window.scrollY - 24, behavior: reduce ? "auto" : "smooth" });
        });
    });

    /* sliders keep one height: slides with longer copy made the rooms slider jump on every step (owner note) */
    var sliders = document.querySelectorAll(".bw-roomslider .carousel-inner, .bw-quoteslider .carousel-inner, .bw-hero__slider .carousel-inner");
    var level = function () {
        sliders.forEach(function (inner) {
            var items = inner.querySelectorAll(":scope > .carousel-item"), max = 0;
            inner.style.minHeight = "";
            items.forEach(function (it) {
                var was = it.style.display; it.style.display = "block";
                max = Math.max(max, it.offsetHeight); it.style.display = was;
            });
            if (max) inner.style.minHeight = max + "px";
        });
    };
    level();
    window.addEventListener("load", level);
    var lvT; window.addEventListener("resize", function () { clearTimeout(lvT); lvT = setTimeout(level, 150); });

    /* scrollspy (v1: data-spy="scroll" on the body). Bootstrap's cannot watch "#myPage" — the body — so on load it marked
       "rooms" instead of Home (owner note). Home stays current until a menu section reaches the top third of the screen. */
    var spyLinks = Array.prototype.slice.call(document.querySelectorAll(".bw-menu a.nav-link[href^='#']"));
    if (spyLinks.length && document.getElementById("myPage")) {
        var spy = function () {
            var line = window.innerHeight * 0.35, cur = spyLinks[0];
            spyLinks.forEach(function (a) {
                var t = a.hash !== "#myPage" && document.querySelector(a.hash);
                if (t && t.getBoundingClientRect().top <= line) cur = a;
            });
            spyLinks.forEach(function (a) { var li = a.closest("li"); if (li) li.classList.toggle("active", a === cur); });
        };
        spy();
        window.addEventListener("scroll", spy, { passive: true });
        window.addEventListener("resize", spy);
    }

    /* "Browse Our Gallery" opens the lightbox on the first photo */
    document.querySelectorAll("[data-bw-gallery-open]").forEach(function (b) {
        b.addEventListener("click", function (e) {
            var first = document.querySelector("[data-image-popup]");
            if (!first) return;
            e.preventDefault(); first.click();
        });
    });

    /* weekly deal: counts down to Sunday 23:59 local time */
    var cd = document.querySelector("[data-bw-countdown]");
    if (cd) {
        var tick = function () {
            var now = new Date(), end = new Date(now);
            end.setDate(now.getDate() + ((7 - now.getDay()) % 7)); end.setHours(23, 59, 59, 999);
            var s = Math.max(0, Math.floor((end - now) / 1000));
            cd.querySelector("[data-d]").textContent = String(Math.floor(s / 86400));
            cd.querySelector("[data-h]").textContent = String(Math.floor(s % 86400 / 3600)).padStart(2, "0");
            cd.querySelector("[data-m]").textContent = String(Math.floor(s % 3600 / 60)).padStart(2, "0");
        };
        tick(); setInterval(tick, 30000);
    }

    /* booking dates: nothing in the past, check-out at least one night after check-in; query-string values prefill (booking.html) */
    var iso = function (d) { return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
    document.querySelectorAll("input[name='checkin']").forEach(function (ci) {
        var form = ci.form, co = form && form.querySelector("input[name='checkout']");
        var today = new Date(); ci.min = iso(today);
        if (!co) return;
        var sync = function () {
            var d = ci.value ? new Date(ci.value + "T00:00") : today; d.setDate(d.getDate() + 1);
            co.min = iso(d); if (co.value && co.value < co.min) co.value = co.min;
        };
        ci.addEventListener("change", sync); sync();
    });
    var qs = new URLSearchParams(location.search);
    qs.forEach(function (v, k) {
        var f = document.querySelector("form[data-bw-prefill] [name='" + k.replace(/[^a-z-]/gi, "") + "']");
        if (f && (f.tagName !== "SELECT" || f.querySelector("option[value='" + v.replace(/[^a-z0-9-]/gi, "") + "']"))) f.value = v;
    });
    /* re-run the date rules and the booking summary on the prefilled values */
    document.querySelectorAll("form[data-bw-prefill] input[name='checkin']").forEach(function (el) { el.dispatchEvent(new Event("change", { bubbles: true })); });
    sumUpd();

})();
/* BW-DESIGN END */
