const ADMIN_PIN = "2026";
const pinGate = document.getElementById("pinGate");
const pinForm = document.getElementById("pinForm");
const pinInputs = [...pinForm.querySelectorAll("input")];
function setPanelLocked(locked) {
  document.body.classList.toggle("panel-locked", locked);
  pinGate.classList.toggle("unlocked", !locked);
  if (locked) setTimeout(() => pinInputs[0].focus(), 900);
}
setPanelLocked(sessionStorage.getItem("enp_admin_unlocked") !== "true");
pinInputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0, 1);
    input.classList.remove("error");
    if (input.value && pinInputs[index + 1]) pinInputs[index + 1].focus();
  });
  input.addEventListener("keydown", event => {
    if (event.key === "Backspace" && !input.value && pinInputs[index - 1]) pinInputs[index - 1].focus();
  });
});
pinForm.onsubmit = event => {
  event.preventDefault();
  const pin = pinInputs.map(input => input.value).join("");
  if (pin !== ADMIN_PIN) {
    document.getElementById("pinError").textContent = "Incorrect PIN. Please try again.";
    pinInputs.forEach(input => { input.value = ""; input.classList.add("error"); });
    pinGate.querySelector(".pin-card").classList.add("shake");
    setTimeout(() => pinGate.querySelector(".pin-card").classList.remove("shake"), 450);
    pinInputs[0].focus();
    return;
  }
  sessionStorage.setItem("enp_admin_unlocked", "true");
  document.getElementById("pinError").textContent = "";
  setPanelLocked(false);
};

const titles = { dashboard: "Dashboard overview", teachers: "Teacher management", blogs: "Blog management", feedback: "Feedback inbox", chats: "Website chat" };
function switchView(id) {
  document.querySelectorAll(".panel-view").forEach(view => view.classList.toggle("active", view.id === id));
  document.querySelectorAll(".sidebar nav button").forEach(button => button.classList.toggle("active", button.dataset.view === id));
  document.getElementById("pageTitle").textContent = titles[id];
  document.getElementById("sidebar").classList.remove("open");
  renderAll();
}
document.querySelectorAll("[data-view]").forEach(button => button.onclick = () => switchView(button.dataset.view));
document.querySelectorAll("[data-jump]").forEach(button => button.onclick = () => switchView(button.dataset.jump));
document.getElementById("panelMenu").onclick = () => document.getElementById("sidebar").classList.toggle("open");
document.getElementById("logout").onclick = () => {
  sessionStorage.removeItem("enp_admin_unlocked");
  pinInputs.forEach(input => input.value = "");
  setPanelLocked(true);
};

function initials(name) { return name.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase(); }
function renderMetrics() {
  const feedback = Store.get("feedback");
  document.getElementById("teacherCount").textContent = Store.get("teachers").length;
  document.getElementById("feedbackCount").textContent = feedback.filter(item => item.status === "New").length;
  document.getElementById("feedbackBadge").textContent = feedback.filter(item => item.status === "New").length;
  document.getElementById("chatCount").textContent = Store.get("chats").length;
  document.getElementById("userCount").textContent = Store.get("users").length - 1;
  document.getElementById("recentFeedback").innerHTML = feedback.slice(0, 4).map(item => `<div class="feedback-row"><span>${initials(item.name)}</span><p><strong>${item.name}</strong><small>${item.subject}</small></p><small>${item.date}</small></div>`).join("") || `<div class="empty-state">No feedback received yet.</div>`;
}
function renderTeacherTable() {
  const rows = Store.get("teachers").map(teacher => {
    const avatar = teacher.photo ? `<img src="${teacher.photo}" alt="${teacher.name}">` : teacher.initials;
    return `<div class="table-row"><div class="table-person"><span>${avatar}</span><p><strong>${teacher.name}</strong><small>${teacher.bio.slice(0, 42)}...</small></p></div><span>${teacher.role}</span><span>${teacher.skills.join(", ")}</span><div class="table-actions"><button class="icon-btn" onclick="editTeacher(${teacher.id})">Edit</button><button class="icon-btn delete" onclick="deleteTeacher(${teacher.id})">X</button></div></div>`;
  }).join("");
  document.getElementById("teacherTable").innerHTML = `<div class="table-row table-head"><span>Teacher</span><span>Role</span><span>Skills</span><span>Actions</span></div>${rows}`;
}
function renderFeedback() {
  document.getElementById("feedbackList").innerHTML = Store.get("feedback").map(item => `<article class="feedback-item ${item.status.toLowerCase()}"><div class="feedback-top"><span>${initials(item.name)}</span><p><strong>${item.name}</strong><small>${item.email} · ${item.subject}</small></p><small>${item.date}</small><b class="status">${item.status}</b></div><p>${item.message}</p></article>`).join("") || `<div class="panel-card empty-state">No feedback received yet.</div>`;
}
function renderChats() {
  const chats = Store.get("chats");
  document.getElementById("chatAdmin").innerHTML = chats.map(chat => `<div class="message ${chat.from}">${chat.text}<small>${chat.time}</small></div>`).join("") || `<div class="empty-state">No chat messages yet.</div>`;
}
function renderBlogs() {
  const blogs = Store.get("blogs");
  document.getElementById("blogAdminGrid").innerHTML = blogs.map(blog => `<article class="blog-admin-card panel-card"><div class="blog-admin-image">${blog.image ? `<img src="${blog.image}" alt="${blog.title}">` : "ENP"}<span class="${blog.status.toLowerCase()}">${blog.status}</span></div><div><small>${blog.category} · ${blog.date}</small><h3>${blog.title}</h3><p>${blog.excerpt}</p><footer><span>By ${blog.author}</span><div><button class="icon-btn" onclick="editBlog(${blog.id})">Edit</button><button class="icon-btn delete" onclick="deleteBlog(${blog.id})">Delete</button></div></footer></div></article>`).join("") || `<div class="panel-card empty-state">No blog articles yet.</div>`;
}
function renderAll() { renderMetrics(); renderTeacherTable(); renderBlogs(); renderFeedback(); renderChats(); }

