import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  updatePassword
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCiuXtHu3J9Va46a4KiETO2JrSn5um2KoQ",
  authDomain: "rumi7xl-web.firebaseapp.com",
  projectId: "rumi7xl-web",
  storageBucket: "rumi7xl-web.firebasestorage.app",
  messagingSenderId: "1077565304835",
  appId: "1:1077565304835:web:a672a4440797b76f42de36"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// OTURUM DURUMUNA GÖRE SAĞ ÜSTÜ DÜZENLE
onAuthStateChanged(auth, (user) => {
  const accountBox = document.querySelector(".account-box");
  if (!accountBox) return;

  if (user) {
    const name = user.displayName || user.email.split("@")[0];
    const photo = user.photoURL || "https://api.dicebear.com/7.x/bottts/svg?seed=" + encodeURIComponent(name);

    accountBox.innerHTML = `
      <div class="user-profile-menu" id="userProfileBtn">
        <img src="${photo}" class="profile-avatar" alt="Profil">
        <span style="color:#fff; font-weight:bold;">${name}</span>
        <div class="dropdown-menu" id="dropdownMenu">
          <a href="#" class="dropdown-item" id="openPhotoModalBtn">🖼️ Fotoğraf Değiştir</a>
          <a href="#" class="dropdown-item" id="openPassModalBtn">🔑 Şifre Değiştir</a>
          <a href="#" class="dropdown-item" id="logoutBtn" style="color: #ef4444;">🚪 Çıkış Yap</a>
        </div>
      </div>
    `;

    // Dropdown Tıklama Dinleyicileri
    document.getElementById("userProfileBtn").onclick = (e) => {
      e.stopPropagation();
      document.getElementById("dropdownMenu").classList.toggle("show");
    };

    // Fotoğraf Modal Aç
    document.getElementById("openPhotoModalBtn").onclick = (e) => {
      e.preventDefault();
      document.getElementById("photoModal").style.display = "flex";
    };

    // Şifre Modal Aç
    document.getElementById("openPassModalBtn").onclick = (e) => {
      e.preventDefault();
      document.getElementById("passwordModal").style.display = "flex";
    };

    document.getElementById("logoutBtn").onclick = () => signOut(auth);

  } else {
    accountBox.innerHTML = `
      <a href="#" class="login-btn" onclick="document.getElementById('accountModal').style.display='flex'; showLogin();">👤 Giriş Yap</a>
      <a href="#" class="register-btn" onclick="document.getElementById('accountModal').style.display='flex'; showRegister();">✨ Kayıt Ol</a>
    `;
  }
});

// Sayfa geneline tıklandığında açılır menüyü kapat
document.addEventListener("click", () => {
  const menu = document.getElementById("dropdownMenu");
  if (menu) menu.classList.remove("show");
});

// FORM İŞLEMLERİ
document.addEventListener("submit", async (e) => {
  // Giriş
  if (e.target.id === "loginForm") {
    e.preventDefault();
    const email = e.target.email.value;
    const pass = e.target.password.value;
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      document.getElementById("accountModal").style.display = "none";
    } catch (err) { alert("Giriş Hatalı: " + err.message); }
  }

  // Kayıt
  if (e.target.id === "registerForm") {
    e.preventDefault();
    const username = e.target.username.value;
    const email = e.target["register-email"].value;
    const pass = e.target["new-password"].value;
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(res.user, { displayName: username });
      document.getElementById("accountModal").style.display = "none";
      location.reload();
    } catch (err) { alert("Kayıt Hatalı: " + err.message); }
  }

  // Fotoğraf Güncelleme
  if (e.target.id === "photoSettingsForm") {
    e.preventDefault();
    const photoUrl = e.target.photoUrl.value.trim();
    const user = auth.currentUser;

    if (!user) return;

    try {
      if (photoUrl) {
        await updateProfile(user, { photoURL: photoUrl });
        alert("Profil fotoğrafın güncellendi! 🔥");
        document.getElementById("photoModal").style.display = "none";
        location.reload();
      }
    } catch (err) {
      alert("Fotoğraf Güncelleme Hatası: " + err.message);
    }
  }

  // Şifre Güncelleme
  if (e.target.id === "passwordSettingsForm") {
    e.preventDefault();
    const newPass = e.target.changePassword.value.trim();
    const user = auth.currentUser;

    if (!user) return;

    try {
      if (newPass) {
        await updatePassword(user, newPass);
        alert("Şifren başarıyla değiştirildi! 🔑");
        document.getElementById("passwordModal").style.display = "none";
      }
    } catch (err) {
      alert("Şifre Güncelleme Hatası: " + err.message);
    }
  }
});

// Şifremi Unuttum
document.addEventListener("click", (e) => {
  if (e.target.id === "forgotPasswordBtn") {
    e.preventDefault();
    const loginForm = document.getElementById("loginForm");
    const email = loginForm?.querySelector("input[type='email']")?.value.trim();
    if (!email) {
      alert("Lütfen e-posta alanını doldurup tekrar 'Şifremi Unuttum'a tıklayın.");
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() => alert("Şifre sıfırlama bağlantısı e-postana gönderildi! 📧"))
      .catch((err) => alert("Hata: " + err.message));
  }
});
