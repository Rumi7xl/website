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

// Oturum Kalıcılığı
setPersistence(auth, browserLocalPersistence).catch((err) => console.error("Persistence Error:", err));

// Bildirim Kutusu (Toast) Oluşturucu
function showToast(message) {
  let toast = document.getElementById("siteToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "siteToast";
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.classList.add("show");
  
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

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

// Tıklama Dinleyicileri (Login, Register, Logout)
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
        showToast("Başarıyla çıkış yapıldı!");
        setTimeout(() => location.reload(), 1200);
      })
      .catch((err) => alert("Çıkış hatası: " + err.message));
  }
});

// Header Alanını Güncelleyen Yardımcı Fonksiyon
function updateHeaderUser(name) {
  const accountBoxes = document.querySelectorAll(".account-box");
  accountBoxes.forEach((accountBox) => {
    accountBox.innerHTML = `
      <a class="user-name" style="cursor: default; font-weight: bold;">
        👤 ${name}
      </a>
      <a href="#" id="logoutBtn" style="margin-left: 10px; color: #ff4d4d;">
        🚪 Çıkış Yap
      </a>
    `;
  });
}

// Form Gönderme Dinleyicileri
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  // GİRİŞ YAP FORM
  if (loginForm) {
    const handleLogin = async (e) => {
      e.preventDefault();
      const allInputs = Array.from(loginForm.querySelectorAll("input"));
      
      const emailInput = allInputs.find(i => i.type === "email" || i.placeholder.toLowerCase().includes("e-posta")) || allInputs[0];
      const passInput = allInputs.find(i => i.type === "password" || i.placeholder.toLowerCase().includes("şifre")) || allInputs[1];

      const email = emailInput?.value.trim();
      const password = passInput?.value;

      if (!email || !password) {
        alert("Lütfen e-posta ve şifrenizi girin.");
        return;
      }

      try {
        await signInWithEmailAndPassword(auth, email, password);
        closeAuthModal();
        loginForm.reset();
        showToast("Başarıyla giriş yapıldı!");
      } catch (err) {
        alert("Giriş Hatası: " + err.message);
      }
    };

    loginForm.addEventListener("submit", handleLogin);
    const loginSubmitBtn = loginForm.querySelector(".account-submit");
    if (loginSubmitBtn) loginSubmitBtn.onclick = handleLogin;
  }

  // KAYIT OL FORM
  if (registerForm) {
    const handleRegister = async (e) => {
      e.preventDefault();
      const allInputs = Array.from(registerForm.querySelectorAll("input"));

      // Akıllı İnput Bulucu (Sıraya göre değil, kutunun amacına göre bulur)
      const userInput = allInputs.find(i => i.placeholder.toLowerCase().includes("kullanıcı") || i.name === "username") || allInputs[0];
      const emailInput = allInputs.find(i => i.type === "email" || i.placeholder.toLowerCase().includes("e-posta")) || allInputs[1];
      const passInput = allInputs.find(i => i.type === "password" || i.placeholder.toLowerCase().includes("şifre")) || allInputs[2];

      const username = userInput?.value.trim();
      const email = emailInput?.value.trim();
      const password = passInput?.value;

      if (!username || !email || !password) {
        alert("Lütfen tüm alanları (Kullanıcı Adı, E-posta, Şifre) doldurun.");
        return;
      }

      try {
        // 1. Hesap Oluştur
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // 2. Kullanıcı Adını Firebase Profiline Kaydet
        await updateProfile(userCredential.user, {
          displayName: username
        });

        // 3. Header'a Anında Yaz
        updateHeaderUser(username);

        closeAuthModal();
        registerForm.reset();
        showToast("Başarıyla kayıt olundu!");
      } catch (err) {
        alert("Kayıt Hatası: " + err.message);
      }
    };

    registerForm.addEventListener("submit", handleRegister);
    const registerSubmitBtn = registerForm.querySelector(".account-submit");
    if (registerSubmitBtn) registerSubmitBtn.onclick = handleRegister;
  }
});

// Oturum Durumu Takibi (Sayfa Yenilendiğinde veya Girişte)
onAuthStateChanged(auth, (user) => {
  const accountBoxes = document.querySelectorAll(".account-box");
  accountBoxes.forEach((accountBox) => {
    if (user) {
      // SADECE ve SADECE displayName varsa onu basar, yoksa mailin başını basar
      const usernameToShow = user.displayName || user.email.split("@")[0];
      updateHeaderUser(usernameToShow);
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
});

window.showToast = showToast;
window.firebaseAuth = auth;
