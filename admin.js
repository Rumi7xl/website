import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getFirestore, collection, addDoc, updateDoc, doc, serverTimestamp, getDocs, deleteDoc, query, orderBy, setDoc, onSnapshot, getDoc } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

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

let adminMutedUsersCache = [];
let adminMutedInterval = null;
let adminYoutubeVideosCache = [];

onAuthStateChanged(auth, (user) => {
  if (!user || user.email !== ADMIN_EMAIL) {
    showToast("Yetkisiz giriş!", "error");
    setTimeout(() => { window.location.href = "index.html"; }, 1000);
  } else {
    loadStats();
    loadAdminAnnouncements();
    loadAdminPanelData();
    injectAdminSidebarTab();
  }
});

function showToast(message, type = 'success') {
  let toast = document.getElementById("customToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "customToast";
    toast.style.cssText = `
      position: fixed; top: 25px; left: 50%; transform: translateX(-50%) translateY(-20px);
      background: #111; color: #fff; border: 1px solid ${type === 'error' ? '#ef4444' : '#9146ff'};
      padding: 14px 28px; border-radius: 14px; box-shadow: 0 0 30px rgba(145, 70, 255, 0.5);
      z-index: 999999; font-size: 1rem; font-weight: bold; display: flex; align-items: center; gap: 12px;
      transition: all 0.3s ease; opacity: 0;
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
          title, description: desc, image: imageUrl || "", date: serverTimestamp()
        });
        showToast("Duyuru başarıyla yayınlandı! 🚀");
        resetForm();
      }
      loadAdminAnnouncements();
      loadStats();
    } catch (error) {
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
    container.innerHTML = "<p style='color:#ef4444;'>Duyurular yüklenirken hata oluştu.</p>";
  }
}

// ANA PANEL YÖNETİMİ (Susturulanlar + Canlı Mesaj Dinleyicisi)
async function loadAdminPanelData() {
  const chatContainer = document.getElementById("adminChatList");
  if (!chatContainer) return;

  chatContainer.innerHTML = `
    <div id="adminMutedSectionContainer"></div>
    <div id="adminMessagesListContainer"><p style='color:#aaa;'>Mesajlar yükleniyor...</p></div>
  `;

  await refreshAdminMutedUsers();
  if (adminMutedInterval) clearInterval(adminMutedInterval);
  adminMutedInterval = setInterval(() => {
    updateAdminMutedCountdowns();
  }, 1000);

  const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
  onSnapshot(q, (snapshot) => {
    const messagesContainer = document.getElementById("adminMessagesListContainer");
    if (!messagesContainer) return;

    let messagesHtml = `
      <div style="display: flex; gap: 10px; margin-bottom: 15px; background: #181818; padding: 12px; border-radius: 10px; align-items: center; border: 1px solid #333;">
        <input type="checkbox" id="selectAllMsgs" style="cursor: pointer; width: 18px; height: 18px;" onclick="window.toggleSelectAll(this)">
        <label for="selectAllMsgs" style="cursor: pointer; font-size: 0.9rem; color: #ccc; flex: 1;">Hepsini Seç</label>
        <button class="delete-btn" style="padding: 6px 14px; font-size: 0.85rem;" onclick="window.deleteSelectedMessages()">Seçilenleri Sil</button>
      </div>
    `;

    if (snapshot.empty) {
      messagesHtml += "<p style='color:#aaa;'>Henüz toplulukta atılmış bir mesaj yok.</p>";
    } else {
      const docsArr = [];
      snapshot.forEach(docSnap => docsArr.push({ id: docSnap.id, ...docSnap.data() }));
      docsArr.reverse();

      docsArr.forEach((data) => {
        const id = data.id;
        let dateStr = "";
        if (data.createdAt) {
          const d = new Date(data.createdAt);
          dateStr = d.toLocaleDateString("tr-TR") + " - " + d.toLocaleTimeString("tr-TR", {hour: '2-digit', minute:'2-digit'});
        }
        const username = data.username || "Anonim";
        const messageText = data.text || "";
        const uid = data.uid || "";

        messagesHtml += `
          <div class="mod-item" style="display: flex; align-items: center; gap: 12px; background: #141414; padding: 12px; border-radius: 10px; margin-bottom: 8px; border: 1px solid #222;">
            <input type="checkbox" class="msg-checkbox" value="${id}" style="cursor: pointer; width: 16px; height: 16px;">
            <div class="text" style="flex: 1;">
              <strong style="color: #9146ff; cursor: pointer;" title="Kullanıcı Menüsü İçin Tıkla" onclick="window.openUserModeration('${uid}', '${username}')">${username} ⚙️:</strong> ${messageText}
              <br><small style="color: #777;">📅 ${dateStr}</small>
            </div>
            <button class="delete-btn" style="padding: 6px 12px; font-size: 0.85rem;" onclick="window.confirmDeleteMessage('${id}')">Sil</button>
          </div>
        `;
      });
    }

    messagesContainer.innerHTML = messagesHtml;
  });
}

// SOLDAN SEÇİLEBİLEN İÇERİKLER YÖNETİM SEKMESİ VE PANELİ
function injectAdminSidebarTab() {
  // Admin panelindeki yan menüyü (sidebar) veya buton alanını bulalım
  const sidebarNav = document.querySelector(".admin-sidebar") || document.querySelector(".sidebar") || document.querySelector("aside") || document.querySelector("nav") || document.body;

  // Eğer özel bir sidebar butonu grubu varsa oraya ekleyelim, yoksa sol üste şık bir buton koyalım
  let tabBtn = document.getElementById("adminIceriklerSidebarBtn");
  if (!tabBtn) {
    tabBtn = document.createElement("button");
    tabBtn.id = "adminIceriklerSidebarBtn";
    tabBtn.innerHTML = "🎬 İçerikler Yönetimi";
    tabBtn.style.cssText = `
      display: block; width: 100%; background: #1f1424; color: #c084fc; border: 1px solid #9146ff55;
      padding: 12px 18px; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 0.95rem;
      margin: 15px 0; text-align: left; transition: all 0.2s;
    `;
    tabBtn.onmouseover = () => { tabBtn.style.background = "#2a1b33"; };
    tabBtn.onmouseout = () => { tabBtn.style.background = "#1f1424"; };
    
    // Eğer sidebar varsa içine ekle, yoksa body'ye sol üst sabit buton yap
    if (document.querySelector(".admin-sidebar") || document.querySelector("aside")) {
      sidebarNav.appendChild(tabBtn);
    } else {
      // Alternatif olarak ana admin panel içeriğinin üst kısmına yerleştirilebilir
      const container = document.querySelector(".admin-container") || document.body;
      container.prepend(tabBtn);
    }
  }

  tabBtn.onclick = () => {
    openIceriklerAdminModal();
  };
}

async function openIceriklerAdminModal() {
  let modal = document.getElementById("adminIceriklerModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "adminIceriklerModal";
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 999999;
      box-sizing: border-box; padding: 20px;
    `;
    document.body.appendChild(modal);
  }

  modal.style.display = "flex";

  // Mevcut ayarları çek
  let config = {
    isLive: false,
    liveGame: "GTA V",
    liveViewers: "0",
    kickLink: "https://kick.com/rumi7xl",
    kickDesc: "• Minecraft\n• Valorant\n• GTA V\n• Simülasyon Oyunları",
    youtubeChannelLink: "https://youtube.com",
    youtubeVideos: [],
    tiktokLink: "https://tiktok.com",
    tiktokDesc: "En komik kesitler ve kısa videolar TikTok adresimde!"
  };

  try {
    const docSnap = await getDoc(doc(db, "siteSettings", "iceriklerConfig"));
    if (docSnap.exists()) {
      config = docSnap.data();
    }
  } catch (e) {}

  adminYoutubeVideosCache = config.youtubeVideos || [];

  modal.innerHTML = `
    <div style="background: #141414; border: 1px solid #9146ff; padding: 30px; border-radius: 20px; width: 100%; max-width: 700px; max-height: 90vh; overflow-y: auto; box-shadow: 0 0 40px rgba(145,70,255,0.4); color: #fff; position: relative; box-sizing: border-box;">
      
      <button onclick="document.getElementById('adminIceriklerModal').style.display='none'" style="position: absolute; top: 20px; right: 20px; background: #222; color: #fff; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-weight: bold; font-size: 1.1rem;">✕</button>
      
      <h3 style="color: #c084fc; margin-bottom: 20px; font-size: 1.5rem; text-align: center;">🎬 İçerikler Sayfası Yönetim Paneli</h3>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 20px;">
        
        <!-- Canlı Durum Ayarları -->
        <div style="background: #1b1b1b; padding: 15px; border-radius: 12px; border: 1px solid #2a2a2a;">
          <h4 style="color: #22c55e; margin-bottom: 12px;">🔴 Canlı Yayın Durumu</h4>
          <label style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; cursor: pointer;">
            <input type="checkbox" id="admIsLive" ${config.isLive ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
            <span style="font-weight: bold;">Şu Anda Yayında mı?</span>
          </label>
          <div style="margin-bottom: 10px;">
            <label style="font-size: 0.85rem; color: #aaa; display: block; margin-bottom: 4px;">Oynanan Oyun:</label>
            <input type="text" id="admLiveGame" value="${config.liveGame || ''}" style="width: 100%; padding: 8px; background: #111; border: 1px solid #333; color: #fff; border-radius: 6px; box-sizing: border-box;">
          </div>
          <div>
            <label style="font-size: 0.85rem; color: #aaa; display: block; margin-bottom: 4px;">İzleyici Sayısı:</label>
            <input type="text" id="admLiveViewers" value="${config.liveViewers || '0'}" style="width: 100%; padding: 8px; background: #111; border: 1px solid #333; color: #fff; border-radius: 6px; box-sizing: border-box;">
          </div>
        </div>

        <!-- Kick & TikTok Ayarları -->
        <div style="background: #1b1b1b; padding: 15px; border-radius: 12px; border: 1px solid #2a2a2a;">
          <h4 style="color: #22c55e; margin-bottom: 12px;">🎮 Kick & 📱 TikTok</h4>
          <div style="margin-bottom: 10px;">
            <label style="font-size: 0.85rem; color: #aaa; display: block; margin-bottom: 4px;">Kick Kanal Linki:</label>
            <input type="text" id="admKickLink" value="${config.kickLink || ''}" style="width: 100%; padding: 8px; background: #111; border: 1px solid #333; color: #fff; border-radius: 6px; box-sizing: border-box;">
          </div>
          <div style="margin-bottom: 10px;">
            <label style="font-size: 0.85rem; color: #aaa; display: block; margin-bottom: 4px;">Kick Açıklaması / Kategoriler:</label>
            <textarea id="admKickDesc" rows="2" style="width: 100%; padding: 8px; background: #111; border: 1px solid #333; color: #fff; border-radius: 6px; resize: vertical; box-sizing: border-box;">${config.kickDesc || ''}</textarea>
          </div>
          <div style="margin-bottom: 10px;">
            <label style="font-size: 0.85rem; color: #aaa; display: block; margin-bottom: 4px;">TikTok Linki:</label>
            <input type="text" id="admTiktokLink" value="${config.tiktokLink || ''}" style="width: 100%; padding: 8px; background: #111; border: 1px solid #333; color: #fff; border-radius: 6px; box-sizing: border-box;">
          </div>
        </div>

      </div>

      <!-- YouTube Video Listesi Yönetimi -->
      <div style="background: #1b1b1b; padding: 15px; border-radius: 12px; border: 1px solid #2a2a2a; margin-bottom: 25px;">
        <h4 style="color: #ef4444; margin-bottom: 12px;">🎬 YouTube Videoları Ekle / Yönet</h4>
        <div style="display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap;">
          <input type="text" id="admNewYtTitle" placeholder="Video Başlığı (Örn: Minecraft #1)" style="flex: 2; min-width: 180px; padding: 8px; background: #111; border: 1px solid #333; color: #fff; border-radius: 6px; box-sizing: border-box;">
          <input type="text" id="admNewYtUrl" placeholder="Video Linki (https://youtube.com/...)" style="flex: 3; min-width: 200px; padding: 8px; background: #111; border: 1px solid #333; color: #fff; border-radius: 6px; box-sizing: border-box;">
          <button onclick="window.addAdminYtVideo()" style="background: #ef4444; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold;">Ekle</button>
        </div>
        <div id="admYtVideoListContainer" style="max-height: 150px; overflow-y: auto; background: #111; padding: 10px; border-radius: 8px;">
          <!-- Dinamik Liste -->
        </div>
      </div>

      <button onclick="window.saveIceriklerChanges()" style="background: #9146ff; color: #fff; border: none; padding: 14px; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 1.05rem; width: 100%;">Değişiklikleri Kaydet ve Yayınla 🚀</button>
    </div>
  `;

  renderAdminYtListInPanel();
}

