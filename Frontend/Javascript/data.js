/* =========================================================
   DATA MODULE  (Module Pattern - IIFE)
   Wraps all data logic in one self-contained module: private
   internals stay hidden, only a deliberate public API is
   returned as DataModule. For backward compatibility, every
   public function is ALSO copied onto window, so nothing else
   in the app (inline onclick/onsubmit, per-page scripts) needs
   to change - they keep calling these as plain globals.

   CHANGE (correction): each module now carries real "notes"
   text (readymade written content) instead of relying on a
   fake video player that never actually plays anything.
========================================================= */

const DataModule = (function () {
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

  const DEMO_USERS = [
    { name: 'Admin User', email: 'admin@lms.com', password: 'admin123', role: 'admin' },
    { name: 'John Student', email: 'student@lms.com', password: 'student123', role: 'student' }
  ];

  function seedData() {
    // Bump the seed version so returning users automatically pick up
    // the new "notes" content without needing to clear localStorage.
    if (localStorage.getItem('lms_seeded_v3')) return;

    setData(KEYS.courses, [
      { id: 'c1', title: 'Web Development Bootcamp', category: 'Development', instructor: 'Jane Smith', price: 49,
        description: 'Learn HTML, CSS, JavaScript and build real projects from scratch.',
        modules: [
          { id: 'm1', title: 'Introduction to HTML',
            notes: 'HTML (HyperText Markup Language) is the standard language used to structure content on the web. A page is built from elements such as <h1> to <h6> for headings, <p> for paragraphs, <a> for links, <img> for images, and <ul>/<ol> for lists. Every HTML document starts with <!DOCTYPE html> and is organized into a <head> (page title, metadata, linked stylesheets) and a <body> (the visible content). Elements are usually written as opening and closing tag pairs, like <p>text</p>, and can be nested inside one another to build the page structure.',
            materials: ['HTML-Cheatsheet.pdf'] },
          { id: 'm2', title: 'CSS Fundamentals',
            notes: 'CSS (Cascading Style Sheets) controls how HTML elements look on the page - colors, fonts, spacing, and layout. Every element is treated as a box made up of content, padding, border, and margin (the "box model"). Selectors target elements to style: an element selector like p applies to all paragraphs, a class selector like .card applies to any element with class="card", and an id selector like #header applies to one specific element. Layout tools such as Flexbox (display: flex) and Grid (display: grid) make it easy to arrange elements in rows, columns, or grids.',
            materials: ['CSS-Guide.pdf'] },
          { id: 'm3', title: 'JavaScript Essentials',
            notes: 'JavaScript adds interactivity to a web page - it can respond to clicks, update content, and store data. Variables are declared with let or const, and values can be strings, numbers, booleans, arrays, or objects. Functions group reusable logic: function greet(name) { return "Hi " + name; }. The DOM (Document Object Model) lets JavaScript find and change page elements, e.g. document.getElementById("title").textContent = "Hello". Event listeners like button.addEventListener("click", handler) let the page react to what the user does.',
            materials: ['JS-Notes.pdf'] }
        ] },
      { id: 'c2', title: 'Python for Data Science', category: 'Data Science', instructor: 'Mark Lee', price: 59,
        description: 'Master Python, Pandas and NumPy for data analysis.',
        modules: [
          { id: 'm1', title: 'Python Basics',
            notes: 'Python is a beginner-friendly programming language widely used for data analysis. Variables don\'t need a declared type: age = 25, name = "Sam". Common data types are integers, floats, strings, lists ([1,2,3]), and dictionaries ({"key": "value"}). Loops repeat actions: for item in list: ... or while condition: .... Functions are defined with def: def add(a, b): return a + b. Indentation (spaces, not braces) is how Python knows what code belongs inside a loop, function, or if statement.',
            materials: ['Python-Intro.pdf'] },
          { id: 'm2', title: 'Working with Pandas',
            notes: 'Pandas is a Python library for working with tabular data. A DataFrame is its main structure - think of it like a spreadsheet with rows and columns. You load data with pd.read_csv("file.csv"), inspect it with df.head() or df.info(), and select columns with df["column_name"]. Common operations include filtering rows (df[df["age"] > 18]), grouping data (df.groupby("category").mean()), and handling missing values (df.dropna() or df.fillna(0)). Pandas is usually paired with NumPy for numerical operations underneath.',
            materials: ['Pandas-Guide.pdf'] }
        ] },
      { id: 'c3', title: 'UI/UX Design Fundamentals', category: 'Design', instructor: 'Amy Wong', price: 39,
        description: 'Learn design principles, wireframing and prototyping.',
        modules: [
          { id: 'm1', title: 'Design Principles',
            notes: 'Good UI/UX design rests on a few core principles. Visual hierarchy uses size, color, and position to show users what matters most first. Contrast (light vs dark, big vs small) makes important elements stand out and improves readability. Consistency - reusing the same colors, spacing, and components throughout - helps users learn an interface faster. Whitespace (empty space around elements) isn\'t wasted space; it reduces clutter and helps users focus. Alignment keeps related elements visually connected in clean rows and columns.',
            materials: ['Design-Basics.pdf'] },
          { id: 'm2', title: 'Prototyping Tools',
            notes: 'Prototyping tools like Figma let designers turn ideas into clickable mockups before any code is written. A Figma file is organized into Frames (individual screens), which contain layers of shapes, text, and images. Components let you create a reusable element (like a button) once and reuse it everywhere - updating the original updates every copy. Prototyping mode lets you link frames together (e.g. "tap this button, go to that screen") so stakeholders can click through the design like a real app before development starts.',
            materials: ['Figma-Handbook.pdf'] }
        ] }
    ]);

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
    setData(KEYS.users, []);

    localStorage.setItem('lms_seeded_v3', 'true');
  }
  seedData();

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

  // ---- PUBLIC API ----
  return {
    KEYS, getData, setData, uid,
    getCurrentUser, setCurrentUser, logout, registerUser, loginUser, resetPasswordFor,
    getCourses, getCourseById, addCourse, updateCourse, deleteCourse,
    isEnrolled, enrollInCourse, getMyCourses,
    getProgressRecord, getProgressPercent, markModuleComplete,
    addNotification, getNotifications, getUnreadCount, markAllNotificationsRead
  };
})();

// Backward-compatible globals: the rest of the app keeps calling
// these exact same function names, unchanged.
Object.assign(window, DataModule);
