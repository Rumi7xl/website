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

    document.getElementById("userProfileBtn").onclick = (e) => {
      e.stopPropagation();
      document.getElementById("dropdownMenu").classList.toggle("show");
    };

    document.getElementById("openPhotoModalBtn").onclick = (e) => {
      e.preventDefault();
      document.getElementById("photoModal").style.display = "flex";
    };

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

document.addEventListener("click", () => {
  const menu = document.getElementById("dropdownMenu");
  if (menu) menu.classList.remove("show");
});

// GÖRSEL SEÇİLDİĞİNDE ÖNİZLEME GÖSTER
document.addEventListener("change", (e) => {
  if (e.target.id === "photoFileInput") {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        const preview = document.getElementById("photoPreview");
        if (preview) {
          preview.src = evt.target.result;
          preview.style.display = "block";
        }
        const labelText = document.getElementById("uploadLabelText");
        if (labelText) labelText.innerText = "Fotoğraf Seçildi! Değiştirmek için tıkla";
      };
      reader.readAsDataURL(file);
    }
  }
});

// FORM İŞLEMLERİ
document.addEventListener("submit", async (e) => {
  if (e.target.id === "loginForm") {
    e.preventDefault();
    const email = e.target.email.value;
    const pass = e.target.password.value;
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      document.getElementById("accountModal").style.display = "none";
    } catch (err) { alert("Giriş Hatalı: " + err.message); }
  }

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

  // FOTOĞRAFI OTOMATİK SIKIŞTIRIP YÜKLEME
  if (e.target.id === "photoSettingsForm") {
    e.preventDefault();
    const fileInput = document.getElementById("photoFileInput");
    const user = auth.currentUser;

    if (!user || !fileInput.files[0]) {
      alert("Lütfen bir resim dosyası seç kanka!");
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (evt) {
      const img = new Image();
      img.src = evt.target.result;
      img.onload = async function() {
        // Resmi Sıkıştırma (Canvas)
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const maxSize = 256; // 256x256 piksellik profil fotosu boyutu

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8); // JPEG %80 Kalite

        try {
          await updateProfile(user, { photoURL: compressedBase64 });
          alert("Profil fotoğrafın başarıyla güncellendi! 🔥");
          document.getElementById("photoModal").style.display = "none";
          location.reload();
        } catch (err) {
          alert("Fotoğraf Yükleme Hatası: " + err.message);
        }
      };
    };

    reader.readAsDataURL(file);
  }

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
