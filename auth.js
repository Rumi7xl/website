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
  apiKey: "AIzaSyCiuXtHu3J9Va46a4KiETO2Jr5um2KoQ",
  authDomain: "rumi7xl-web.firebaseapp.com",
  projectId: "rumi7xl-web",
  storageBucket: "rumi7xl-web.firebasestorage.app",
  messagingSenderId: "1077565304835",
  appId: "1:1077565304835:web:a672a4440797b76f42de36"
};

// Firebase Başlatma
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Oturum Kalıcılığı
setPersistence(auth, browserLocalPersistence).catch((err) => console.error("Persistence Error:", err));

// DOM Elemanları
const accountBox = document.querySelector(".account-box");
const modal = document.getElementById("accountModal");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

// Modal Açma Fonksiyonu
function openAuthModal(mode = "login") {
  if (typeof window.showLogin === "function" && mode === "login") {
    window.showLogin();
  } else if (typeof window.showRegister === "function" && mode === "register") {
    window.showRegister();
  }
  if (modal) {
    modal.style.display = "flex";
  }
}

// Modal Kapatma Fonksiyonu
function closeAuthModal() {
  if (modal) {
    modal.style.display = "none";
  }
}

// Tıklama Olaylarını Dinleme (Event Delegation)
document.addEventListener("click", (e) => {
  // Giriş Yap Butonları
  if (e.target.closest(".login-btn")) {
    e.preventDefault();
    openAuthModal("login");
  }

  // Kayıt Ol Butonları
  if (e.target.closest(".register-btn")) {
    e.preventDefault();
    openAuthModal("register");
  }

  // Çıkış Yap Butonu
  if (e.target.closest("#logoutBtn")) {
    e.preventDefault();
    signOut(auth)
      .then(() => {
        window.location.reload();
      })
      .catch((err) => alert("Çıkış hatası: " + err.message));
  }
});

// GİRİŞ YAP FORM SUBMIT
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
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
      loginForm.reset();
    } catch (err) {
      alert("Giriş Hatası: " + err.message);
    }
  });
}

// KAYIT OL FORM SUBMIT
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const inputs = registerForm.querySelectorAll("input");
    const username = inputs[0]?.value.trim();
    const email = inputs[1]?.value.trim();
    const password = inputs[2]?.value;

    if (!username || !email || !password) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Kullanıcı Adını Firebase Profiline Kaydet
      await updateProfile(userCredential.user, {
        displayName: username
      });

      closeAuthModal();
      registerForm.reset();
    } catch (err) {
      alert("Kayıt Hatası: " + err.message);
    }
  });
}

// OTURUM DURUMU DİNLENİYOR
onAuthStateChanged(auth, (user) => {
  if (!accountBox) return;

  if (user) {
    // Profil ismi varsa kullan yoksa mail adını al
    const displayName = user.displayName || user.email.split("@")[0];

    accountBox.innerHTML = `
      <a class="user-name" style="cursor: default;">
        👤 ${displayName}
      </a>
      <a href="#" id="logoutBtn" style="margin-left: 10px; color: #ff4d4d;">
        🚪 Çıkış Yap
      </a>
    `;
  } else {
    accountBox.innerHTML = `
      <a href="#" class="login-btn">
        👤 Giriş Yap
      </a>
      <a href="#" class="register-btn" style="margin-left: 8px;">
        ✨ Kayıt Ol
      </a>
    `;
  }
});

// Global Erişimler
window.firebaseAuth = auth;
window.logout = () => signOut(auth);
