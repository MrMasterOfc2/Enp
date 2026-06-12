window.Store = {
  defaults: {
    teachers: [
      { id: 1, name: "Anjana Silva", role: "Lead Technology Instructor", initials: "AS", photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=700&q=85", bio: "Making complex technology simple, practical, and enjoyable.", skills: ["Web Development", "Programming"] },
      { id: 2, name: "Nimasha Kumari", role: "Creative Design Instructor", initials: "NK", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=85", bio: "Helping students turn creative ideas into confident visual work.", skills: ["Graphic Design", "UI Design"] },
      { id: 3, name: "Ravindu Madushan", role: "Hardware & Network Instructor", initials: "RM", photo: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=700&q=85", bio: "Hands-on guidance in hardware, networking, and troubleshooting.", skills: ["Networking", "Hardware"] }
    ],
    chats: [],
    feedback: [],
    blogs: [
      { id: 1, title: "5 Skills Every Student Needs for the Digital Future", category: "Learning", excerpt: "A practical guide to the technology skills that create confidence and new opportunities.", content: "Technology changes quickly, but strong foundations continue to matter. Digital literacy, creative problem solving, communication, safe internet habits, and the confidence to keep learning are five skills every student can begin developing today.", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=85", author: "Anjana Silva", date: "June 10, 2026", status: "Published" },
      { id: 2, title: "Why Learning Through Real Projects Works", category: "Student Success", excerpt: "Discover how practical projects turn lessons into skills you can confidently use.", content: "Real projects connect ideas to outcomes. When students design a poster, build a website, or troubleshoot a network, they learn how individual lessons work together and gain the confidence to solve unfamiliar problems.", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=85", author: "Nimasha Kumari", date: "June 6, 2026", status: "Published" },
      { id: 3, title: "A Parent's Guide to Helping Kids Learn Coding", category: "Kids Coding", excerpt: "Simple ways parents can encourage curiosity, logic, and creativity at home.", content: "Children learn coding best when it feels creative. Encourage them to experiment, celebrate small wins, ask how their projects work, and give them room to solve problems independently.", image: "https://images.unsplash.com/photo-1603354350317-6f7aaa5911c5?auto=format&fit=crop&w=1000&q=85", author: "E Nena Team", date: "May 28, 2026", status: "Published" }
    ],
    users: [{ name: "Administrator", email: "admin@enenapiyasa.lk", password: "admin123", role: "admin" }]
  },
  get(key) {
    const saved = localStorage.getItem(`enp_${key}`);
    if (!saved) return this.defaults[key];
    const value = JSON.parse(saved);
    if (key === "teachers") return value.map(teacher => ({ ...this.defaults.teachers.find(item => item.id === teacher.id), ...teacher }));
    return value;
  },
  set(key, value) {
    localStorage.setItem(`enp_${key}`, JSON.stringify(value));
    window.FirebaseBridge?.set(key, value);
  }
};
const Store = window.Store;

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2800);
}

function renderTeachers() {
  const grid = document.getElementById("teacherGrid");
  if (!grid) return;
  grid.innerHTML = Store.get("teachers").map(teacher => `
    <article class="teacher-card reveal visible">
      <div class="teacher-photo">${teacher.photo ? `<img src="${teacher.photo}" alt="${teacher.name}">` : teacher.initials}</div>
      <div class="teacher-info">
        <h3>${teacher.name}</h3><span>${teacher.role}</span>
        <p>${teacher.bio}</p>
        <div class="teacher-skills">${teacher.skills.map(skill => `<span>${skill}</span>`).join("")}</div>
      </div>
    </article>`).join("");
}

function renderBlogs() {
  const grid = document.getElementById("blogGrid");
  if (!grid) return;
  const blogs = Store.get("blogs").filter(blog => blog.status === "Published");
  grid.innerHTML = blogs.map(blog => `<article class="blog-card reveal visible"><div class="blog-image">${blog.image ? `<img src="${blog.image}" alt="${blog.title}">` : `<span>ENP</span>`}<b>${blog.category}</b></div><div class="blog-copy"><div class="blog-meta"><span>${blog.date}</span><span>By ${blog.author}</span></div><h3>${blog.title}</h3><p>${blog.excerpt}</p><button onclick="openBlog(${blog.id})">Read article <span>→</span></button></div></article>`).join("") || `<div class="blog-empty">New articles are coming soon.</div>`;
}
window.openBlog = id => {
  const blog = Store.get("blogs").find(item => item.id === id);
  if (!blog) return;
  document.getElementById("blogModalImage").src = blog.image || "";
  document.getElementById("blogModalImage").style.display = blog.image ? "block" : "none";
  document.getElementById("blogModalCategory").textContent = blog.category;
  document.getElementById("blogModalTitle").textContent = blog.title;
  document.getElementById("blogModalMeta").textContent = `${blog.date} · By ${blog.author}`;
  document.getElementById("blogModalContent").textContent = blog.content;
  document.getElementById("blogModal").classList.add("open");
};
document.getElementById("closeBlog")?.addEventListener("click", () => document.getElementById("blogModal").classList.remove("open"));

function setupChat() {
  const widget = document.getElementById("chatWidget");
  const messages = document.getElementById("chatMessages");
  if (!widget || !messages) return;
  document.getElementById("chatLauncher").onclick = () => widget.classList.toggle("open");
  document.getElementById("closeChat").onclick = () => widget.classList.remove("open");

  const render = () => {
    const chats = Store.get("chats");
    messages.innerHTML = `<div class="message">Hello! Welcome to E Nena Piyasa. How can I help you today?<small>E Nena Assistant</small></div>` +
      chats.map(chat => `<div class="message ${chat.from}">${chat.text}<small>${chat.time}</small></div>`).join("");
    messages.scrollTop = messages.scrollHeight;
  };
  render();

  document.getElementById("chatForm").onsubmit = event => {
    event.preventDefault();
    const input = document.getElementById("chatInput");
    const chats = Store.get("chats");
    chats.push({ from: "user", text: input.value.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
    Store.set("chats", chats);
    input.value = "";
    render();
    setTimeout(() => {
      const updated = Store.get("chats");
      updated.push({ from: "bot", text: "Thanks for your message. Our student advisor will reply shortly. You can also call us on +94 77 123 4567.", time: "Now" });
      Store.set("chats", updated);
      render();
    }, 700);
  };
}

function setupFeedback() {
  const form = document.getElementById("feedbackForm");
  if (!form) return;
  form.onsubmit = event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const feedback = Store.get("feedback");
    feedback.unshift({ id: Date.now(), ...data, date: new Date().toLocaleString(), status: "New" });
    Store.set("feedback", feedback);
    form.reset();
    showToast("Message sent successfully. We'll be in touch!");
  };
}

function setupNewsletter() {
  const form = document.getElementById("newsletterForm");
  if (!form) return;
  form.onsubmit = event => {
    event.preventDefault();
    showToast("You're subscribed to E Nena Piyasa updates!");
    form.reset();
  };
}

function setupNavigation() {
  const menu = document.getElementById("navLinks");
  document.getElementById("menuToggle")?.addEventListener("click", () => menu.classList.toggle("open"));
  menu?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => menu.classList.remove("open")));
  const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.isIntersecting && entry.target.classList.add("visible")), { threshold: .12 });
  document.querySelectorAll(".reveal").forEach(item => observer.observe(item));
}

