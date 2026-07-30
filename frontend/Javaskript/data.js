/* =========================================================
   DATA LAYER
   Single source of truth for the whole portal. Everything is
   stored in localStorage, keyed by the logged-in user's email,
   so each page reads/writes the SAME data instead of showing
   hardcoded demo numbers.
========================================================= */

const KEYS = {
  users: 'lms_registered_users',
  currentUser: 'lms_user',
  courses: 'lms_courses',
  enrollments: 'lms_enrollments',
  progress: 'lms_progress',
  notifications: 'lms_notifications'
};

function getData(key) { return JSON.parse(localStorage.getItem(key) || '[]'); }
function setData(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

/* ---------------- SEED (runs once per browser) ---------------- */
const DEMO_USERS = [
  { name: 'Admin User', email: 'admin@lms.com', password: 'admin123', role: 'admin' },
  { name: 'John Student', email: 'student@lms.com', password: 'student123', role: 'student' }
];

function seedData() {
  if (localStorage.getItem('lms_seeded_v2')) return;

  setData(KEYS.courses, [
    { id: 'c1', title: 'Web Development Bootcamp', category: 'Development', instructor: 'Jane Smith', price: 49,
      description: 'Learn HTML, CSS, JavaScript and build real projects from scratch.',
      modules: [
        { id: 'm1', title: 'Introduction to HTML', videoTitle: 'HTML Basics', materials: ['HTML-Cheatsheet.pdf'] },
        { id: 'm2', title: 'CSS Fundamentals', videoTitle: 'Styling with CSS', materials: ['CSS-Guide.pdf'] },
        { id: 'm3', title: 'JavaScript Essentials', videoTitle: 'JS for Beginners', materials: ['JS-Notes.pdf'] }
      ] },
    { id: 'c2', title: 'Python for Data Science', category: 'Data Science', instructor: 'Mark Lee', price: 59,
      description: 'Master Python, Pandas and NumPy for data analysis.',
      modules: [
        { id: 'm1', title: 'Python Basics', videoTitle: 'Getting Started with Python', materials: ['Python-Intro.pdf'] },
        { id: 'm2', title: 'Working with Pandas', videoTitle: 'Data Analysis with Pandas', materials: ['Pandas-Guide.pdf'] }
      ] },
    { id: 'c3', title: 'UI/UX Design Fundamentals', category: 'Design', instructor: 'Amy Wong', price: 39,
      description: 'Learn design principles, wireframing and prototyping.',
      modules: [
        { id: 'm1', title: 'Design Principles', videoTitle: 'Intro to UI/UX', materials: ['Design-Basics.pdf'] },
        { id: 'm2', title: 'Prototyping Tools', videoTitle: 'Using Figma', materials: ['Figma-Handbook.pdf'] }
      ] }
  ]);

  // Demo enrollment/progress ONLY for the seeded demo student, so the
  // demo login has something to look at. Real new registrations start empty.
  setData(KEYS.enrollments, [
    { id: uid(), email: 'student@lms.com', courseId: 'c1', date: new Date().toISOString() },
    { id: uid(), email: 'student@lms.com', courseId: 'c2', date: new Date().toISOString() }
  ]);
  setData(KEYS.progress, [
    { id: uid(), email: 'student@lms.com', courseId: 'c1', completedModules: ['m1', 'm2'] },
    { id: uid(), email: 'student@lms.com', courseId: 'c2', completedModules: ['m1', 'm2'] }
  ]);
  setData(KEYS.notifications, [
    { id: uid(), email: 'student@lms.com', title: 'Welcome to the LMS Portal!', message: 'Start exploring courses and begin learning today.', read: false, date: new Date().toISOString() },
    { id: uid(), email: 'student@lms.com', title: 'Course Completed!', message: 'Congratulations! You completed "Python for Data Science". Your certificate is ready.', read: false, date: new Date().toISOString() }
  ]);
  setData(KEYS.users, []); // real registered users go here

  localStorage.setItem('lms_seeded_v2', 'true');
}
seedData();

/* ---------------- AUTH ---------------- */
function findAccount(email) {
  return DEMO_USERS.find(u => u.email === email) || getData(KEYS.users).find(u => u.email === email);
}
function getCurrentUser() {
  return JSON.parse(localStorage.getItem(KEYS.currentUser) || 'null');
}
function setCurrentUser(user) {
  localStorage.setItem(KEYS.currentUser, JSON.stringify(user));
}
function logout() {
  localStorage.removeItem(KEYS.currentUser);
  window.location.href = 'login.html';
}
function registerUser(name, email, password, role) {
  if (findAccount(email)) {
    return { ok: false, message: 'An account with this email already exists.' };
  }
  const users = getData(KEYS.users);
  const newUser = { name, email, password, role: role || 'student' };
  users.push(newUser);
  setData(KEYS.users, users);
  addNotification(email, 'Welcome to the LMS Portal!', 'Start exploring courses and begin learning today.');
  setCurrentUser({ name, email, role: newUser.role });
  return { ok: true, user: newUser };
}
function loginUser(email, password) {
  const account = findAccount(email);
  if (!account || account.password !== password) {
    return { ok: false, message: 'Incorrect email or password.' };
  }
  setCurrentUser({ name: account.name, email: account.email, role: account.role });
  return { ok: true, user: account };
}
function resetPasswordFor(email, newPassword) {
  if (DEMO_USERS.some(u => u.email === email)) {
    return { ok: false, message: 'Demo accounts cannot be reset. Try registering a new account instead.' };
  }
  const users = getData(KEYS.users);
  const idx = users.findIndex(u => u.email === email);
  if (idx === -1) return { ok: false, message: 'No account found with that email.' };
  users[idx].password = newPassword;
  setData(KEYS.users, users);
  return { ok: true };
}

/* ---------------- COURSES ---------------- */
function getCourses() { return getData(KEYS.courses); }
function getCourseById(id) { return getCourses().find(c => c.id === id); }
function addCourse(course) {
  const courses = getCourses();
  course.id = uid();
  course.modules = course.modules || [];
  courses.push(course);
  setData(KEYS.courses, courses);
  return course;
}
function updateCourse(id, updates) {
  const courses = getCourses();
  const idx = courses.findIndex(c => c.id === id);
  if (idx > -1) { courses[idx] = { ...courses[idx], ...updates }; setData(KEYS.courses, courses); }
}
function deleteCourse(id) {
  setData(KEYS.courses, getCourses().filter(c => c.id !== id));
}

/* ---------------- ENROLLMENT ---------------- */
function isEnrolled(email, courseId) {
  return getData(KEYS.enrollments).some(e => e.email === email && e.courseId === courseId);
}
function enrollInCourse(email, courseId) {
  if (isEnrolled(email, courseId)) return { ok: false, message: 'You are already enrolled in this course.' };
  const enrollments = getData(KEYS.enrollments);
  enrollments.push({ id: uid(), email, courseId, date: new Date().toISOString() });
  setData(KEYS.enrollments, enrollments);
  addNotification(email, 'Enrollment Successful', 'You have successfully enrolled in a new course.');
  return { ok: true };
}
function getMyCourses(email) {
  return getData(KEYS.enrollments)
    .filter(e => e.email === email)
    .map(e => getCourseById(e.courseId))
    .filter(Boolean);
}

/* ---------------- PROGRESS ---------------- */
function getProgressRecord(email, courseId) {
  return getData(KEYS.progress).find(p => p.email === email && p.courseId === courseId);
}
function getProgressPercent(email, courseId) {
  const course = getCourseById(courseId);
  if (!course || !course.modules.length) return 0;
  const rec = getProgressRecord(email, courseId);
  const done = rec ? rec.completedModules.length : 0;
  return Math.round((done / course.modules.length) * 100);
}
function markModuleComplete(email, courseId, moduleId) {
  const all = getData(KEYS.progress);
  let rec = all.find(p => p.email === email && p.courseId === courseId);
  if (!rec) { rec = { id: uid(), email, courseId, completedModules: [] }; all.push(rec); }
  if (!rec.completedModules.includes(moduleId)) rec.completedModules.push(moduleId);
  setData(KEYS.progress, all);

  const course = getCourseById(courseId);
  if (course && rec.completedModules.length === course.modules.length) {
    addNotification(email, 'Course Completed!', `Congratulations! You completed "${course.title}". Your certificate is ready.`);
  }
}

/* ---------------- NOTIFICATIONS ---------------- */
function addNotification(email, title, message) {
  const notifs = getData(KEYS.notifications);
  notifs.unshift({ id: uid(), email, title, message, read: false, date: new Date().toISOString() });
  setData(KEYS.notifications, notifs);
}
function getNotifications(email) {
  return getData(KEYS.notifications).filter(n => n.email === email);
}
function getUnreadCount(email) {
  return getNotifications(email).filter(n => !n.read).length;
}
function markAllNotificationsRead(email) {
  setData(KEYS.notifications, getData(KEYS.notifications).map(n => n.email === email ? { ...n, read: true } : n));
}
