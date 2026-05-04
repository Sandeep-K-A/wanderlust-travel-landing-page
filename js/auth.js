//helper Function
const $ = (id) => document.getElementById(id);

function showMsg(msgEl, text, type) {
  msgEl.textContent = text;
  msgEl.className = "msg show " + type;
}

function clearMsg(msgEl) {
  msgEl.className = "msg";
  msgEl.textContent = "";
}

function markField(input, valid) {
  input.classList.toggle("error", !valid);
  input.classList.toggle("success", valid);
}

function showToast(msg, ms = 3000) {
  let toast = document.getElementById("toastMsg");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toastMsg";
    toast.className = "toast-msg";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), ms);
}

const Validators = {
  fullName: (v) => {
    const name = v.trim();
    return /^[a-zA-Z\s'-]+$/.test(name) && name.length >= 3
      ? ""
      : "Name must be at least 3 characters and contain only letters.";
  },
  email: (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
      ? ""
      : "Enter a valid email (e.g. you@mail.com).",
  phone: (v) =>
    /^\d{10}$/.test(v.replace(/\s/g, ""))
      ? ""
      : "Enter a valid 10-digit phone number.",
  city: (v) =>
    /^[a-zA-Z\s'-]+$/.test(v.trim()) && v.trim()
      ? ""
      : "City must contain only letters.",
  password: (v) =>
    v.length >= 8 && /[a-zA-Z]/.test(v) && /\d/.test(v)
      ? ""
      : "Min 8 chars with letters and numbers.",
  confirmPw: (v, pw) => (v === pw ? "" : "Passwords do not match."),
  required: (v) => (v.trim() ? "" : "This field is required."),
};

function initEyeToggle() {
  document.querySelectorAll(".eye-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.parentElement.querySelector("input");
      input.type = input.type === "password" ? "text" : "password";
      btn.textContent = input.type === "password" ? "👁" : "🙈";
    });
  });
}

function calcStrength(password) {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  return strength;
}

const KEY = "wanderlust_users";
const getUsers = () => {
  const data = localStorage.getItem(KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};
const saveUsers = (users) => localStorage.setItem(KEY, JSON.stringify(users));
const findUser = (email) =>
  getUsers().find((user) => user.email.toLowerCase() === email.toLowerCase());

function initSignUp() {
  const form = $("signupForm");
  if (!form) return;

  function liveValidate(inputId, msgId, ruleKey, extra) {
    const input = $(inputId),
      msg = $(msgId);
    if (!input) return;
    input.addEventListener("input", () => {
      const err = Validators[ruleKey](
        input.value,
        extra ? $(extra).value : undefined,
      );
      markField(input, !err);
      err ? showMsg(msg, err, "err") : showMsg(msg, "✓", "ok");
    });
  }

  liveValidate("fullName", "msgFullName", "fullName");
  liveValidate("email", "msgEmail", "email");
  liveValidate("phone", "msgPhone", "phone");
  liveValidate("city", "msgCity", "city");
  liveValidate("password", "msgPassword", "password");
  liveValidate(
    "confirmPassword",
    "msgConfirmPassword",
    "confirmPw",
    "password",
  );

  const passwordInput = $("password");
  const strengthFill = $("strengthFill");
  const strengthLabel = $("strengthLabel");

  if (passwordInput && strengthFill) {
    passwordInput.addEventListener("input", () => {
      const strength = calcStrength(passwordInput.value);
      const percentage = passwordInput.value ? (strength / 5) * 100 : 0;
      const colors = ["#c0392b", "#e67e22", "#f1c40f", "#7a8c72", "#27ae60"];
      const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
      strengthFill.style.width = percentage + "%";
      strengthFill.style.background = passwordInput.value
        ? colors[Math.min(strength - 1, 4)]
        : "";
      if (strengthLabel)
        strengthLabel.textContent = passwordInput.value
          ? labels[Math.min(strength - 1, 4)]
          : "";
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fields = [
      { id: "fullName", msgId: "msgFullName", rule: "fullName" },
      { id: "email", msgId: "msgEmail", rule: "email" },
      { id: "phone", msgId: "msgPhone", rule: "phone" },
      { id: "city", msgId: "msgCity", rule: "city" },
      { id: "password", msgId: "msgPassword", rule: "password" },
      {
        id: "confirmPassword",
        msgId: "msgConfirmPassword",
        rule: "confirmPw",
        extra: "password",
      },
    ];

    let ok = true;
    fields.forEach((field) => {
      const input = $(field.id),
        msg = $(field.msgId);
      const err = Validators[field.rule](
        input.value,
        field.extra ? $(field.extra).value : undefined,
      );
      markField(input, !err);
      if (err) {
        showMsg(msg, err, "err");
        ok = false;
      } else {
        showMsg(msg, "✓", "ok");
      }
    });

    if (!ok) {
      showToast("Please fix the errors above.");
      return;
    }

    if (findUser($("email").value)) {
      showMsg($("msgEmail"), "Email already registered.", "err");
      markField($("email"), false);
      showToast("This email is already registered.");
      return;
    }

    const users = getUsers();
    users.push({
      fullName: $("fullName").value.trim(),
      email: $("email").value.trim(),
      phone: $("phone").value.trim(),
      city: $("city").value.trim(),
      password: $("password").value,
    });
    saveUsers(users);
    showToast("Account created! Redirecting to Sign In…", 2600);
    setTimeout(() => {
      window.location.href = "signin.html";
    }, 2600);
  });
}

function initSignIn() {
  const form = $("signinForm");
  if (!form) return;
  [
    ["siEmail", "msgSiEmail", "email"],
    ["siPassword", "msgSiPassword", "required"],
  ].forEach(([id, msgId, rule]) => {
    const input = $(id),
      msg = $(msgId);
    if (!input) return;
    input.addEventListener("input", () => {
      const err = Validators[rule](input.value);
      markField(input, !err);
      err ? showMsg(msg, err, "err") : showMsg(msg, "✓", "ok");
    });
  });

  form.addEventListener("submit",(e)=>{
    e.preventDefault()

    const emailInput = $("siEmail"), passwordInput = $("siPassword");
    const emailMsg = $("msgSiEmail"),passwordMsg = $("msgSiPassword")

    const errEmail = Validators.email(emailInput.value);
    const errPassword = Validators.required(passwordInput.value);

    markField(emailInput, !errEmail)
    markField(passwordInput,!errPassword)

    errEmail ? showMsg(emailMsg, errEmail, 'err') : showMsg(emailMsg, '✓', 'ok');
    errPassword ? showMsg(passwordMsg, 'Password is required.', 'err') : clearMsg(passwordMsg);

    if (errEmail || errPassword) { showToast('Please fill in all fields correctly.'); return; }

    const user = findUser(emailInput.value.trim());

    if (!user) {
      showMsg(emailMsg, 'No account found. Please sign up first.', 'err');
      markField(emailInput, false);
      showToast('No account found with this email.');
      return;
    }

    if (user.password !== passwordInput.value) {
      showMsg(passwordMsg, 'Incorrect password.', 'err');
      markField(passwordInput, false);
      showToast('Incorrect password.');
      return;
    }

    localStorage.setItem('wanderlust_current_user', JSON.stringify(user));
    showToast(`Welcome back, ${user.fullName}! Redirecting…`, 2400);
    setTimeout(() => { window.location.href = 'index.html'; }, 2400);
  })
}

document.addEventListener("DOMContentLoaded", () => {
  initEyeToggle();
  initSignUp();
  initSignIn();
});
