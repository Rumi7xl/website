import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCiuXtHu3J9Va46a4KiETO2Jr5um2KoQ",
  authDomain: "rumi7xl-web.firebaseapp.com",
  projectId: "rumi7xl-web",
  storageBucket: "rumi7xl-web.firebasestorage.app",
  messagingSenderId: "1077565304835",
  appId: "1:1077565304835:web:a672a4440797b76f42de36"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence);

const accountBox = document.querySelector(".account-box");
const modal = document.getElementById("accountModal");

const loginBtn = document.querySelector(".login-btn");
const registerBtn = document.querySelector(".register-btn");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginSubmit =
  document.querySelector("#loginForm .account-submit");

const registerSubmit =
  document.querySelector("#registerForm .account-submit");

if (loginBtn) {

  loginBtn.onclick = (e) => {

    e.preventDefault();

    if (typeof showLogin === "function") {

      showLogin();

    }

    if (modal) {

      modal.style.display = "flex";

    }

  };

}

if (registerBtn) {

  registerBtn.onclick = (e) => {

    e.preventDefault();

    if (typeof showRegister === "function") {

      showRegister();

    }

    if (modal) {

      modal.style.display = "flex";

    }

  };

}

if (loginSubmit) {

  loginSubmit.onclick = async () => {

    const inputs =
      document.querySelectorAll("#loginForm input");

    const email = inputs[0].value.trim();

    const password = inputs[1].value;

    if (!email || !password) {

      alert("Bilgileri doldur.");

      return;

    }

    try {

      await signInWithEmailAndPassword(

        auth,

        email,

        password

      );

      if (modal) {

        modal.style.display = "none";

      }

    } catch (err) {

      alert(err.message);

    }

  };

}
if (registerSubmit) {

  registerSubmit.onclick = async () => {

    const inputs =
      document.querySelectorAll("#registerForm input");

    const username = inputs[0].value.trim();
    const email = inputs[1].value.trim();
    const password = inputs[2].value;

    if (!username || !email || !password) {

      alert("Bilgileri doldur.");

      return;

    }

    try {

      await createUserWithEmailAndPassword(

        auth,

        email,

        password

      );

      if (modal) {

        modal.style.display = "none";

      }

    } catch (err) {

      alert(err.message);

    }

  };

}

onAuthStateChanged(auth, (user) => {

  if (!accountBox) return;

  if (user) {

    const name =
      user.email.split("@")[0];

    accountBox.innerHTML = `

      <a class="user-name">

        👤 ${name}

      </a>

      <a href="#" id="logoutBtn">

        🚪 Çıkış Yap

      </a>

    `;

    const logoutBtn =
      document.getElementById("logoutBtn");

    if (logoutBtn) {

      logoutBtn.onclick = async (e) => {

        e.preventDefault();

        try {

          await signOut(auth);

          location.reload();

        } catch (err) {

          alert(err.message);

        }

      };

    }

  } else {

    accountBox.innerHTML = `

      <a href="#" class="login-btn">

        👤 Giriş Yap

      </a>

      <a href="#" class="register-btn">

        ✨ Kayıt Ol

      </a>

    `;

    const loginAgain =
      accountBox.querySelector(".login-btn");

    const registerAgain =
      accountBox.querySelector(".register-btn");

    if (loginAgain) {

      loginAgain.onclick = (e) => {

        e.preventDefault();

        if (typeof showLogin === "function") {

          showLogin();

        }

        if (modal) {

          modal.style.display = "flex";

        }

      };

    }

    if (registerAgain) {

      registerAgain.onclick = (e) => {

        e.preventDefault();

        if (typeof showRegister === "function") {

          showRegister();

        }

        if (modal) {

          modal.style.display = "flex";

        }

      };

    }

  }

});

window.firebaseAuth = auth;
window.logout = () => signOut(auth);
