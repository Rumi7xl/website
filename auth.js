import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

// Firebase Yapılandırması
const firebaseConfig = {
  apiKey: "AIzaSyCiuXtHu3J9Va46a4KiETO2JrSn5um2KoQ",
  authDomain: "rumi7xl-web.firebaseapp.com",
  projectId: "rumi7xl-web",
  storageBucket: "rumi7xl-web.firebasestorage.app",
  messagingSenderId: "1077565304835",
  appId: "1:1077565304835:web:a672a4440797b76f42de36"
};

// Firebase Başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Oturum Kalıcılığını Ayarla
setPersistence(auth, browserLocalPersistence).catch((err) => console.error("Persistence Error:", err));

// Modal Yönetimi
function openAuthModal(mode = "login") {
  const modal = document.getElementById("accountModal");
  if (typeof window.showLogin === "function" && mode === "login") {
    window.showLogin();
  } else if (typeof window.showRegister === "function" && mode === "register") {
    window.showRegister();
  }
  if (modal) {
    modal.style.display = "flex";
  }
}

function closeAuthModal() {
  const modal = document.getElementById("accountModal");
  if (modal) {
    modal.style.display = "none";
  }
}

// Global Tıklama Dinleyicisi (Event Delegation)
document.addEventListener("click", (e) => {
  if (e.target.closest(".login-btn")) {
    e.preventDefault();
    openAuthModal("login");
  }

  if (e.target.closest(".register-btn")) {
    e.preventDefault();
    openAuthModal("register");
  }

  if (e.target.closest("#logoutBtn")) {
    e.preventDefault();
    signOut(auth)
      .then(() => {
        if (typeof window.showToast === "function") {
          window.showToast("Çıkış yapıldı");
          setTimeout(() => location.reload(), 1000);
        } else {
          location.reload();
        }
      })
      .catch((err) => alert("Çıkış hatası: " + err.message));
  }
});

// Form İşlemleri
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) {
    const loginSubmitBtn = loginForm.querySelector(".account-submit");
    const handleLogin = async (e) => {
      e.preventDefault();
      const inputs = loginForm.querySelectorAll("input");
      const email = inputs[0]?.value.trim();
      const password = inputs[1]?.value;

      if (!email || !password) {
        alert("Lütfen tüm alanları doldurun.");
        return;
      }

      try {
        await signInWithEmailAndPassword(auth, email, password);
        closeAuthModal();
        if (typeof window.showToast === "function") window.showToast("Giriş başarılı");
      } catch (err) {
        alert("Giriş Hatası: " + err.message);
      }
    };

    loginForm.addEventListener("submit", handleLogin);
    if (loginSubmitBtn) loginSubmitBtn.onclick = handleLogin;
  }

  if (registerForm) {
    const registerSubmitBtn = registerForm.querySelector(".account-submit");
    const handleRegister = async (e) => {
      e.preventDefault();
      const inputs = registerForm.querySelectorAll("input");
      
      // Dinamik input tespiti (username, email, pass)
      let username = "", email = "", password = "";
      if (inputs.length >= 3) {
        username = inputs[0].value.trim();
        email = inputs[1].value.trim();
        password = inputs[2].value;
      }

      if (!username || !email || !password) {
        alert("Lütfen tüm alanları doldurun.");
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: username });
        closeAuthModal();
        if (typeof window.showToast === "function") window.showToast("Hesap oluşturuldu");
      } catch (err) {
        alert("Kayıt Hatası: " + err.message);
      }
    };

    registerForm.addEventListener("submit", handleRegister);
    if (registerSubmitBtn) registerSubmitBtn.onclick = handleRegister;
  }
});

// Oturum Durumu Takibi
onAuthStateChanged(auth, (user) => {
  const accountBoxes = document.querySelectorAll(".account-box");
  accountBoxes.forEach((accountBox) => {
    if (user) {
      const displayName = user.displayName || user.email.split("@")[0];
      accountBox.innerHTML = `
        <a class="user-name" style="cursor: default;">👤 ${displayName}</a>
        <a href="#" id="logoutBtn" style="margin-left: 10px; color: #ff4d4d;">🚪 Çıkış Yap</a>
      `;
    } else {
      accountBox.innerHTML = `
        <a href="#" class="login-btn">👤 Giriş Yap</a>
        <a href="#" class="register-btn" style="margin-left: 8px;">✨ Kayıt Ol</a>
      `;
    }
  });
});

window.firebaseAuth = auth;
window.logout = () => signOut(auth);
