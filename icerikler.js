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
      const liveBodyEl = document.getElementById("liveCardBody");
      const liveBtnEl = document.getElementById("liveCardBtn");
      if (liveBodyEl) {
        const isLive = data.isLive || false;
        
        liveBodyEl.innerHTML = `
          <p style="margin: 0 0 8px 0; font-weight: bold; color: ${isLive ? '#22c55e' : '#ef4444'}; font-size: 15px;">
            ${isLive ? '🟢 YAYINDA!' : '🔴 YAYINDA DEĞİL'}
          </p>
          <p style="margin: 0 0 5px 0; color: #bbb;">🎮 <b>Oyun:</b> ${data.liveGame || 'Belirtilmedi'}</p>
          <p style="margin: 0; color: #bbb;">👥 <b>İzleyici:</b> ${data.liveViewers || '0'}</p>
        `;
        if(liveBtnEl) liveBtnEl.href = data.kickLink || 'https://kick.com/rumi7xl';
      }

      // 2. Kick Kanalı Kartı
      const kickBodyEl = document.getElementById("kickCardBody");
      const kickBtnEl = document.getElementById("kickCardBtn");
      if (kickBodyEl) {
        kickBodyEl.innerHTML = `
          <p style="margin: 0; color: #ccc; white-space: pre-line; line-height: 1.5;">${data.kickDesc || '• Minecraft\n• Valorant\n• GTA V'}</p>
        `;
        if(kickBtnEl) kickBtnEl.href = data.kickLink || 'https://kick.com/rumi7xl';
      }

      // 3. YouTube Kartı (Liste Şeklinde)
      const youtubeBodyEl = document.getElementById("youtubeCardBody");
      const youtubeBtnEl = document.getElementById("youtubeCardBtn");
      if (youtubeBodyEl) {
        let ytHtml = "";
        if (data.youtubeVideos && data.youtubeVideos.length > 0) {
          data.youtubeVideos.forEach(vid => {
            ytHtml += `<a href="${vid.url}" target="_blank" style="display:block; color:#ccc; text-decoration:none; margin-bottom:8px; font-size:13px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; background:#1a1a1a; padding:6px 10px; border-radius:6px; border:1px solid #2a2a2a;">▶ ${vid.title}</a>`;
          });
        } else {
          ytHtml = `<p style="color:#777; margin-top:30px; text-align: center;">Henüz video eklenmedi.</p>`;
        }

        youtubeBodyEl.innerHTML = ytHtml;
        if(youtubeBtnEl) youtubeBtnEl.href = data.youtubeChannelLink || 'https://youtube.com';
      }

      // 4. TikTok Kartı
      const tiktokBodyEl = document.getElementById("tiktokCardBody");
      const tiktokBtnEl = document.getElementById("tiktokCardBtn");
      if (tiktokBodyEl) {
        tiktokBodyEl.innerHTML = `
          <p style="margin: 0; color: #ccc; line-height: 1.5;">${data.tiktokDesc || 'En komik kesitler ve kısa videolar TikTok adresimde!'}</p>
        `;
        if(tiktokBtnEl) tiktokBtnEl.href = data.tiktokLink || 'https://tiktok.com';
      }

    }
  } catch (e) {
    console.error("İçerikler yüklenirken hata:", e);
  }
});
