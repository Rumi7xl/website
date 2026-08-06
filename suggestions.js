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

// Oturum durumunu takip et
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

    if (!text) {
      alert("Lütfen bir şeyler yaz kanka, boş öneri gönderilemez!");
      return;
    }

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
        likedBy: [], // Beğenen kullanıcıların UID'leri
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
      card.style.cssText = "background: #111; border: 1px solid #222; border-radius: 18px; padding: 20px; display: flex; gap: 15px; align-items: flex-start; position: relative;";

      card.innerHTML = `
        <img src="${data.photoURL}" style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid #9146ff; object-fit: cover;" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(data.username)}&background=9146ff&color=fff'">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-weight: bold; color: white; font-size: 15px;">${data.username}</span>
              <span style="color: #666; font-size: 12px;">${timeAgo}</span>
            </div>
            
            ${isOwner ? `
              <div style="display: flex; gap: 8px;">
                <button class="edit-btn" data-id="${id}" data-text="${escapeHtml(data.text)}" style="background: none; border: none; color: #aaa; cursor: pointer; font-size: 14px; transition: 0.2s;" title="Düzenle">✏️</button>
                <button class="delete-btn" data-id="${id}" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 14px; transition: 0.2s;" title="Sil">🗑️</button>
              </div>
            ` : ''}
          </div>

          <p id="text-${id}" style="color: #ddd; font-size: 15px; line-height: 1.5; margin-bottom: 12px; word-break: break-word;">
            ${escapeHtml(data.text)}
          </p>

          <div style="display: flex; gap: 20px; color: #aaa; font-size: 13px;">
            <button class="like-btn" data-id="${id}" style="background: none; border: none; color: ${isLiked ? '#9146ff' : '#aaa'}; cursor: pointer; display: flex; align-items: center; gap: 5px; font-weight: bold; transition: 0.2s;">
              ${isLiked ? '👍' : '👍🏻'} <span>${likedByArr.length}</span>
            </button>
          </div>
        </div>
      `;

      suggestionsList.appendChild(card);
    });

    // 3. BEĞENİ BUTONLARI (TEKİL BEĞENİ / TOGGLE)
    document.querySelectorAll(".like-btn").forEach(btn => {
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
              // Beğeniyi Kaldır
              likedBy = likedBy.filter(id => id !== uid);
            } else {
              // Beğen
              likedBy.push(uid);
            }

            await updateDoc(ref, { likedBy: likedBy });
          }
        } catch (e) {
          console.error("Beğeni hatası:", e);
        }
      };
    });

    // 4. SİLME İŞLEMİ
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.onclick = async () => {
        const suggestId = btn.getAttribute("data-id");
        if (confirm("Bu öneriyi silmek istediğine emin misin kanka?")) {
          try {
            await deleteDoc(doc(db, "suggestions", suggestId));
          } catch (e) {
            alert("Silinemedi: " + e.message);
          }
        }
      };
    });

    // 5. DÜZENLEME İŞLEMİ
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.onclick = async () => {
        const suggestId = btn.getAttribute("data-id");
        const currentText = btn.getAttribute("data-text");

        const newText = prompt("Önerini düzenle kanka:", currentText);
        if (newText !== null && newText.trim() !== "") {
          try {
            await updateDoc(doc(db, "suggestions", suggestId), {
              text: newText.trim()
            });
          } catch (e) {
            alert("Güncellenemedi: " + e.message);
          }
        }
      };
    });

  });
} catch(e) {
  console.error(e);
}

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
