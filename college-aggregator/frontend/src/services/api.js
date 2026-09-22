const STORAGE_KEY = "coa_frontend_data";

const seedData = {
  deadlines: [
    { _id: "demo-internship", title: "Summer Software Engineering Internship", organization: "TechNova", category: "Internships", description: "A hands-on internship for students building products with modern technology.", deadlineDate: "2026-10-15", deadlineTime: "23:59", eligibilityBranches: ["ALL"], eligibilityYears: ["2", "3", "4"], minimumCGPA: 7, applicationLink: "https://example.com/apply", status: "active" },
    { _id: "demo-hackathon", title: "National Student Hackathon", organization: "Open Campus", category: "Hackathons", description: "Build an idea with your team and present it to industry mentors.", deadlineDate: "2026-09-30", deadlineTime: "18:00", eligibilityBranches: ["ALL"], eligibilityYears: ["ALL"], minimumCGPA: 0, applicationLink: "https://example.com/hackathon", status: "active" },
  ],
  users: [],
  categories: [
    { _id: "cat-internships", name: "Internships", color: "#2563eb" },
    { _id: "cat-scholarships", name: "Scholarships", color: "#16a34a" },
    { _id: "cat-hackathons", name: "Hackathons", color: "#9333ea" },
  ],
  notifications: [],
  submissions: [],
};

const readData = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : structuredClone(seedData);
};
const writeData = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
const response = (data) => Promise.resolve({ data });
const id = (prefix) => `${prefix}-${Date.now()}`;
const currentUser = () => {
  const stored = localStorage.getItem("coa_user");
  return stored ? JSON.parse(stored) : null;
};

const get = async (path, config = {}) => {
  const data = readData();
  const query = config.params || {};
  if (path === "/deadlines" || path === "/deadlines/feed") {
    let deadlines = data.deadlines.filter((item) => item.status === "active");
    if (query.search) deadlines = deadlines.filter((item) => item.title.toLowerCase().includes(query.search.toLowerCase()));
    if (query.category) deadlines = deadlines.filter((item) => item.category === query.category);
    if (query.year) deadlines = deadlines.filter((item) => item.eligibilityYears.includes("ALL") || item.eligibilityYears.includes(String(query.year)));
    if (query.branch) deadlines = deadlines.filter((item) => item.eligibilityBranches.includes("ALL") || item.eligibilityBranches.includes(query.branch.toUpperCase()));
    return response({ deadlines });
  }
  if (path.startsWith("/deadlines/")) return response({ deadline: data.deadlines.find((item) => item._id === path.split("/")[2]) });
  if (path === "/users/me/submissions") return response({ submissions: data.submissions.filter((item) => item.submittedBy?._id === currentUser()?._id) });
  if (path === "/notifications") return response({ notifications: data.notifications });
  if (path === "/admin/pending") return response({ deadlines: data.deadlines.filter((item) => item.status === "pending") });
  if (path === "/admin/categories") return response({ categories: data.categories });
  if (path === "/superadmin/users") return response({ users: data.users.filter((item) => item.role === "student") });
  if (path === "/superadmin/admins") return response({ admins: data.users.filter((item) => ["admin", "superadmin"].includes(item.role)) });
  if (path === "/admin/stats") return response({ pendingCount: data.deadlines.filter((item) => item.status === "pending").length, activeCount: data.deadlines.filter((item) => item.status === "active").length, submittedThisWeek: data.submissions.length });
  return response({});
};

const post = async (path, payload) => {
  const data = readData();
  if (path === "/auth/login") {
    const user = data.users.find((item) => item.email === payload.email) || { _id: id("user"), name: payload.email.split("@")[0] || "Demo Student", email: payload.email, role: "student", branch: "CSE", year: 3, cgpa: 8.5, interests: ["Internships", "Hackathons"] };
    return response({ token: "frontend-demo-token", user });
  }
  if (path.startsWith("/auth/register/")) {
    const user = { ...payload, _id: id("user"), role: path.split("/").pop(), interests: payload.interests || [] };
    delete user.password;
    delete user.confirmPassword;
    data.users.push(user);
    writeData(data);
    return response({ token: "frontend-demo-token", user });
  }
  if (path === "/deadlines/submit" || path === "/admin/deadlines") {
    const deadline = { ...payload, _id: id("deadline"), status: "pending", createdAt: new Date().toISOString(), submittedBy: currentUser() };
    data.deadlines.push(deadline);
    data.submissions.push(deadline);
    writeData(data);
  }
  if (path === "/superadmin/categories") {
    data.categories.push({ ...payload, _id: id("category") });
    writeData(data);
  }
  if (path === "/notifications/remind") {
    data.notifications.unshift({ _id: id("notification"), message: "Reminder set for this opportunity.", createdAt: new Date().toISOString(), isRead: false });
    writeData(data);
  }
  return response({});
};

const put = async (path, payload) => {
  const data = readData();
  if (path.includes("/approve") || path.includes("/reject")) {
    const deadline = data.deadlines.find((item) => item._id === path.split("/")[3]);
    if (deadline) deadline.status = path.includes("approve") ? "active" : "rejected";
    writeData(data);
  } else if (path === "/users/me") {
    const updated = { ...currentUser(), ...payload };
    localStorage.setItem("coa_user", JSON.stringify(updated));
    return response({ user: updated });
  } else if (path.includes("/notifications/")) {
    const notification = data.notifications.find((item) => item._id === path.split("/")[2]);
    if (notification) notification.isRead = true;
    writeData(data);
  } else if (path === "/notifications/read-all") {
    data.notifications.forEach((item) => { item.isRead = true; });
    writeData(data);
  }
  return response({});
};

const del = async (path) => {
  const data = readData();
  const targetId = path.split("/").pop();
  if (path.includes("categories")) data.categories = data.categories.filter((item) => item._id !== targetId);
  if (path.includes("users")) data.users = data.users.filter((item) => item._id !== targetId);
  writeData(data);
  return response({});
};

export default { get, post, put, delete: del };
