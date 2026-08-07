import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ⚠️ BURAYA KENDİ FIREBASE AYARLARINI YAPIŞTIR (auth.js dosyanın en üstündeki ayarların aynısı)
const firebaseConfig = {
  apiKey: "SENIN_API_KEY",
  authDomain: "SENIN_PROJEN.firebaseapp.com",
  projectId: "SENIN_PROJEN",
  storageBucket: "SENIN_PROJEN.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcde"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 👑 GÜVENLİK KİLİDİ: BURAYA KENDİ YÖNETİCİ E-POSTANI YAZ
const ADMIN_EMAIL = "rumi7xl@gmail.com";

// 1. YETKİ KONTROLÜ (Giren kişi patron mu?)
onAuthStateChanged(auth, (user) => {
  if (!user || user.email !== ADMIN_EMAIL) {
    // Admin değilse veya giriş yapmamışsa anında ana sayfaya postala!
    alert("Yetkisiz giriş! Bu alana sadece RUMİ7XL yöneticisi girebilir.");
    window.location.href = "index.html"; 
  } else {
    // Eğer giren sensen panele izin ver ve verileri yükle
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
      // Firebase "duyurular" koleksiyonuna ekleme yapıyor
      await addDoc(collection(db, "duyurular"), {
        title: title,
        description: desc,
        date: serverTimestamp()
      });
      alert("Duyuru başarıyla yayınlandı! Sitede anında görünecek.");
      // Kutuları temizle
      document.getElementById("announceTitle").value = "";
      document.getElementById("announceDesc").value = "";
      loadStats(); // Duyuru sayacını güncelle
    } catch (error) {
      console.error("Duyuru eklenirken hata: ", error);
      alert("Bir hata oluştu, konsolu kontrol et.");
    }
  });
}

// 3. İSTATİSTİKLERİ ÇEKME
async function loadStats() {
  try {
    // Toplam duyuru sayısını veritabanından sayıyoruz
    const duyuruSnap = await getDocs(collection(db, "duyurular"));
    document.getElementById("totalAnnouncements").innerText = duyuruSnap.size;
    
    // Aktif patron (Sen)
    document.getElementById("activeUsers").innerText = "1 (Aktif)";
  } catch (error) {
    console.error("İstatistikler yüklenemedi", error);
  }
}