function renderAdminYtListInPanel() {
  const container = document.getElementById("admYtVideoListContainer");
  if (!container) return;

  if (adminYoutubeVideosCache.length === 0) {
    container.innerHTML = `<p style="color: #777; font-size: 0.85rem; margin: 0; text-align: center;">Henüz video eklenmedi.</p>`;
    return;
  }

  let html = "";
  adminYoutubeVideosCache.forEach((vid, index) => {
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; background: #181818; padding: 6px 10px; border-radius: 6px; margin-bottom: 6px;">
        <span style="color: #fff; font-size: 0.85rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; margin-right: 10px;">▶ ${vid.title}</span>
        <button onclick="window.removeAdminYtVideo(${index})" style="background: #ef4444; color: #fff; border: none; padding: 3px 8px; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">Sil</button>
      </div>
    `;
  });
  container.innerHTML = html;
}

window.addAdminYtVideo = function() {
  const titleInput = document.getElementById("admNewYtTitle");
  const urlInput = document.getElementById("admNewYtUrl");
  const title = titleInput.value.trim();
  const url = urlInput.value.trim();

  if (!title || !url) {
    showToast("Video başlığı ve linki boş olamaz kanka!", "error");
    return;
  }

  adminYoutubeVideosCache.push({ title, url });
  titleInput.value = "";
  urlInput.value = "";
  renderAdminYtListInPanel();
};

window.removeAdminYtVideo = function(index) {
  adminYoutubeVideosCache.splice(index, 1);
  renderAdminYtListInPanel();
};

window.saveIceriklerChanges = async function() {
  try {
    const isLive = document.getElementById("admIsLive").checked;
    const liveGame = document.getElementById("admLiveGame").value.trim();
    const liveViewers = document.getElementById("admLiveViewers").value.trim();
    const kickLink = document.getElementById("admKickLink").value.trim();
    const kickDesc = document.getElementById("admKickDesc").value.trim();
    const tiktokLink = document.getElementById("admTiktokLink").value.trim();

    await setDoc(doc(db, "siteSettings", "iceriklerConfig"), {
      isLive,
      liveGame,
      liveViewers,
      kickLink,
      kickDesc,
      youtubeVideos: adminYoutubeVideosCache,
      tiktokLink,
      tiktokDesc: "En komik kesitler ve kısa videolar TikTok adresimde!"
    }, { merge: true });

    showToast("İçerikler sayfası başarıyla güncellendi! 🔥");
    document.getElementById("adminIceriklerModal").style.display = 'none';
  } catch (e) {
    showToast("Kaydedilirken hata oluştu!", "error");
  }
};

async function refreshAdminMutedUsers() {
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    adminMutedUsersCache = [];

    usersSnap.forEach((uDoc) => {
      const uData = uDoc.data();
      const uid = uDoc.id;
      if (uData.muteUntil && uData.muteUntil > Date.now()) {
        adminMutedUsersCache.push({
          uid,
          username: uData.username || "Bilinmeyen Kullanıcı",
          muteUntil: uData.muteUntil
        });
      }
    });

    renderAdminMutedSection();
  } catch (e) {}
}

function renderAdminMutedSection() {
  const sectionContainer = document.getElementById("adminMutedSectionContainer");
  if (!sectionContainer) return;

  const activeMutesCount = adminMutedUsersCache.length;
  let mutedUsersHtml = "";

  if (activeMutesCount > 0) {
    adminMutedUsersCache.forEach(user => {
      const remainingMs = user.muteUntil - Date.now();
      const min = Math.max(0, Math.floor(remainingMs / 60000));
      const sec = Math.max(0, Math.floor((remainingMs % 60000) / 1000));
      const timeStr = `${min}:${sec < 10 ? '0' : ''}${sec}`;

      mutedUsersHtml += `
        <div id="admin-mute-row-${user.uid}" style="display: flex; align-items: center; justify-content: space-between; background: #1f1424; padding: 10px 14px; border-radius: 8px; margin-bottom: 6px; border: 1px solid #9146ff55;">
          <div>
            <strong style="color: #c084fc;">${user.username}</strong> 
            <span class="admin-mute-timer" data-uid="${user.uid}" style="color: #aaa; font-size: 0.85rem; margin-left: 10px;">⏳ Kalan: ${timeStr}</span>
          </div>
          <button style="background: #9146ff; color: #fff; border: none; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: bold;" onclick="window.removeMute('${user.uid}', '${user.username}')">Mute Kaldır</button>
        </div>
      `;
    });
  }

  sectionContainer.innerHTML = `
    <div style="background: #151515; border: 1px solid #333; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
      <h4 style="color: #c084fc; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
        🔇 Susturulan Kullanıcılar (<span id="adminMuteCountText">${activeMutesCount}</span>)
      </h4>
      <div id="adminMutedListInner">
        ${activeMutesCount > 0 ? mutedUsersHtml : '<p style="color: #777; font-size: 0.85rem;">Şu an susturulmuş aktif bir kullanıcı yok.</p>'}
      </div>
    </div>
  `;
}

function updateAdminMutedCountdowns() {
  let needsRefresh = false;
  adminMutedUsersCache.forEach(user => {
    const remainingMs = user.muteUntil - Date.now();
    const timerEl = document.querySelector(`.admin-mute-timer[data-uid="${user.uid}"]`);
    if (timerEl) {
      if (remainingMs > 0) {
        const min = Math.floor(remainingMs / 60000);
        const sec = Math.floor((remainingMs % 60000) / 1000);
        timerEl.innerText = `⏳ Kalan: ${min}:${sec < 10 ? '0' : ''}${sec}`;
      } else {
        needsRefresh = true;
      }
    }
  });

  if (needsRefresh) {
    refreshAdminMutedUsers();
  }
}

window.removeMute = async function(uid, username) {
  try {
    await setDoc(doc(db, "users", uid), { muteUntil: null }, { merge: true });
    showToast(`${username} adlı kullanıcının mutesi kaldırıldı! ✨`);
    refreshAdminMutedUsers();
  } catch (e) {
    showToast("Mute kaldırılırken hata oluştu!", "error");
  }
};

window.toggleSelectAll = function(masterCheckbox) {
  const checkboxes = document.querySelectorAll('.msg-checkbox');
  checkboxes.forEach(cb => cb.checked = masterCheckbox.checked);
};

window.deleteSelectedMessages = async function() {
  const selected = document.querySelectorAll('.msg-checkbox:checked');
  if (selected.length === 0) {
    showToast("Hiçbir mesaj seçmedin kanka!", "error");
    return;
  }

  const modal = document.getElementById("customConfirmModal");
  const yesBtn = document.getElementById("confirmYesBtn");
  const noBtn = document.getElementById("confirmNoBtn");

  document.getElementById("confirmText").innerText = `Seçilen ${selected.length} mesajı silmek istediğine emin misin patron?`;
  modal.style.display = "flex";

  yesBtn.onclick = async () => {
    modal.style.display = "none";
    try {
      for (const cb of selected) {
        await deleteDoc(doc(db, "messages", cb.value));
      }
      showToast("Seçilen mesajlar silindi!");
    } catch (e) {
      showToast("Silinirken hata oluştu!", "error");
    }
  };

  noBtn.onclick = () => { modal.style.display = "none"; };
};

window.openUserModeration = function(uid, username) {
  if (!uid) {
    showToast("Bu mesajın kullanıcısı bulunamadı.", "error");
    return;
  }

  let modModal = document.getElementById("customUserModModal");
  if (!modModal) {
    modModal = document.createElement("div");
    modModal.id = "customUserModModal";
    modModal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 999999;
    `;
    document.body.appendChild(modModal);
  }

  modModal.innerHTML = `
    <div style="background: #181818; border: 1px solid #9146ff; padding: 25px; border-radius: 16px; width: 350px; box-shadow: 0 0 30px rgba(145,70,255,0.4); color: #fff; text-align: center;">
      <h3 style="color: #9146ff; margin-bottom: 10px;">${username}</h3>
      <p style="font-size: 0.9rem; color: #aaa; margin-bottom: 20px;">Kullanıcı için yapılacak işlemi seç:</p>
      
      <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
        <button id="modDeleteAll" style="background: #ef4444; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: bold;">Tüm Mesajlarını Sil</button>
        <button id="modMuteUser" style="background: #9146ff; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: bold;">Kullanıcıyı Sustur (Mute)</button>
      </div>
      
      <button id="modClose" style="background: #333; color: #fff; border: none; padding: 8px 20px; border-radius: 8px; cursor: pointer;">İptal</button>
    </div>
  `;
  modModal.style.display = "flex";

  document.getElementById("modClose").onclick = () => { modModal.style.display = "none"; };

  document.getElementById("modDeleteAll").onclick = async () => {
    modModal.style.display = "none";
    try {
      const snap = await getDocs(collection(db, "messages"));
      let count = 0;
      for (const docSnap of snap.docs) {
        if (docSnap.data().uid === uid) {
          await deleteDoc(doc(db, "messages", docSnap.id));
          count++;
        }
      }
      showToast(`${username} kullanıcısının ${count} mesajı silindi!`);
    } catch (e) {
      showToast("Hata oluştu!", "error");
    }
  };

  document.getElementById("modMuteUser").onclick = () => {
    modModal.style.display = "none";
    
    let muteModal = document.getElementById("customMuteModal");
    if (!muteModal) {
      muteModal = document.createElement("div");
      muteModal.id = "customMuteModal";
      muteModal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 999999;
      `;
      document.body.appendChild(muteModal);
    }

    muteModal.innerHTML = `
      <div style="background: #181818; border: 1px solid #9146ff; padding: 25px; border-radius: 16px; width: 320px; box-shadow: 0 0 30px rgba(145,70,255,0.4); color: #fff; text-align: center;">
        <h3 style="color: #9146ff; margin-bottom: 10px;">Susturma Süresi</h3>
        <p style="font-size: 0.85rem; color: #aaa; margin-bottom: 15px;">${username} kaç dakika susturulsun?</p>
        <input type="number" id="muteMinutesInput" value="5" min="1" style="width: 100%; padding: 10px; background: #111; border: 1px solid #333; color: #fff; border-radius: 8px; text-align: center; font-size: 1rem; margin-bottom: 15px;">
        <div style="display: flex; gap: 10px; justify-content: center;">
          <button id="muteConfirmBtn" style="background: #9146ff; color: #fff; border: none; padding: 8px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">Sustur</button>
          <button id="muteCancelBtn" style="background: #333; color: #fff; border: none; padding: 8px 20px; border-radius: 8px; cursor: pointer;">İptal</button>
        </div>
      </div>
    `;
    muteModal.style.display = "flex";

    document.getElementById("muteCancelBtn").onclick = () => { muteModal.style.display = "none"; };

    document.getElementById("muteConfirmBtn").onclick = async () => {
      const minutes = parseInt(document.getElementById("muteMinutesInput").value);
      muteModal.style.display = "none";

      if (isNaN(minutes) || minutes <= 0) {
        showToast("Geçerli bir süre gir!", "error");
        return;
      }

      const muteUntil = Date.now() + (minutes * 60 * 1000);
      try {
        await setDoc(doc(db, "users", uid), { muteUntil: muteUntil, username: username }, { merge: true });
        showToast(`${username} ${minutes} dakika süreyle susturuldu! 🔇`);
        refreshAdminMutedUsers();
      } catch (e) {
        showToast("Mute atılırken hata oluştu!", "error");
      }
    };
  };
};

window.prepareEdit = function(id, title, desc) {
  document.getElementById("editingId").value = id;
  document.getElementById("announceTitle").value = title;
  document.getElementById("announceDesc").value = desc;
  document.getElementById("sendAnnounceBtn").innerText = "Güncellemeyi Kaydet";
  if(cancelEditBtn) cancelEditBtn.style.display = "inline-block";
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

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
    } catch (e) { showToast("Silinirken hata oluştu!", "error"); }
  };
  noBtn.onclick = () => { modal.style.display = "none"; };
};

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
    } catch (e) { showToast("Mesaj silinirken hata oluştu!", "error"); }
  };
  noBtn.onclick = () => { modal.style.display = "none"; };
};

async function loadStats() {
  try {
    const snap = await getDocs(collection(db, "duyurular"));
    document.getElementById("totalAnnouncements").innerText = snap.size;
  } catch (e) {}
}
