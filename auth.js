import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

/* ===========================
   FIREBASE
=========================== */

const firebaseConfig = {
    apiKey: "BURAYA_DOGRU_API_KEY",
    authDomain: "rumi7xl-web.firebaseapp.com",
    projectId: "rumi7xl-web",
    storageBucket: "rumi7xl-web.firebasestorage.app",
    messagingSenderId: "1077565304835",
    appId: "1:1077565304835:web:a672a4440797b76f42de36"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/* ===========================
   MODAL
=========================== */

const modal = document.getElementById("accountModal");

window.showLogin = function () {
    document.getElementById("loginForm").style.display = "flex";
    document.getElementById("registerForm").style.display = "none";

    document.getElementById("loginTab").classList.add("active");
    document.getElementById("registerTab").classList.remove("active");
};

window.showRegister = function () {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerForm").style.display = "flex";

    document.getElementById("registerTab").classList.add("active");
    document.getElementById("loginTab").classList.remove("active");
};

window.closeAccount = function () {
    modal.style.display = "none";
};

/* ===========================
   BUTONLAR
=========================== */

const loginBtn = document.querySelector(".login-btn");

if (loginBtn) {
    loginBtn.onclick = (e) => {
        e.preventDefault();
        showLogin();
        modal.style.display = "flex";
    };
}

const registerBtn = document.querySelector(".register-btn");

if (registerBtn) {
    registerBtn.onclick = (e) => {
        e.preventDefault();
        showRegister();
        modal.style.display = "flex";
    };
}

/* ===========================
   GİRİŞ
=========================== */

const loginSubmit = document.querySelector("#loginForm .account-submit");

if (loginSubmit) {

    loginSubmit.onclick = async () => {

        const inputs = document.querySelectorAll("#loginForm input");

        try {

            await signInWithEmailAndPassword(
                auth,
                inputs[0].value,
                inputs[1].value
            );

            alert("✅ Giriş başarılı");

            closeAccount();

            location.reload();

        } catch (err) {

            alert(err.message);

        }

    };

}

/* ===========================
   KAYIT
=========================== */

const registerSubmit = document.querySelector("#registerForm .account-submit");

if (registerSubmit) {

    registerSubmit.onclick = async () => {

        const inputs = document.querySelectorAll("#registerForm input");

        try {

            await createUserWithEmailAndPassword(
                auth,
                inputs[1].value,
                inputs[2].value
            );

            alert("✅ Hesap oluşturuldu");

            closeAccount();

            location.reload();

        } catch (err) {

            alert(err.message);

        }

    };

}

/* ===========================
   OTURUM
=========================== */

onAuthStateChanged(auth, (user) => {

    const box = document.querySelector(".account-box");

    if (!box) return;

    if (user) {

        box.innerHTML = `
            <a>👤 ${user.email.split("@")[0]}</a>
            <a href="#" id="logoutBtn">🚪 Çıkış Yap</a>
        `;

        document.getElementById("logoutBtn").onclick = (e) => {

            e.preventDefault();

            signOut(auth).then(() => {

                location.reload();

            });

        };

    } else {

        box.innerHTML = `
            <a href="#" class="login-btn">👤 Giriş Yap</a>
            <a href="#" class="register-btn">✨ Kayıt Ol</a>
        `;

        document.querySelector(".login-btn").onclick = (e) => {
            e.preventDefault();
            showLogin();
            modal.style.display = "flex";
        };

        document.querySelector(".register-btn").onclick = (e) => {
            e.preventDefault();
            showRegister();
            modal.style.display = "flex";
        };

    }

});
