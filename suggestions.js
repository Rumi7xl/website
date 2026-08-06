import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  increment,
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

const suggestInput = document.getElementById("suggestInput");
const sendBtn = document.getElementById("sendSuggestBtn");
const suggestionsList = document.getElementById("suggestionsList");

// 1. ÖNERİ GÖNDERME İŞLEMİ
sendBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  const text = suggestInput.value.trim();

  if (!user) {
    alert("Öneri paylaşabilmek için lütfen giriş yap kanka!");
    if (window.openAccountModal) window.openAccountModal('login');
    return;
  }

  if (!text) {
    alert("Lütfen boş öneri gönderme!");
    return;
  }

  sendBtn.disabled = true;
  sendBtn.innerText = "Gönderiliyor...";

  try {
    // Kullanıcının güncel Firestore verisini al (Profil fotosu için)
    let photo = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.displayName || "User") + "&background=9146ff&color=fff";
    try {
      const uDoc = await getDoc(doc(db, "users", user.uid));
      if (uDoc.exists() && uDoc.data().photoURL) {
        photo = uDoc.data().photoURL;
      }
    } catch(e){}

    await addDoc(collection(db, "suggestions"), {
      uid: user.uid,
      username: user.displayName || user.email.split("@")[0],
      photoURL: photo,
      text: text,
      likes: 0,
      createdAt: Date.now()
    });

    suggestInput.value = "";
  } catch (err) {
    alert("Hata oluştu: " + err.message);
  } finally {
    sendBtn.disabled = false;
    sendBtn.innerText = "Gönder";
  }
});

// 2. CANLI ÖNERİLERİ LİSTELEME (REALTIME)
const q = query(collection(db, "suggestions"), orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
  suggestionsList.innerHTML = "";

  if (snapshot.empty) {
    suggestionsList.innerHTML = `<p style="color:#aaa; text-align:center;">Henüz hiç öneri yapılmamış. İlk öneriyi sen yap! 🔥</p>`;
    return;
  }

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const id = docSnap.id;
    
    // Tarih Hesaplama
    const timeAgo = getTimeAgo(data.createdAt);

    const card = document.createElement("div");
    card.className = "suggest-card";
    card.style.cssText = "background: #111; border: 1px solid #222; border-radius: 18px; padding: 20px; display: flex; gap: 15px; align-items: flex-start;";

    card.innerHTML = `
      <img src="${data.photoURL}" style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid #9146ff; object-fit: cover;" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(data.username)}&background=9146ff&color=fff'">
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
          <span style="font-weight: bold; color: white; font-size: 15px;">${data.username}</span>
          <span style="color: #666; font-size: 12px;">${timeAgo}</span>
        </div>
        <p style="color: #ddd; font-size: 15px; line-height: 1.5; margin-bottom: 12px; word-break: break-word;">
          ${escapeHtml(data.text)}
        </p>
        <div style="display: flex; gap: 20px; color: #aaa; font-size: 13px;">
          <button class="like-btn" data-id="${id}" style="background: none; border: none; color: #aaa; cursor: pointer; display: flex; align-items: center; gap: 5px; font-weight: bold; transition: 0.2s;">
            👍 <span>${data.likes || 0}</span>
          </button>
        </div>
      </div>
    `;

    suggestionsList.appendChild(card);
  });

  // BEĞENİ BUTONLARI DİNLEYİCİSİ
  document.querySelectorAll(".like-btn").forEach(btn => {
    btn.onclick = async () => {
      const suggestId = btn.getAttribute("data-id");
      const ref = doc(db, "suggestions", suggestId);
      try {
        await updateDoc(ref, { likes: increment(1) });
      } catch (e) {
        console.error("Beğenilemedi:", e);
      }
    };
  });
});

// ZAMAN FORMATI FONKSİYONU
function getTimeAgo(timestamp) {
  if (!timestamp) return "Az önce";
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return "Az önce";
  if (diff < 3600) return Math.floor(diff / 60) + " dakika önce";
  if (diff < 86400) return Math.floor(diff / 3600) + " saat önce";
  return Math.floor(diff / 86400) + " gün önce";
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
