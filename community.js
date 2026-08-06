import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  getDoc,
  doc 
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

const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendChatBtn");
const chatMessages = document.getElementById("chatMessages");

let currentUserObj = null;

onAuthStateChanged(auth, (user) => {
  currentUserObj = user;
});

// MESAJ GÖNDERME
async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  if (!currentUserObj) {
    alert("Sohbete katılmak için önce giriş yapmalısın kanka!");
    if (window.openAccountModal) window.openAccountModal('login');
    return;
  }

  chatInput.value = "";

  try {
    let photo = "https://ui-avatars.com/api/?name=" + encodeURIComponent(currentUserObj.displayName || "User") + "&background=9146ff&color=fff";
    try {
      const uDoc = await getDoc(doc(db, "users", currentUserObj.uid));
      if (uDoc.exists() && uDoc.data().photoURL) {
        photo = uDoc.data().photoURL;
      }
    } catch(e) {}

    await addDoc(collection(db, "messages"), {
      uid: currentUserObj.uid,
      username: currentUserObj.displayName || currentUserObj.email.split("@")[0],
      photoURL: photo,
      text: text,
      createdAt: Date.now()
    });

  } catch (e) {
    alert("Mesaj gönderilemedi: " + e.message);
  }
}

if (sendBtn) sendBtn.onclick = sendMessage;
if (chatInput) {
  chatInput.onkeypress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };
}

// CANLI MESAJLARI DİNLEME (SAĞ / SOL MANTIĞI)
const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));

onSnapshot(q, (snapshot) => {
  if (!chatMessages) return;
  chatMessages.innerHTML = "";

  if (snapshot.empty) {
    chatMessages.innerHTML = `<p style="color:#aaa; text-align:center;">Sohbet odası henüz boş. İlk mesajı sen at! 👋</p>`;
    return;
  }

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const timeStr = getTimeStr(data.createdAt);
    
    // Mesaj benim mi başkasının mı?
    const isMyMsg = currentUserObj && currentUserObj.uid === data.uid;

    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-msg ${isMyMsg ? 'my-msg' : 'other-msg'}`;

    msgDiv.innerHTML = `
      <img src="${data.photoURL}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(data.username)}&background=9146ff&color=fff'">
      <div class="msg-bubble">
        <div class="msg-header">
          <span class="msg-username">${data.username}</span>
          <span class="msg-time">${timeStr}</span>
        </div>
        <div>${escapeHtml(data.text)}</div>
      </div>
    `;

    chatMessages.appendChild(msgDiv);
  });

  // Otomatik en aşağı kaydır
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

function getTimeStr(timestamp) {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
