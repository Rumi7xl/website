import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getFirestore, collection, addDoc, updateDoc, doc, serverTimestamp, getDocs, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

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

const ADMIN_EMAIL = "rumi7xl@gmail.com";

onAuthStateChanged(auth, (user) => {
  if (!user || user.email !== ADMIN_EMAIL) {
    showToast("Yetkisiz giriş!", "error");
    setTimeout(() => { window.location.href = "index.html"; }, 1000);
  } else {
    loadStats();
    loadAdminAnnouncements();
  }
});

// ŞIK TOAST BİLDİRİM FONKSİYONU
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

const sendAnnounceBtn = document.getElementById("sendAnnounceBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

if (sendAnnounceBtn) {
  sendAnnounceBtn.addEventListener("click", async () => {
    const title = document.getElementById("announceTitle").value.trim();
    const desc = document.getElementById("announceDesc").value.trim();
    const fileInput = document.getElementById("announceImageFile");
    const editingId = document.getElementById("editingId").value;

    if (!title || !desc) {
      showToast("Lütfen başlık ve içeriği boş bırakma kanka!", "error");
      return;
    }

    sendAnnounceBtn.innerText = "İşlem yapılıyor...";
    sendAnnounceBtn.disabled = true;

    let imageUrl = "";
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      imageUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    }

    try {
      if (editingId) {
        const updateData = { title, description: desc };
        if (imageUrl) updateData.image = imageUrl;

        await updateDoc(doc(db, "duyurular", editingId), updateData);
        showToast("Duyuru başarıyla güncellendi! 🔥");
        resetForm();
      } else {
        await addDoc(collection(db, "duyurular"), {
          title,
          description: desc,
          image: imageUrl || "",
          date: serverTimestamp()
        });
        showToast("Duyuru başarıyla yayınlandı! 🚀");
        resetForm();
      }

      loadAdminAnnouncements();
      loadStats();
    } catch (error) {
      console.error("Hata:", error);
      showToast("Bir hata oluştu!", "error");
    } finally {
      sendAnnounceBtn.innerText = "Duyuruyu Yayınla";
      sendAnnounceBtn.disabled = false;
    }
  });
}

if (cancelEditBtn) {
  cancelEditBtn.onclick = () => { resetForm(); };
}

function resetForm() {
  document.getElementById("announceTitle").value = "";
  document.getElementById("announceDesc").value = "";
  document.getElementById("announceImageFile").value = "";
  document.getElementById("editingId").value = "";
  document.getElementById("sendAnnounceBtn").innerText = "Duyuruyu Yayınla";
  if(cancelEditBtn) cancelEditBtn.style.display = "none";
}

async function loadAdminAnnouncements() {
  const container = document.getElementById("adminAnnouncementList");
  if (!container) return;

  container.innerHTML = "<p style='color:#aaa;'>Duyurular yükleniyor...</p>";

  try {
    const q = query(collection(db, "duyurular"), orderBy("date", "desc"));
    const snap = await getDocs(q);

    container.innerHTML = "";

    if (snap.empty) {
      container.innerHTML = "<p style='color:#aaa;'>Henüz yayınlanmış bir duyuru yok.</p>";
      return;
    }

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;

      let dateStr = "Tarih Yok";
      if (data.date) {
        const d = data.date.toDate();
        dateStr = d.toLocaleDateString("tr-TR") + " - " + d.toLocaleTimeString("tr-TR", {hour: '2-digit', minute:'2-digit'});
      }

      const imgHtml = data.image ? `<img src="${data.image}" alt="Duyuru Görseli">` : "";

      const card = document.createElement("div");
      card.className = "announcement-card";
      card.innerHTML = `
        ${imgHtml}
        <div class="announcement-info">
          <h3>${data.title}</h3>
          <p>${data.description}</p>
          <small style="color: #777; display: block; margin-bottom: 10px;">📅 ${dateStr}</small>
          <div class="card-actions">
            <button class="edit-btn" onclick="window.prepareEdit('${id}', \`${data.title.replace(/`/g, '\\`')}\`, \`${data.description.replace(/`/g, '\\`')}\`)">Düzenle</button>
            <button class="delete-btn" onclick="window.confirmDelete('${id}')">Sil</button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

  } catch (err) {
    console.error("Yükleme hatası:", err);
    container.innerHTML = "<p style='color:#ef4444;'>Duyurular yüklenirken hata oluştu.</p>";
  }
}

window.prepareEdit = function(id, title, desc) {
  document.getElementById("editingId").value = id;
  document.getElementById("announceTitle").value = title;
  document.getElementById("announceDesc").value = desc;
  document.getElementById("sendAnnounceBtn").innerText = "Güncellemeyi Kaydet";
  if(cancelEditBtn) cancelEditBtn.style.display = "inline-block";
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ÖZEL ONAY MODALI İLE SİLME İŞLEMİ
window.confirmDelete = function(id) {
  const modal = document.getElementById("customConfirmModal");
  const yesBtn = document.getElementById("confirmYesBtn");
  const noBtn = document.getElementById("confirmNoBtn");

  modal.style.display = "flex";

  yesBtn.onclick = async () => {
    modal.style.display = "none";
    try {
      await deleteDoc(doc(db, "duyurular", id));
      showToast("Duyuru silindi.");
      loadAdminAnnouncements();
      loadStats();
    } catch (e) {
      showToast("Silinirken hata oluştu!", "error");
    }
  };

  noBtn.onclick = () => {
    modal.style.display = "none";
  };
};

async function loadStats() {
  try {
    const snap = await getDocs(collection(db, "duyurular"));
    document.getElementById("totalAnnouncements").innerText = snap.size;
  } catch (e) {}
}
