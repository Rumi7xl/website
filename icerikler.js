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

      // 1. Canlı Durum Kartı
      const liveCard = document.querySelector(".live-card");
      if (liveCard) {
        const isLive = data.isLive || false;
        const bodyEl = liveCard.querySelector(".card-body-content");
        const linkEl = liveCard.querySelector("a");
        
        bodyEl.innerHTML = `
          <p style="margin: 0 0 8px 0; font-weight: bold; color: ${isLive ? '#22c55e' : '#ef4444'}; font-size: 15px;">
            ${isLive ? '🟢 YAYINDA!' : '🔴 YAYINDA DEĞİL'}
          </p>
          <p style="margin: 0 0 5px 0; color: #bbb;">🎮 <b>Oyun:</b> ${data.liveGame || 'Belirtilmedi'}</p>
          <p style="margin: 0; color: #bbb;">👥 <b>İzleyici:</b> ${data.liveViewers || '0'}</p>
        `;
        linkEl.href = data.kickLink || 'https://kick.com/rumi7xl';
      }

      // 2. Kick Kanalı Kartı
      const kickCard = document.querySelector(".kick-card");
      if (kickCard) {
        const bodyEl = kickCard.querySelector(".card-body-content");
        const linkEl = kickCard.querySelector("a");

        bodyEl.innerHTML = `
          <p style="margin: 0; color: #ccc; white-space: pre-line; line-height: 1.5;">${data.kickDesc || '• Minecraft\n• Valorant\n• GTA V'}</p>
        `;
        linkEl.href = data.kickLink || 'https://kick.com/rumi7xl';
      }

      // 3. YouTube Kartı (Liste Şeklinde)
      const youtubeCard = document.querySelector(".youtube-card");
      if (youtubeCard) {
        const bodyEl = youtubeCard.querySelector(".card-body-content");
        const linkEl = youtubeCard.querySelector("a");

        let ytHtml = "";
        if (data.youtubeVideos && data.youtubeVideos.length > 0) {
          data.youtubeVideos.forEach(vid => {
            ytHtml += `<a href="${vid.url}" target="_blank" style="display:block; color:#ccc; text-decoration:none; margin-bottom:8px; font-size:13px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; background:#1a1a1a; padding:6px 10px; border-radius:6px; border:1px solid #2a2a2a;">▶ ${vid.title}</a>`;
          });
        } else {
          ytHtml = `<p style="color:#777; margin-top:30px;">Henüz video eklenmedi.</p>`;
        }

        bodyEl.innerHTML = ytHtml;
        linkEl.href = data.youtubeChannelLink || 'https://youtube.com';
      }

      // 4. TikTok Kartı
      const tiktokCard = document.querySelector(".tiktok-card");
      if (tiktokCard) {
        const bodyEl = tiktokCard.querySelector(".card-body-content");
        const linkEl = tiktokCard.querySelector("a");

        bodyEl.innerHTML = `
          <p style="margin: 0; color: #ccc; line-height: 1.5;">${data.tiktokDesc || 'En komik kesitler ve kısa videolar TikTok adresimde!'}</p>
        `;
        linkEl.href = data.tiktokLink || 'https://tiktok.com';
      }

    }
  } catch (e) {
    console.error("İçerikler yüklenirken hata:", e);
  }
});
