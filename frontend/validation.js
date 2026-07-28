/* =========================================================
   CLIENT-SIDE FORM VALIDATION
   Validates each form, then calls the real data.js functions
   to persist the result (register/login/add course/etc) so
   what you see afterward reflects what you actually did.
   Requires data.js to be loaded first.
========================================================= */

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
function showError(fieldId, message) {
  const errorEl = document.getElementById(fieldId + 'Error');
  const inputEl = document.getElementById(fieldId);
  if (errorEl) { errorEl.textContent = message; errorEl.style.display = message ? 'block' : 'none'; }
  if (inputEl) { inputEl.style.borderColor = message ? 'var(--danger)' : 'var(--border)'; }
}
function clearErrors(fieldIds) { fieldIds.forEach(id => showError(id, '')); }

/* ---------------- REGISTER ---------------- */
function validateRegisterForm(e) {
  e.preventDefault();
  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirmPassword');
  clearErrors(['name', 'email', 'password', 'confirmPassword']);

  let valid = true;
  if (name.value.trim().length < 2) { showError('name', 'Please enter your full name.'); valid = false; }
  if (!isValidEmail(email.value)) { showError('email', 'Please enter a valid email address.'); valid = false; }
  if (password.value.length < 6) { showError('password', 'Password must be at least 6 characters.'); valid = false; }
  if (confirmPassword.value !== password.value) { showError('confirmPassword', 'Passwords do not match.'); valid = false; }
  if (!valid) return false;

  const role = document.getElementById('role').value;
  const result = registerUser(name.value.trim(), email.value.trim(), password.value, role);
  if (!result.ok) { showError('email', result.message); return false; }

  window.location.href = role === 'admin' ? 'admin-dashboard.html' : 'student-dashboard.html';
  return false;
}

/* ---------------- LOGIN ---------------- */
function validateLoginForm(e) {
  e.preventDefault();
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  clearErrors(['email', 'password']);

  let valid = true;
  if (!isValidEmail(email.value)) { showError('email', 'Please enter a valid email address.'); valid = false; }
  if (password.value.length < 1) { showError('password', 'Password is required.'); valid = false; }
  if (!valid) return false;

  const result = loginUser(email.value.trim(), password.value);
  if (!result.ok) {
    showError('password', result.message + ' Try admin@lms.com / admin123 or student@lms.com / student123, or register a new account.');
    return false;
  }
  window.location.href = result.user.role === 'admin' ? 'admin-dashboard.html' : 'student-dashboard.html';
  return false;
}

/* ---------------- FORGOT PASSWORD ---------------- */
function validateForgotForm(e) {
  const email = document.getElementById('email');
  clearErrors(['email']);
  if (!isValidEmail(email.value)) {
    showError('email', 'Please enter a valid email address.');
    e.preventDefault();
    return false;
  }
  return true; // allow normal GET submission to reset-password.html?email=...
}

/* ---------------- RESET PASSWORD ---------------- */
function validateResetForm(e) {
  e.preventDefault();
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirmPassword');
  clearErrors(['email', 'password', 'confirmPassword']);

  let valid = true;
  if (!isValidEmail(email.value)) { showError('email', 'Please enter a valid email address.'); valid = false; }
  if (password.value.length < 6) { showError('password', 'Password must be at least 6 characters.'); valid = false; }
  if (confirmPassword.value !== password.value) { showError('confirmPassword', 'Passwords do not match.'); valid = false; }
  if (!valid) return false;

  const result = resetPasswordFor(email.value.trim(), password.value);
  if (!result.ok) { showError('email', result.message); return false; }

  window.location.href = 'login.html';
  return false;
}

/* ---------------- ADD / EDIT COURSE ---------------- */
function validateCourseForm(e) {
  e.preventDefault();
  const title = document.getElementById('title');
  const category = document.getElementById('category');
  const instructor = document.getElementById('instructor');
  const price = document.getElementById('price');
  const description = document.getElementById('description');
  const module1 = document.getElementById('module1');
  clearErrors(['title', 'category', 'instructor', 'price', 'description', 'module1']);

  let valid = true;
  if (title.value.trim().length < 3) { showError('title', 'Title must be at least 3 characters.'); valid = false; }
  if (category.value.trim().length < 2) { showError('category', 'Please enter a category.'); valid = false; }
  if (instructor.value.trim().length < 2) { showError('instructor', 'Please enter an instructor name.'); valid = false; }
  if (price.value === '' || Number(price.value) < 0) { showError('price', 'Please enter a valid price (0 or more).'); valid = false; }
  if (description.value.trim().length < 10) { showError('description', 'Description should be at least 10 characters.'); valid = false; }
  if (module1.value.trim().length < 2) { showError('module1', 'At least one module title is required.'); valid = false; }
  if (!valid) return false;

  const moduleInputs = Array.from(document.querySelectorAll('[id^="module"], [name^="module"]'))
    .filter((el, i, arr) => arr.indexOf(el) === i); // dedupe if an input has both id and matching name selector
  const titles = Array.from(document.querySelectorAll('input[name^="module"]'))
    .map(i => i.value.trim()).filter(Boolean);

  const courseId = document.getElementById('courseForm').dataset.courseId;
  const existingCourse = courseId ? getCourseById(courseId) : null;

  const modules = titles.map((t, i) => {
    const existing = existingCourse && existingCourse.modules[i];
    return existing ? { ...existing, title: t } : { id: 'm' + (i + 1), title: t, videoTitle: t + ' - Video Lecture', materials: [t.replace(/\s+/g, '-') + '-notes.pdf'] };
  });

  const courseData = {
    title: title.value.trim(),
    category: category.value.trim(),
    instructor: instructor.value.trim(),
    price: Number(price.value),
    description: description.value.trim(),
    modules
  };

  if (courseId) {
    updateCourse(courseId, courseData);
  } else {
    addCourse(courseData);
  }
  window.location.href = 'courses.html';
  return false;
}
