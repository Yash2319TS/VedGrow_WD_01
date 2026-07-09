// =========================================================
// Footer year
// =========================================================
document.getElementById("year").textContent = new Date().getFullYear();

// =========================================================
// Mobile nav toggle
// =========================================================
const navToggle = document.getElementById("navToggle");
const mobileNav = document.getElementById("mobileNav");

function closeMobileNav() {
  mobileNav.dataset.open = "false";
  navToggle.setAttribute("aria-expanded", "false");
}

navToggle.addEventListener("click", () => {
  const isOpen = mobileNav.dataset.open === "true";
  mobileNav.dataset.open = String(!isOpen);
  navToggle.setAttribute("aria-expanded", String(!isOpen));
});

// Close mobile nav after any nav link is used, and let the browser
// handle the smooth scroll itself (CSS `scroll-behavior: smooth`).
document.querySelectorAll("[data-nav-link]").forEach((link) => {
  link.addEventListener("click", () => {
    closeMobileNav();
  });
});

// =========================================================
// Smooth scroll fallback for older browsers (progressive enhancement;
// CSS scroll-behavior already covers modern browsers, this just makes
// sure anchor offsets feel right under the fixed topbar)
// =========================================================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const targetId = anchor.getAttribute("href");
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.pushState(null, "", targetId);
  });
});

// =========================================================
// Scroll-spy: highlight the active node on the trace rail
// and grow the copper/cyan fill to match scroll progress.
// =========================================================
const sections = document.querySelectorAll(".section");
const railNodes = document.querySelectorAll(".trace-rail__nodes li");
const railFill = document.getElementById("traceFill");

const nodeMap = {};
railNodes.forEach((node) => {
  nodeMap[node.dataset.node] = node;
  node.addEventListener("click", () => {
    const target = document.getElementById(node.dataset.node);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const spyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const id = entry.target.id;
      if (entry.isIntersecting && nodeMap[id]) {
        railNodes.forEach((n) => n.removeAttribute("data-active"));
        nodeMap[id].setAttribute("data-active", "true");
      }
    });
  },
  { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
);

sections.forEach((section) => spyObserver.observe(section));

function updateRailFill() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
  railFill.style.height = `${progress * 100}%`;
}
window.addEventListener("scroll", updateRailFill, { passive: true });
window.addEventListener("resize", updateRailFill);
updateRailFill();

// =========================================================
// Contact form — Formspree AJAX submit (keeps user on page,
// shows inline success/error status instead of a redirect)
// =========================================================
const contactForm = document.getElementById("contactForm");
const submitBtn = document.getElementById("submitBtn");
const formStatus = document.getElementById("formStatus");

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const endpoint = contactForm.getAttribute("action");
  if (!endpoint || endpoint.includes("YOUR_FORM_ID")) {
    formStatus.dataset.state = "error";
    formStatus.textContent =
      "Set up your Formspree endpoint in index.html to enable this form.";
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";
  formStatus.dataset.state = "";
  formStatus.textContent = "";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: new FormData(contactForm),
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      formStatus.dataset.state = "success";
      formStatus.textContent = "Message sent — thanks, I'll reply soon.";
      contactForm.reset();
    } else {
      const data = await response.json().catch(() => null);
      const msg =
        data && data.errors && data.errors.length
          ? data.errors.map((err) => err.message).join(", ")
          : "Something went wrong. Please try again.";
      formStatus.dataset.state = "error";
      formStatus.textContent = msg;
    }
  } catch (err) {
    formStatus.dataset.state = "error";
    formStatus.textContent = "Network error — please try again shortly.";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Message";
  }
});
