import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc,
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

let currentUserObj = null;
let targetEditId = null;
let targetDeleteId = null;

// YouTube SVG Like İkonu
const LIKE_SVG = `<svg viewBox="0 0 24 24"><path d="M18.77,11h-4.23l1.52-4.94C16.38,5.03,15.54,4,14.38,4c-0.58,0-1.14,0.24-1.52,0.65L7,11H3v10h4h11c1.24,0,2.28-0.84,2.52-2.02l1.37-6.83C22.21,10.59,20.73,11,18.77,11z M7,20H4v-8h3V20z M20.91,12.01l-1.37,6.83C19.42,19.41,18.8,20,18,20H8v-8.41l5.56-5.93C13.75,5.45,14.06,5.33,14.38,5.33c0.39,0,0.73,0.28,0.82,0.67l-1.74,5.66L13.04,13h1.72h4.01c0.75,0,1.4,0.44,1.67,1.08C20.62,14.52,20.91,12.01,20.91,12.01z"/></svg>`;

onAuthStateChanged(auth, (user) => {
  currentUserObj = user;
});

// 1. ÖNERİ GÖNDERME
if (sendBtn) {
  sendBtn.addEventListener("click", async () => {
    const text = suggestInput ? suggestInput.value.trim() : "";

    if (!currentUserObj) {
      alert("Öneri paylaşabilmek için lütfen önce giriş yap kanka!");
      if (window.openAccountModal) window.openAccountModal('login');
      return;
    }

    if (!text) return;

    sendBtn.disabled = true;
    sendBtn.innerText = "Gönderiliyor...";

    try {
      let photo = "https://ui-avatars.com/api/?name=" + encodeURIComponent(currentUserObj.displayName || "User") + "&background=9146ff&color=fff";
      
      try {
        const uDoc = await getDoc(doc(db, "users", currentUserObj.uid));
        if (uDoc.exists() && uDoc.data().photoURL) {
          photo = uDoc.data().photoURL;
        }
      } catch(e) {}

      await addDoc(collection(db, "suggestions"), {
        uid: currentUserObj.uid,
        username: currentUserObj.displayName || currentUserObj.email.split("@")[0],
        photoURL: photo,
        text: text,
        likedBy: [],
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
}

// 2. CANLI ÖNERİLERİ LİSTELEME
try {
  const q = query(collection(db, "suggestions"), orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    if (!suggestionsList) return;
    suggestionsList.innerHTML = "";

    if (snapshot.empty) {
      suggestionsList.innerHTML = `<p style="color:#aaa; text-align:center;">Henüz hiç öneri yapılmamış. İlk öneriyi sen yap! 🔥</p>`;
      return;
    }

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;
      const timeAgo = getTimeAgo(data.createdAt);

      const likedByArr = data.likedBy || [];
      const isLiked = currentUserObj ? likedByArr.includes(currentUserObj.uid) : false;
      const isOwner = currentUserObj && currentUserObj.uid === data.uid;

      const card = document.createElement("div");
      card.className = "suggest-card";

      card.innerHTML = `
        <img src="${data.photoURL}" style="width: 42px; height: 42px; border-radius: 50%; border: 2px solid #9146ff; object-fit: cover;" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(data.username)}&background=9146ff&color=fff'">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: bold; color: white; font-size: 14px;">${data.username}</span>
              <span style="color: #666; font-size: 12px;">${timeAgo}</span>
            </div>
            
            ${isOwner ? `
              <div style="position: relative;">
                <button class="options-btn" data-id="${id}">⋮</button>
                <div class="options-dropdown" id="dropdown-${id}">
                  <button class="edit-item" data-id="${id}" data-text="${escapeHtml(data.text)}">✏️ Düzenle</button>
                  <button class="del-item" data-id="${id}">🗑️ Sil</button>
                </div>
              </div>
            ` : ''}
          </div>

          <p style="color: #ddd; font-size: 15px; line-height: 1.5; margin-bottom: 12px; word-break: break-word;">
            ${escapeHtml(data.text)}
          </p>

          <div style="display: flex; gap: 15px; align-items: center;">
            <button class="yt-like-btn ${isLiked ? 'liked' : ''}" data-id="${id}">
              ${LIKE_SVG}
              <span>${likedByArr.length > 0 ? likedByArr.length : ''}</span>
            </button>
          </div>
        </div>
      `;

      suggestionsList.appendChild(card);
    });

    // LIKE BUTONLARI
    document.querySelectorAll(".yt-like-btn").forEach(btn => {
      btn.onclick = async () => {
        if (!currentUserObj) {
          alert("Beğenmek için giriş yapmalısın kanka!");
          return;
        }

        const suggestId = btn.getAttribute("data-id");
        const ref = doc(db, "suggestions", suggestId);

        try {
          const docSnap = await getDoc(ref);
          if (docSnap.exists()) {
            let likedBy = docSnap.data().likedBy || [];
            const uid = currentUserObj.uid;

            if (likedBy.includes(uid)) {
              likedBy = likedBy.filter(i => i !== uid);
            } else {
              likedBy.push(uid);
            }

            await updateDoc(ref, { likedBy: likedBy });
          }
        } catch (e) {
          console.error("Like hatası:", e);
        }
      };
    });

    // 3 NOKTA MENÜ
    document.querySelectorAll(".options-btn").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        const drop = document.getElementById(`dropdown-${id}`);
        document.querySelectorAll(".options-dropdown").forEach(d => {
          if (d !== drop) d.style.display = "none";
        });
        drop.style.display = drop.style.display === "flex" ? "none" : "flex";
      };
    });

    // MODAL İLE DÜZENLEME AÇMA
    document.querySelectorAll(".edit-item").forEach(btn => {
      btn.onclick = () => {
        targetEditId = btn.getAttribute("data-id");
        const text = btn.getAttribute("data-text");
        document.getElementById("editModalInput").value = text;
        document.getElementById("editModal").style.display = "flex";
      };
    });

    // MODAL İLE SİLME AÇMA
    document.querySelectorAll(".del-item").forEach(btn => {
      btn.onclick = () => {
        targetDeleteId = btn.getAttribute("data-id");
        document.getElementById("deleteModal").style.display = "flex";
      };
    });

  });
} catch(e) {
  console.error(e);
}

// DIŞARI TIKLANINCA MENÜLERİ KAPAT
document.addEventListener("click", () => {
  document.querySelectorAll(".options-dropdown").forEach(d => d.style.display = "none");
});

// DÜZENLEME KAYDETME
document.getElementById("saveEditBtn").onclick = async () => {
  const newText = document.getElementById("editModalInput").value.trim();
  if (targetEditId && newText) {
    try {
      await updateDoc(doc(db, "suggestions", targetEditId), { text: newText });
      document.getElementById("editModal").style.display = "none";
    } catch (e) {
      alert("Hata: " + e.message);
    }
  }
};

// SİLME ONAYLAMA
document.getElementById("confirmDeleteBtn").onclick = async () => {
  if (targetDeleteId) {
    try {
      await deleteDoc(doc(db, "suggestions", targetDeleteId));
      document.getElementById("deleteModal").style.display = "none";
    } catch (e) {
      alert("Hata: " + e.message);
    }
  }
};

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
