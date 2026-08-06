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
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

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
const db = getFirestore(app);

// ŞIK BİLDİRİM (TOAST) FONKSİYONU
function showToast(message, type = 'success') {
  let toast = document.getElementById("customToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "customToast";
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #18181b;
      color: #fff;
      border: 1px solid ${type === 'error' ? '#ef4444' : '#a855f7'};
      padding: 12px 20px;
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      z-index: 99999;
      font-size: 0.95rem;
      font-family: inherit;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.3s ease;
      opacity: 0;
      transform: translateY(-20px);
    `;
    document.body.appendChild(toast);
  }

  toast.innerHTML = (type === 'error' ? '❌ ' : '✨ ') + message;
  toast.style.opacity = "1";
  toast.style.transform = "translateY(0)";

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-20px)";
  }, 3000);
}

// OTURUM DURUMUNA GÖRE SAĞ ÜSTÜ DÜZENLE
onAuthStateChanged(auth, async (user) => {
  const accountBox = document.querySelector(".account-box");
  if (!accountBox) return;

  if (user) {
    const name = user.displayName || user.email.split("@")[0];
    let photo = "https://api.dicebear.com/7.x/bottts/svg?seed=" + encodeURIComponent(name);

    // Fotoğrafı Firestore veritabanından çek
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().photoURL) {
        photo = userDoc.data().photoURL;
      } else if (user.photoURL) {
        photo = user.photoURL;
      }
    } catch (e) {
      console.log("Profil fotosu veritabanından alınamadı:", e);
    }

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

    document.getElementById("logoutBtn").onclick = () => {
      signOut(auth).then(() => showToast("Başarıyla çıkış yapıldı."));
    };

  } else {
    accountBox.innerHTML = `
      <a href="#" class="login-btn" onclick="window.openAccountModal ? window.openAccountModal('login') : (document.getElementById('accountModal').style.display='flex'); return false;">👤 Giriş Yap</a>
      <a href="#" class="register-btn" onclick="window.openAccountModal ? window.openAccountModal('register') : (document.getElementById('accountModal').style.display='flex'); return false;">✨ Kayıt Ol</a>
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
      showToast("Giriş başarıyla yapıldı!");
    } catch (err) { 
      showToast("Giriş Hatalı: " + err.message, 'error'); 
    }
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
      showToast("Kayıt başarıyla oluşturuldu!");
      setTimeout(() => location.reload(), 1000);
    } catch (err) { 
      showToast("Kayıt Hatalı: " + err.message, 'error'); 
    }
  }

  // PROFİL FOTOĞRAFI YÜKLEME
  if (e.target.id === "photoSettingsForm") {
    e.preventDefault();
    const fileInput = document.getElementById("photoFileInput");
    const user = auth.currentUser;

    if (!user || !fileInput.files[0]) {
      showToast("Lütfen bir resim dosyası seç kanka!", 'error');
      return;
    }

    const file = fileInput.files[0];
    const submitBtn = e.target.querySelector("button[type='submit']");
    if (submitBtn) {
      submitBtn.innerText = "Yükleniyor...";
      submitBtn.disabled = true;
    }

    const reader = new FileReader();
    reader.onload = function (evt) {
      const img = new Image();
      img.src = evt.target.result;
      img.onload = async function() {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        const size = 150;
        canvas.width = size;
        canvas.height = size;

        let minDim = Math.min(img.width, img.height);
        let sx = (img.width - minDim) / 2;
        let sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

        try {
          await setDoc(doc(db, "users", user.uid), {
            photoURL: compressedBase64,
            username: user.displayName || user.email.split("@")[0],
            updatedAt: Date.now()
          }, { merge: true });

          showToast("Profil fotoğrafın başarıyla güncellendi! 🔥");
          document.getElementById("photoModal").style.display = "none";
          
          if (submitBtn) {
            submitBtn.innerText = "Fotoğrafı Yükle ve Kaydet";
            submitBtn.disabled = false;
          }

          setTimeout(() => location.reload(), 800);

        } catch (err) {
          showToast("Fotoğraf Güncelleme Hatası: " + err.message, 'error');
          if (submitBtn) {
            submitBtn.innerText = "Fotoğrafı Yükle ve Kaydet";
            submitBtn.disabled = false;
          }
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
        showToast("Şifren başarıyla değiştirildi! 🔑");
        document.getElementById("passwordModal").style.display = "none";
      }
    } catch (err) {
      showToast("Şifre Güncelleme Hatası: " + err.message, 'error');
    }
  }
});

document.addEventListener("click", (e) => {
  if (e.target.id === "forgotPasswordBtn") {
    e.preventDefault();
    const loginForm = document.getElementById("loginForm");
    const email = loginForm?.querySelector("input[type='email']")?.value.trim();
    if (!email) {
      showToast("Lütfen e-posta alanını doldurup tekrar deneyin.", 'error');
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() => showToast("Şifre sıfırlama bağlantısı e-postana gönderildi! 📧"))
      .catch((err) => showToast("Hata: " + err.message, 'error'));
  }
});
