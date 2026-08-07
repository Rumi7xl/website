import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCiuXtHu3J9Va46a4KiETO2JrSn5um2KoQ",
  authDomain: "rumi7xl-web.firebaseapp.com",
  projectId: "rumi7xl-web",
  storageBucket: "rumi7xl-web.firebasestorage.app",
  messagingSenderId: "1077565304835",
  appId: "1:1077565304835:web:a672a4440797b76f42de36"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadAnnouncements() {
  const container = document.getElementById("announcementList");
  if (!container) return;

  container.innerHTML = "<p style='color:#aaa; text-align:center;'>Duyurular yükleniyor...</p>";

  try {
    const q = query(collection(db, "duyurular"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);

    container.innerHTML = "";

    if (querySnapshot.empty) {
      container.innerHTML = "<p style='color:#aaa; text-align:center; font-size:18px;'>Şu an için yeni bir duyuru bulunmuyor.</p>";
      return;
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
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

loadAnnouncements();
