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

      // 1. Canlı Durum
      document.getElementById("liveStatusBox").innerHTML = `
        <p style="margin: 0 0 8px 0; font-size: 1.05rem; font-weight: bold; color: ${data.isLive ? '#22c55e' : '#ef4444'};">
          ${data.isLive ? '🟢 RUMI7XL şu anda yayında!' : '🔴 Şu anda yayında değil'}
        </p>
        <p style="margin: 0 0 5px 0; color: #ccc; font-size: 0.95rem;">🎮 Oyun: <strong>${data.liveGame || 'Belirtilmedi'}</strong></p>
        <p style="margin: 0 0 15px 0; color: #ccc; font-size: 0.95rem;">👥 İzleyici: <strong>${data.liveViewers || '0'}</strong></p>
        <a href="${data.kickLink || '#'}" target="_blank" style="display: inline-block; background: #22c55e; color: #000; padding: 8px 18px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 0.9rem;">Yayına Git →</a>
      `;

      // 2. Kick Kanalı Bilgisi
      document.getElementById("kickContentBox").innerHTML = `
        <p style="margin: 0 0 10px 0; color: #ccc; font-size: 0.95rem; line-height: 1.4;">${data.kickDesc || 'Kick yayınları, oyun serileri ve eğlenceli anlar için kanalı takip et!'}</p>
        <a href="${data.kickLink || '#'}" target="_blank" style="display: inline-block; background: #22c55e; color: #000; padding: 8px 18px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 0.9rem;">Kick Kanalına Git →</a>
      `;

      // 3. YouTube Videoları Listesi
      const ytBox = document.getElementById("youtubeListBox");
      if (data.youtubeVideos && data.youtubeVideos.length > 0) {
        let ytHtml = "";
        data.youtubeVideos.forEach(vid => {
          ytHtml += `
            <div style="padding: 10px; border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
              <span style="color: #fff; font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">▶ ${vid.title}</span>
              <a href="${vid.url}" target="_blank" style="background: #ef4444; color: #fff; padding: 5px 12px; border-radius: 6px; text-decoration: none; font-size: 0.8rem; font-weight: bold; white-space: nowrap;">İzle</a>
            </div>
          `;
        });
        ytBox.innerHTML = ytHtml;
      } else {
        ytBox.innerHTML = `<p style="color: #777; font-size: 0.9rem; margin: 0;">Henüz eklenmiş YouTube videosu yok.</p>`;
      }

      // 4. TikTok Bilgisi
      document.getElementById("tiktokContentBox").innerHTML = `
        <p style="margin: 0 0 10px 0; color: #ccc; font-size: 0.95rem; line-height: 1.4;">${data.tiktokDesc || 'En komik kesitler ve kısa videolar TikTok adresimde!'}</p>
        <a href="${data.tiktokLink || '#'}" target="_blank" style="display: inline-block; background: #333; color: #fff; border: 1px solid #555; padding: 8px 18px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 0.9rem;">TikTok'a Git →</a>
      `;

    } else {
      document.getElementById("liveStatusBox").innerHTML = "<p style='color:#777;'>Panelden henüz ayar yapılmadı.</p>";
      document.getElementById("kickContentBox").innerHTML = "<p style='color:#777;'>Ayar bulunamadı.</p>";
      document.getElementById("youtubeListBox").innerHTML = "<p style='color:#777;'>Video bulunamadı.</p>";
      document.getElementById("tiktokContentBox").innerHTML = "<p style='color:#777;'>Ayar bulunamadı.</p>";
    }
  } catch (e) {
    console.error(e);
  }
});