function setupExperience() {
  const savedTheme = localStorage.getItem("enp_theme");
  document.documentElement.dataset.theme = savedTheme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.getElementById("themeToggle")?.addEventListener("click", () => {
    const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("enp_theme", theme);
  });
  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    addEventListener("scroll", () => backToTop.classList.toggle("show", scrollY > 500));
    backToTop.onclick = () => scrollTo({ top: 0, behavior: "smooth" });
  }
  const counters = document.querySelectorAll("[data-count]");
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting || entry.target.dataset.done) return;
    entry.target.dataset.done = "true";
    const target = Number(entry.target.dataset.count);
    const started = performance.now();
    const tick = now => {
      const progress = Math.min((now - started) / 1400, 1);
      const value = Math.floor(target * (1 - Math.pow(1 - progress, 3)));
      entry.target.textContent = `${value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value}${entry.target.dataset.suffix || ""}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { threshold: .5 });
  counters.forEach(counter => observer.observe(counter));
  document.addEventListener("click", event => {
    if (event.target.closest("input, textarea, select")) return;
    const ripple = document.createElement("span");
    ripple.className = "water-ripple";
    ripple.style.left = `${event.clientX}px`; ripple.style.top = `${event.clientY}px`;
    document.body.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  });
}

function setupPreloader() {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;
  const percent = document.getElementById("preloaderPercent");
  let progress = 0;
  const timer = setInterval(() => {
    progress = Math.min(progress + Math.ceil(Math.random() * 9), 92);
    if (percent) percent.textContent = `${progress}%`;
  }, 90);
  const finish = () => {
    clearInterval(timer);
    if (percent) percent.textContent = "100%";
    preloader.classList.add("complete");
    document.body.classList.add("page-ready");
    setTimeout(() => preloader.remove(), 850);
  };
  if (document.readyState === "complete") setTimeout(finish, 350);
  else addEventListener("load", () => setTimeout(finish, 350), { once: true });
  setTimeout(finish, 3500);
}

renderTeachers();
renderBlogs();
setupChat();
setupFeedback();
setupNewsletter();
setupNavigation();
setupExperience();
setupPreloader();

addEventListener("enp:data-changed", event => {
  if (event.detail.key === "teachers") renderTeachers();
  if (event.detail.key === "blogs") renderBlogs();
  if (event.detail.key === "chats") setupChat();
});
