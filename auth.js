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

window.switchTab = function(type) {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const loginBtn = document.getElementById("loginTabBtn");
  const registerBtn = document.getElementById("registerTabBtn");

  if (type === 'login') {
    if (loginForm) loginForm.style.display = "flex";
    if (registerForm) registerForm.style.display = "none";
    if (loginBtn) loginBtn.classList.add("active");
    if (registerBtn) registerBtn.classList.remove("active");
  } else {
    if (loginForm) loginForm.style.display = "none";
    if (registerForm) registerForm.style.display = "flex";
    if (registerBtn) registerBtn.classList.add("active");
    if (loginBtn) loginBtn.classList.remove("active");
  }
};

window.openAccountModal = function(type) {
  const modal = document.getElementById("accountModal");
  if (modal) {
    modal.style.display = "flex";
    window.switchTab(type);
  }
};

function showToast(message, type = 'success') {
  let toast = document.getElementById("customToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "customToast";
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #111;
      color: #fff;
      border: 1px solid ${type === 'error' ? '#ef4444' : '#9146ff'};
      padding: 12px 20px;
      border-radius: 12px;
      box-shadow: 0 0 25px rgba(145, 70, 255, 0.4);
      z-index: 999999;
      font-size: 0.95rem;
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

// OTURUM DURUMU KONTROLÜ
onAuthStateChanged(auth, async (user) => {
  const accountBox = document.querySelector(".account-box");
  if (!accountBox) return;

  if (user) {
    const name = user.displayName || user.email.split("@")[0];
    // Kırılmayan güvenli varsayılan profil fotosu
    let photo = "https://ui-avatars.com/api/?name=" + encodeURIComponent(name) + "&background=9146ff&color=fff";

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().photoURL) {
        photo = userDoc.data().photoURL;
      } else if (user.photoURL) {
        photo = user.photoURL;
      }
    } catch (e) {
      console.log(e);
    }

    // 3. FOTOĞRAFTAKİ BİREBİR TASARIM VE DROPDOWN YAPISI
    accountBox.innerHTML = `
      <div style="position: relative; display: inline-block;">
        <button id="userProfileBtn" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 6px 16px 6px 8px; border-radius: 30px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-weight: bold; transition: 0.3s;">
          <img src="${photo}" id="headerUserImg" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid #9146ff; box-shadow: 0 0 10px rgba(145,70,255,0.5);">
          <span style="font-size: 15px;">${name}</span>
        </button>
        
        <div id="dropdownMenu" style="display: none; position: absolute; right: 0; top: 50px; background: #111; border: 1px solid #9146ff; border-radius: 18px; padding: 12px; width: 180px; box-shadow: 0 0 30px rgba(145,70,255,0.4); z-index: 999999; flex-direction: column; gap: 6px;">
          <a href="#" id="openPhotoModalBtn" style="color: #fff; text-decoration: none; font-size: 0.9rem; padding: 8px 12px; border-radius: 10px; display: flex; align-items: center; gap: 8px; transition: 0.2s;">🖼️ Fotoğraf Değiştir</a>
          <a href="#" id="openPassModalBtn" style="color: #fff; text-decoration: none; font-size: 0.9rem; padding: 8px 12px; border-radius: 10px; display: flex; align-items: center; gap: 8px; transition: 0.2s;">🔑 Şifre Değiştir</a>
          <div style="height: 1px; background: rgba(255,255,255,0.1); margin: 4px 0;"></div>
          <a href="#" id="logoutBtn" style="color: #ef4444; text-decoration: none; font-size: 0.9rem; padding: 8px 12px; border-radius: 10px; display: flex; align-items: center; gap: 8px; font-weight: bold; transition: 0.2s;">🚪 Çıkış Yap</a>
        </div>
      </div>
    `;

    // Resim yüklenemezse fallback devreye girsin
    const headerImg = document.getElementById("headerUserImg");
    if (headerImg) {
      headerImg.onerror = () => {
        headerImg.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(name) + "&background=9146ff&color=fff";
      };
    }

    const profileBtn = document.getElementById("userProfileBtn");
    const dropdownMenu = document.getElementById("dropdownMenu");

    profileBtn.onclick = (e) => {
      e.stopPropagation();
      dropdownMenu.style.display = dropdownMenu.style.display === "flex" ? "none" : "flex";
    };

    document.getElementById("openPhotoModalBtn").onclick = (e) => {
      e.preventDefault();
      dropdownMenu.style.display = "none";
      const m = document.getElementById("photoModal");
      if (m) m.style.display = "flex";
    };

    document.getElementById("openPassModalBtn").onclick = (e) => {
      e.preventDefault();
      dropdownMenu.style.display = "none";
      const m = document.getElementById("passwordModal");
      if (m) m.style.display = "flex";
    };

    document.getElementById("logoutBtn").onclick = (e) => {
      e.preventDefault();
      signOut(auth).then(() => {
        showToast("Başarıyla çıkış yapıldı.");
        setTimeout(() => location.reload(), 500);
      });
    };

  } else {
    accountBox.innerHTML = `
      <a href="#" class="login-btn" onclick="window.openAccountModal('login'); return false;">👤 Giriş Yap</a>
      <a href="#" class="register-btn" onclick="window.openAccountModal('register'); return false;">✨ Kayıt Ol</a>
    `;
  }
});

// DIŞARI TIKLANDIĞINDA DROPDOWN KAPAT
document.addEventListener("click", (e) => {
  const menu = document.getElementById("dropdownMenu");
  const btn = document.getElementById("userProfileBtn");
  if (menu && btn && !btn.contains(e.target) && !menu.contains(e.target)) {
    menu.style.display = "none";
  }
});

// RESİM SEÇİLİNCE ÖNİZLEME
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

// FORM GÖNDERİMLERİ
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
      setTimeout(() => location.reload(), 800);
    } catch (err) { 
      showToast("Kayıt Hatalı: " + err.message, 'error'); 
    }
  }

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
            submitBtn.innerText = "Yükle ve Kaydet";
            submitBtn.disabled = false;
          }

          setTimeout(() => location.reload(), 600);

        } catch (err) {
          showToast("Fotoğraf Güncelleme Hatası: " + err.message, 'error');
          if (submitBtn) {
            submitBtn.innerText = "Yükle ve Kaydet";
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