const modal = document.getElementById("teacherModal");
const teacherForm = document.getElementById("teacherForm");
const photoPreview = document.getElementById("photoPreview");
function updatePhotoPreview(photo, fallback = "Photo") { photoPreview.innerHTML = photo ? `<img src="${photo}" alt="Profile preview">` : fallback; }
document.getElementById("photoInput").onchange = event => {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { showToast("Please choose an image smaller than 2MB."); event.target.value = ""; return; }
  const reader = new FileReader();
  reader.onload = () => { teacherForm.photo.value = reader.result; updatePhotoPreview(reader.result); };
  reader.readAsDataURL(file);
};
document.getElementById("addTeacher").onclick = () => { teacherForm.reset(); teacherForm.id.value = ""; teacherForm.photo.value = ""; updatePhotoPreview(""); document.getElementById("modalTitle").textContent = "Add teacher"; modal.classList.add("open"); };
document.getElementById("closeModal").onclick = () => modal.classList.remove("open");
window.editTeacher = id => {
  const teacher = Store.get("teachers").find(item => item.id === id);
  Object.keys(teacher).forEach(key => { if (teacherForm.elements[key]) teacherForm.elements[key].value = Array.isArray(teacher[key]) ? teacher[key].join(", ") : teacher[key]; });
  updatePhotoPreview(teacher.photo, teacher.initials);
  document.getElementById("modalTitle").textContent = "Edit teacher";
  modal.classList.add("open");
};
window.deleteTeacher = id => {
  if (!confirm("Remove this teacher from the website?")) return;
  Store.set("teachers", Store.get("teachers").filter(item => item.id !== id));
  renderAll(); showToast("Teacher removed.");
};
teacherForm.onsubmit = event => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(teacherForm));
  const teachers = Store.get("teachers");
  const teacher = { ...values, id: values.id ? Number(values.id) : Date.now(), skills: values.skills.split(",").map(skill => skill.trim()).filter(Boolean) };
  const index = teachers.findIndex(item => item.id === teacher.id);
  if (index >= 0) teachers[index] = teacher; else teachers.push(teacher);
  Store.set("teachers", teachers); modal.classList.remove("open"); renderAll(); showToast("Teacher details saved.");
};
document.getElementById("markRead").onclick = () => { Store.set("feedback", Store.get("feedback").map(item => ({ ...item, status: "Read" }))); renderAll(); showToast("All feedback marked as read."); };
document.getElementById("clearChats").onclick = () => {
  if (!confirm("Clear the complete website chat history?")) return;
  Store.set("chats", []); renderAll(); showToast("Chat history cleared.");
};

const blogEditorModal = document.getElementById("blogEditorModal");
const blogForm = document.getElementById("blogForm");
const blogImagePreview = document.getElementById("blogImagePreview");
function updateBlogImagePreview(image) { blogImagePreview.innerHTML = image ? `<img src="${image}" alt="Blog cover preview">` : "Cover"; }
document.getElementById("blogImageInput").onchange = event => {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { showToast("Please choose an image smaller than 2MB."); event.target.value = ""; return; }
  const reader = new FileReader();
  reader.onload = () => { blogForm.image.value = reader.result; updateBlogImagePreview(reader.result); };
  reader.readAsDataURL(file);
};
document.getElementById("addBlog").onclick = () => { blogForm.reset(); blogForm.id.value = ""; blogForm.image.value = ""; updateBlogImagePreview(""); document.getElementById("blogEditorTitle").textContent = "New blog article"; blogEditorModal.classList.add("open"); };
document.getElementById("closeBlogEditor").onclick = () => blogEditorModal.classList.remove("open");
window.editBlog = id => {
  const blog = Store.get("blogs").find(item => item.id === id);
  Object.keys(blog).forEach(key => { if (blogForm.elements[key]) blogForm.elements[key].value = blog[key]; });
  updateBlogImagePreview(blog.image);
  document.getElementById("blogEditorTitle").textContent = "Edit blog article";
  blogEditorModal.classList.add("open");
};
window.deleteBlog = id => {
  if (!confirm("Delete this blog article?")) return;
  Store.set("blogs", Store.get("blogs").filter(item => item.id !== id)); renderAll(); showToast("Blog article deleted.");
};
blogForm.onsubmit = event => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(blogForm));
  const blogs = Store.get("blogs");
  const blog = { ...values, id: values.id ? Number(values.id) : Date.now(), date: values.id ? blogs.find(item => item.id === Number(values.id)).date : new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) };
  const index = blogs.findIndex(item => item.id === blog.id);
  if (index >= 0) blogs[index] = blog; else blogs.unshift(blog);
  Store.set("blogs", blogs); blogEditorModal.classList.remove("open"); renderAll(); showToast("Blog article saved.");
};
renderAll();
addEventListener("enp:data-changed", () => renderAll());
