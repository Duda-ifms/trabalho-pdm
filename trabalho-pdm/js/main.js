//--------------------------------------
// IndexedDB
//--------------------------------------
let db;

const request = indexedDB.open("lugaresDB", 1);

request.onupgradeneeded = function () {
    db = request.result;
    db.createObjectStore("lugares", { keyPath: "id", autoIncrement: true });
};

request.onsuccess = function () {
    db = request.result;
    listarLugares();
};

//--------------------------------------
// GPS + Mapa
//--------------------------------------
let map;
let marker;
let latitude = null;
let longitude = null;

document.getElementById("btnGPS").addEventListener("click", () => {
    if (!navigator.geolocation) {
        alert("GPS não suportado");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            latitude = pos.coords.latitude;
            longitude = pos.coords.longitude;

            if (!map) {
                map = L.map("map").setView([latitude, longitude], 15);
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
            }

            if (marker) marker.remove();
            marker = L.marker([latitude, longitude]).addTo(map);

        },
        () => alert("Erro ao obter localização"),
        { enableHighAccuracy: true }
    );
});

//--------------------------------------
// Salvar lugar
//--------------------------------------
document.getElementById("btnSalvar").addEventListener("click", () => {
    if (latitude === null) {
        alert("Obtenha seu GPS primeiro!");
        return;
    }

    const tx = db.transaction("lugares", "readwrite");
    tx.objectStore("lugares").add({
        nome: "Local salvo",
        lat: latitude,
        lng: longitude,
        data: Date.now()
    });

    tx.oncomplete = listarLugares;
});

//--------------------------------------
// Listar
//--------------------------------------
function listarLugares() {
    const ul = document.getElementById("lista");
    ul.innerHTML = "";

    const tx = db.transaction("lugares", "readonly");
    const store = tx.objectStore("lugares");

    store.openCursor().onsuccess = function (e) {
        const cursor = e.target.result;
        if (cursor) {
            const li = document.createElement("li");
            li.innerHTML = `
                <strong>${cursor.value.nome}</strong>
                <br>
                ${cursor.value.lat.toFixed(5)}, ${cursor.value.lng.toFixed(5)}
                <button onclick="remover(${cursor.value.id})">Remover</button>
            `;
            ul.appendChild(li);
            cursor.continue();
        }
    };
}

//--------------------------------------
// Remover
//--------------------------------------
function remover(id) {
    const tx = db.transaction("lugares", "readwrite");
    tx.objectStore("lugares").delete(id);
    tx.oncomplete = listarLugares;
}

window.remover = remover;
