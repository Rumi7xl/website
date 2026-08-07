import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ⚠️ BURAYA KENDİ FIREBASE AYARLARINI YAPIŞTIR
const firebaseConfig = {
  apiKey: "SENIN_API_KEY",
  authDomain: "SENIN_PROJEN.firebaseapp.com",
  projectId: "SENIN_PROJEN",
  storageBucket: "SENIN_PROJEN.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcde"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadAnnouncements() {
  const container = document.getElementById("announcementList");
  if (!container) return;

  container.innerHTML = "<p style='color:#aaa; text-align:center;'>Duyurular yükleniyor...</p>";

  try {
    // Veritabanından duyuruları en yeniden en eskiye doğru (desc) çekiyoruz
    const q = query(collection(db, "duyurular"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);

    container.innerHTML = ""; // Yükleniyor yazısını sil

    if (querySnapshot.empty) {
      container.innerHTML = "<p style='color:#aaa; text-align:center; font-size:18px;'>Şu an için yeni bir duyuru bulunmuyor.</p>";
      return;
    }

    // Gelen her duyuru için HTML kartı oluştur
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Tarihi düzgün bir saate çevir
      let dateStr = "Tarih Yok";
      if (data.date) {
        const dateObj = data.date.toDate();
        dateStr = dateObj.toLocaleDateString("tr-TR") + " - " + dateObj.toLocaleTimeString("tr-TR", {hour: '2-digit', minute:'2-digit'});
      }

      const cardHtml = `
        <div class="suggest-card" style="background: linear-gradient(145deg, #151515, #090909); border: 1px solid #222; border-left: 4px solid #9146ff; margin-bottom: 20px; padding: 20px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.5);">
          <h2 style="color: #9146ff; font-size: 24px; margin-bottom: 10px;">${data.title}</h2>
          <p style="color: #ddd; font-size: 16px; line-height: 1.5;">${data.description}</p>
          <span style="color: #aaa; font-size: 13px; display: block; margin-top: 15px;">📅 ${dateStr}</span>
        </div>
      `;
      container.innerHTML += cardHtml;
    });

  } catch (error) {
    console.error("Duyurular çekilirken hata oluştu: ", error);
    container.innerHTML = "<p style='color:#ef4444; text-align:center;'>Duyurular yüklenirken bir hata oluştu.</p>";
  }
}

// Sayfa açıldığında duyuruları yükle
loadAnnouncements();
