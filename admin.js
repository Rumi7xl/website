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
    loadAdminMessages(); // Mesajları doğru koleksiyondan çekiyoruz
  }
});

// BİLDİRİMİ ORTA ÜST KISMA KONUMLANDIRAN FONKSİYON
function showToast(message, type = 'success') {
  let toast = document.getElementById("customToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "customToast";
    toast.style.cssText = `
      position: fixed;
      top: 25px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      background: #111;
      color: #fff;
      border: 1px solid ${type === 'error' ? '#ef4444' : '#9146ff'};
      padding: 14px 28px;
      border-radius: 14px;
      box-shadow: 0 0 30px rgba(145, 70, 255, 0.5);
      z-index: 999999;
      font-size: 1rem;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.3s ease;
      opacity: 0;
    `;
    document.body.appendChild(toast);
  }

  toast.innerHTML = (type === 'error' ? '❌ ' : '✨ ') + message;
  toast.style.opacity = "1";
  toast.style.transform = "translateX(-50%) translateY(0)";

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(-20px)";
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
  document.getElementById("uploadLabelText").innerText = "📁 Fotoğraf seçmek için tıkla veya buraya yükle";
  document.getElementById("imagePreviewContainer").style.display = "none";
  document.getElementById("imagePreview").src = "";
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
            <button class="delete-btn" onclick="window.confirmDeleteAnnounce('${id}')">Sil</button>
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

// DOĞRU KOLEKSİYON ('messages') ÜZERİNDEN MESAJLARI ÇEKME
async function loadAdminMessages() {
  const chatContainer = document.getElementById("adminChatList");
  if (!chatContainer) return;

  chatContainer.innerHTML = "<p style='color:#aaa;'>Mesajlar yükleniyor...</p>";

  try {
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    chatContainer.innerHTML = "";

    if (snap.empty) {
      chatContainer.innerHTML = "<p style='color:#aaa;'>Henüz toplulukta atılmış bir mesaj yok.</p>";
      return;
    }

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;

      let dateStr = "";
      if (data.createdAt) {
        const d = new Date(data.createdAt);
        dateStr = d.toLocaleDateString("tr-TR") + " - " + d.toLocaleTimeString("tr-TR", {hour: '2-digit', minute:'2-digit'});
      }

      const username = data.username || "Anonim";
      const messageText = data.text || "";

      const item = document.createElement("div");
      item.className = "mod-item";
      item.innerHTML = `
        <div class="text">
          <strong style="color: #9146ff;">${username}:</strong> ${messageText}
          <br><small style="color: #777;">📅 ${dateStr}</small>
        </div>
        <button class="delete-btn" onclick="window.confirmDeleteMessage('${id}')">Sil</button>
      `;
      chatContainer.appendChild(item);
    });

  } catch (err) {
    console.error("Mesajlar yüklenirken hata:", err);
    chatContainer.innerHTML = "<p style='color:#ef4444;'>Mesajlar yüklenirken hata oluştu.</p>";
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

// DUYURU SİLME ONAYI
window.confirmDeleteAnnounce = function(id) {
  const modal = document.getElementById("customConfirmModal");
  const yesBtn = document.getElementById("confirmYesBtn");
  const noBtn = document.getElementById("confirmNoBtn");

  document.getElementById("confirmText").innerText = "Bu duyuruyu silmek istediğine emin misin?";
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

  noBtn.onclick = () => { modal.style.display = "none"; };
};

// MESAJ SİLME ONAYI (doğru koleksiyondan siler)
window.confirmDeleteMessage = function(id) {
  const modal = document.getElementById("customConfirmModal");
  const yesBtn = document.getElementById("confirmYesBtn");
  const noBtn = document.getElementById("confirmNoBtn");

  document.getElementById("confirmText").innerText = "Bu mesajı silmek istediğine emin misin patron?";
  modal.style.display = "flex";

  yesBtn.onclick = async () => {
    modal.style.display = "none";
    try {
      await deleteDoc(doc(db, "messages", id));
      showToast("Mesaj silindi.");
      loadAdminMessages();
    } catch (e) {
      showToast("Mesaj silinirken hata oluştu!", "error");
    }
  };

  noBtn.onclick = () => { modal.style.display = "none"; };
};

async function loadStats() {
  try {
    const snap = await getDocs(collection(db, "duyurular"));
    document.getElementById("totalAnnouncements").innerText = snap.size;
  } catch (e) {}
}
