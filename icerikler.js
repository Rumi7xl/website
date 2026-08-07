import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

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

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const docRef = doc(db, "siteSettings", "iceriklerConfig");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // 1. Canlı Durum Küpü
      const liveCard = document.querySelector(".live-card");
      if (liveCard) {
        const isLive = data.isLive || false;
        liveCard.innerHTML = `
          <div class="platform-logo kick">
            <span style="font-size: 35px;">${isLive ? '🟢' : '🔴'}</span>
          </div>
          <h2>CANLI DURUM</h2>
          <p style="line-height: 1.6;">
            ${isLive ? 'RUMI7XL şu anda yayında!' : 'RUMI7XL şu anda yayında değil.'}<br>
            <b>Oyun:</b> ${data.liveGame || 'Belirtilmedi'}<br>
            <b>İzleyici:</b> ${data.liveViewers || '0'}
          </p>
          <a href="${data.kickLink || 'https://kick.com/rumi7xl'}" target="_blank">KICK'E GİT →</a>
        `;
      }

      // 2. Kick Yayınları Küpü
      const kickCard = document.querySelectorAll(".box")[1];
      if (kickCard) {
        kickCard.innerHTML = `
          <div class="platform-logo kick" style="display:flex; align-items:center; justify-content:center;">
            <img src="kick-logo.png" alt="Kick" style="width: 40px; height: 40px; object-fit: contain;">
          </div>
          <h2>KICK YAYINLARI</h2>
          <p style="line-height: 1.6;">${data.kickDesc || '• Minecraft<br>• Valorant<br>• GTA V<br>• Simülasyon Oyunları'}</p>
          <a href="${data.kickLink || 'https://kick.com/rumi7xl'}" target="_blank">KANALA GİT →</a>
        `;
      }

      // 3. YouTube Küpü (Dinamik Liste)
      const youtubeCard = document.querySelectorAll(".box")[2];
      if (youtubeCard) {
        let ytLinksHtml = "";
        if (data.youtubeVideos && data.youtubeVideos.length > 0) {
          data.youtubeVideos.forEach(vid => {
            ytLinksHtml += `<a href="${vid.url}" target="_blank" style="display:block; color:#ccc; text-decoration:none; margin-bottom:6px; font-size:14px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">▶ ${vid.title}</a>`;
          });
        } else {
          ytLinksHtml = `<p style="color:#777; font-size:14px;">Henüz video eklenmedi.</p>`;
        }

        youtubeCard.innerHTML = `
          <div class="platform-logo youtube" style="display:flex; align-items:center; justify-content:center;">
            <img src="youtube-logo.png" alt="YouTube" style="width: 40px; height: 40px; object-fit: contain;">
          </div>
          <h2>YOUTUBE</h2>
          <div style="margin: 15px 0; max-height: 140px; overflow-y: auto; text-align: left; padding-right: 5px;">
            ${ytLinksHtml}
          </div>
          <a href="${data.youtubeChannelLink || 'https://youtube.com'}" target="_blank" style="margin-top:auto;">KANALA GİT →</a>
        `;
      }

      // 4. TikTok Küpü (Eğer eklemek istersen 4. kutu olarak sayfaya otomatik ekler veya günceller)
      let tiktokCard = document.querySelector(".tiktok-card");
      if (!tiktokCard && document.querySelector(".platforms")) {
        tiktokCard = document.createElement("div");
        tiktokCard.className = "box tiktok-card";
        document.querySelector(".platforms").appendChild(tiktokCard);
      }
      if (tiktokCard) {
        tiktokCard.innerHTML = `
          <div class="platform-logo tiktok" style="display:flex; align-items:center; justify-content:center;">
            <img src="tiktok-logo.png" alt="TikTok" style="width: 40px; height: 40px; object-fit: contain;">
          </div>
          <h2>TİKTOK</h2>
          <p style="line-height: 1.6;">${data.tiktokDesc || 'En komik kesitler ve kısa videolar TikTok adresimde!'}</p>
          <a href="${data.tiktokLink || 'https://tiktok.com'}" target="_blank">TIKTOK'A GİT →</a>
        `;
      }

    }
  } catch (e) {
    console.error("İçerikler yüklenirken hata:", e);
  }
});
