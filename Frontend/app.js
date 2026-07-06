/* =========================================================
   LMS PORTAL - CORE APP LOGIC
   Uses localStorage as a mock database so the whole site
   works with zero backend. Replace these functions with real
   fetch() calls to your API later if you build one.
========================================================= */

const DB = {
  users: 'lms_users',
  currentUser: 'lms_currentUser',
  courses: 'lms_courses',
  enrollments: 'lms_enrollments',
  progress: 'lms_progress',
  notifications: 'lms_notifications'
};

function getData(key){ return JSON.parse(localStorage.getItem(key) || '[]'); }
function setData(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

/* ---------------- SEED DATA (runs once) ---------------- */
function seedData(){
  if(!localStorage.getItem('lms_seeded')){
    setData(DB.users, [
      { id:'admin1', name:'Admin User', email:'admin@lms.com', password:'admin123', role:'admin' },
      { id:'stu1', name:'John Student', email:'student@lms.com', password:'student123', role:'student' }
    ]);
    setData(DB.courses, [
      { id:'c1', title:'Web Development Bootcamp', category:'Development', instructor:'Jane Smith', price:49, description:'Learn HTML, CSS, JavaScript and build real projects from scratch.', modules:[
        {id:'m1', title:'Introduction to HTML', videoTitle:'HTML Basics', materials:['HTML-Cheatsheet.pdf']},
        {id:'m2', title:'CSS Fundamentals', videoTitle:'Styling with CSS', materials:['CSS-Guide.pdf']},
        {id:'m3', title:'JavaScript Essentials', videoTitle:'JS for Beginners', materials:['JS-Notes.pdf']}
      ]},
      { id:'c2', title:'Python for Data Science', category:'Data Science', instructor:'Mark Lee', price:59, description:'Master Python, Pandas and NumPy for data analysis.', modules:[
        {id:'m1', title:'Python Basics', videoTitle:'Getting Started with Python', materials:['Python-Intro.pdf']},
        {id:'m2', title:'Working with Pandas', videoTitle:'Data Analysis with Pandas', materials:['Pandas-Guide.pdf']}
      ]},
      { id:'c3', title:'UI/UX Design Fundamentals', category:'Design', instructor:'Amy Wong', price:39, description:'Learn design principles, wireframing and prototyping.', modules:[
        {id:'m1', title:'Design Principles', videoTitle:'Intro to UI/UX', materials:['Design-Basics.pdf']},
        {id:'m2', title:'Prototyping Tools', videoTitle:'Using Figma', materials:['Figma-Handbook.pdf']}
      ]}
    ]);
    setData(DB.enrollments, []);
    setData(DB.progress, []);
    setData(DB.notifications, [
      { id:uid(), userId:'stu1', title:'Welcome to the LMS Portal!', message:'Start exploring courses and begin learning today.', read:false, date:new Date().toISOString() }
    ]);
    localStorage.setItem('lms_seeded', 'true');
  }
}
seedData();

/* ---------------- AUTH ---------------- */
function getCurrentUser(){
  return JSON.parse(localStorage.getItem(DB.currentUser) || 'null');
}
function registerUser(name, email, password, role){
  const users = getData(DB.users);
  if(users.some(u => u.email === email)){
    return { ok:false, message:'An account with this email already exists.' };
  }
  const newUser = { id: uid(), name, email, password, role: role || 'student' };
  users.push(newUser);
  setData(DB.users, users);
  return { ok:true, user:newUser };
}
function loginUser(email, password){
  const users = getData(DB.users);
  const user = users.find(u => u.email === email && u.password === password);
  if(!user) return { ok:false, message:'Invalid email or password.' };
  localStorage.setItem(DB.currentUser, JSON.stringify(user));
  return { ok:true, user };
}
function logoutUser(){
  localStorage.removeItem(DB.currentUser);
  window.location.href = 'login.html';
}
function requireAuth(){
  const user = getCurrentUser();
  if(!user){ window.location.href = 'login.html'; }
  return user;
}
function requireAdmin(){
  const user = requireAuth();
  if(user && user.role !== 'admin'){ window.location.href = 'student-dashboard.html'; }
  return user;
}
function resetPasswordFor(email, newPassword){
  const users = getData(DB.users);
  const idx = users.findIndex(u => u.email === email);
  if(idx === -1) return { ok:false, message:'No account found with that email.' };
  users[idx].password = newPassword;
  setData(DB.users, users);
  return { ok:true };
}

/* ---------------- COURSES ---------------- */
function getCourses(){ return getData(DB.courses); }
function getCourseById(id){ return getCourses().find(c => c.id === id); }
function addCourse(course){
  const courses = getCourses();
  course.id = uid();
  course.modules = course.modules || [];
  courses.push(course);
  setData(DB.courses, courses);
  return course;
}
function updateCourse(id, updates){
  const courses = getCourses();
  const idx = courses.findIndex(c => c.id === id);
  if(idx > -1){ courses[idx] = { ...courses[idx], ...updates }; setData(DB.courses, courses); }
}
function deleteCourse(id){
  setData(DB.courses, getCourses().filter(c => c.id !== id));
}

/* ---------------- ENROLLMENT ---------------- */
function enrollInCourse(userId, courseId){
  const enrollments = getData(DB.enrollments);
  if(enrollments.some(e => e.userId === userId && e.courseId === courseId)){
    return { ok:false, message:'You are already enrolled in this course.' };
  }
  enrollments.push({ id:uid(), userId, courseId, date:new Date().toISOString() });
  setData(DB.enrollments, enrollments);
  addNotification(userId, 'Enrollment Successful', `You have successfully enrolled in a new course.`);
  return { ok:true };
}
function isEnrolled(userId, courseId){
  return getData(DB.enrollments).some(e => e.userId === userId && e.courseId === courseId);
}
function getMyCourses(userId){
  const enrollments = getData(DB.enrollments).filter(e => e.userId === userId);
  return enrollments.map(e => getCourseById(e.courseId)).filter(Boolean);
}

/* ---------------- PROGRESS ---------------- */
function getProgressRecord(userId, courseId){
  return getData(DB.progress).find(p => p.userId === userId && p.courseId === courseId);
}
function markModuleComplete(userId, courseId, moduleId){
  const all = getData(DB.progress);
  let rec = all.find(p => p.userId === userId && p.courseId === courseId);
  if(!rec){
    rec = { id:uid(), userId, courseId, completedModules:[] };
    all.push(rec);
  }
  if(!rec.completedModules.includes(moduleId)) rec.completedModules.push(moduleId);
  setData(DB.progress, all);

  const course = getCourseById(courseId);
  if(course && rec.completedModules.length === course.modules.length){
    addNotification(userId, 'Course Completed!', `Congratulations! You completed "${course.title}". Your certificate is ready.`);
  }
  return rec;
}
function getProgressPercent(userId, courseId){
  const course = getCourseById(courseId);
  if(!course || !course.modules.length) return 0;
  const rec = getProgressRecord(userId, courseId);
  const done = rec ? rec.completedModules.length : 0;
  return Math.round((done / course.modules.length) * 100);
}

/* ---------------- NOTIFICATIONS ---------------- */
function addNotification(userId, title, message){
  const notifs = getData(DB.notifications);
  notifs.unshift({ id:uid(), userId, title, message, read:false, date:new Date().toISOString() });
  setData(DB.notifications, notifs);
}
function getNotifications(userId){
  return getData(DB.notifications).filter(n => n.userId === userId);
}
function getUnreadCount(userId){
  return getNotifications(userId).filter(n => !n.read).length;
}
function markAllNotificationsRead(userId){
  const notifs = getData(DB.notifications).map(n => n.userId === userId ? {...n, read:true} : n);
  setData(DB.notifications, notifs);
}

/* ---------------- NAVBAR RENDER ---------------- */
function renderNavbar(activePage){
  const el = document.getElementById('navbar');
  if(!el) return;
  const user = getCurrentUser();

  if(!user){
    el.innerHTML = `
      <div class="brand"><a href="index.html">📚 LMS Portal</a></div>
      <div class="nav-links">
        <a href="index.html" class="${activePage==='home'?'active':''}">Home</a>
        <a href="browse-courses.html" class="${activePage==='browse'?'active':''}">Courses</a>
        <a href="login.html" class="btn btn-secondary btn-sm">Login</a>
        <a href="register.html" class="btn btn-primary btn-sm">Sign Up</a>
      </div>`;
    return;
  }

  const dashboardLink = user.role === 'admin' ? 'admin-dashboard.html' : 'student-dashboard.html';
  const unread = getUnreadCount(user.id);

  el.innerHTML = `
    <div class="brand"><a href="${dashboardLink}">📚 LMS Portal</a></div>
    <div class="nav-links">
      <a href="${dashboardLink}" class="${activePage==='dashboard'?'active':''}">Dashboard</a>
      <a href="browse-courses.html" class="${activePage==='browse'?'active':''}">Browse Courses</a>
      ${user.role === 'student' ? `<a href="my-courses.html" class="${activePage==='mycourses'?'active':''}">My Courses</a>` : ''}
      ${user.role === 'admin' ? `<a href="courses.html" class="${activePage==='manage'?'active':''}">Manage Courses</a>` : ''}
      <a href="notifications.html" class="${activePage==='notif'?'active':''}">Notifications${unread ? `<span class="badge-count">${unread}</span>` : ''}</a>
      <div class="user-chip">
        <span>👤 ${user.name}</span>
        <a href="#" onclick="logoutUser();return false;" style="color:var(--danger);font-weight:600;">Logout</a>
      </div>
    </div>`;
}
