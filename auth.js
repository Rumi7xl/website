import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
getAuth,
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


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



onAuthStateChanged(auth,(user)=>{

const box = document.querySelector(".account-box");


if(!box) return;


if(user){

box.innerHTML = `

<a>
👤 ${user.email.split("@")[0]}
</a>

<a href="#" id="logoutBtn">
🚪 Çıkış Yap
</a>

`;


document.getElementById("logoutBtn").onclick = (e)=>{

e.preventDefault();


signOut(auth).then(()=>{

location.reload();

});


};


}

});
