import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

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

// 👑 YÖNETİCİ KİLİDİ
const ADMIN_EMAIL = "rumi7xl@gmail.com";

// 1. YETKİ KONTROLÜ
onAuthStateChanged(auth, (user) => {
  if (!user || user.email !== ADMIN_EMAIL) {
    alert("Yetkisiz giriş! Bu alana sadece RUMİ7XL yöneticisi girebilir.");
    window.location.href = "index.html"; 
  } else {
    console.log("Admin yetkisi onaylandı. Hoş geldin patron:", user.email);
    loadStats();
  }
});

// 2. YENİ DUYURU PAYLAŞMA
const sendAnnounceBtn = document.getElementById("sendAnnounceBtn");
if (sendAnnounceBtn) {
  sendAnnounceBtn.addEventListener("click", async () => {
    const title = document.getElementById("announceTitle").value;
    const desc = document.getElementById("announceDesc").value;

    if (!title || !desc) {
      alert("Lütfen duyuru başlığını ve içeriğini boş bırakma!");
      return;
    }

    try {
      await addDoc(collection(db, "duyurular"), {
        title: title,
        description: desc,
        date: serverTimestamp()
      });
      alert("Duyuru başarıyla yayınlandı! Sitede anında görünecek.");
      document.getElementById("announceTitle").value = "";
      document.getElementById("announceDesc").value = "";
      loadStats();
    } catch (error) {
      console.error("Duyuru eklenirken hata: ", error);
      alert("Bir hata oluştu, konsolu kontrol et.");
    }
  });
}

// 3. İSTATİSTİKLERİ ÇEKME
async function loadStats() {
  try {
    const duyuruSnap = await getDocs(collection(db, "duyurular"));
    document.getElementById("totalAnnouncements").innerText = duyuruSnap.size;
    document.getElementById("activeUsers").innerText = "1 (Aktif)";
  } catch (error) {
    console.error("İstatistikler yüklenemedi", error);
  }
}
