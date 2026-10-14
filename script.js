
/* =====================================
   1. ELEMENTOS HTML
===================================== */

const luzRoja = document.getElementById("luzRoja");
const luzVerde = document.getElementById("luzVerde");
const semaforo = document.getElementById("semaforo");

const panelEstado = document.getElementById("panelEstado");
const tituloEstado = document.getElementById("tituloEstado");
const mensajeEstado = document.getElementById("mensajeEstado");
const iconoEstado = document.getElementById("iconoEstado");

const textoVoz = document.getElementById("textoVoz");
const anuncio = document.getElementById("anuncio");

const btnCambiar = document.getElementById("btnCambiar");
const btnSonido = document.getElementById("btnSonido");
const btnVoz = document.getElementById("btnVoz");
const btnAutomatico = document.getElementById("btnAutomatico");

const iconoSonido = document.getElementById("iconoSonido");
const textoSonido = document.getElementById("textoSonido");
const textoBotonVoz = document.getElementById("textoBotonVoz");
const textoAutomatico = document.getElementById("textoAutomatico");


/* =====================================
   2. VARIABLES
===================================== */

let estadoActual = "rojo";
let sonidoActivado = true;
let vozActivada = true;
let modoAutomatico = false;

let temporizador = null;
let contextoAudio = null;


/* =====================================
   3. FUNCIÓN DE VOZ
===================================== */

function hablar(mensaje) {
    if (!vozActivada) return;

    if (!("speechSynthesis" in window)) {
        textoVoz.textContent =
            "Tu navegador no admite voz.";
        return;
    }

    // Cancelar la frase anterior
    window.speechSynthesis.cancel();

    const voz = new SpeechSynthesisUtterance(mensaje);

    voz.lang = "es-PE";
    voz.rate = 0.9;
    voz.pitch = 1;
    voz.volume = 1;

    textoVoz.textContent = "El semáforo está hablando...";

    voz.onend = function () {
        textoVoz.textContent = "Mensaje de voz: " + mensaje;
    };

    voz.onerror = function () {
        textoVoz.textContent =
            "No se pudo reproducir la voz.";
    };

    window.speechSynthesis.speak(voz);
}


/* =====================================
   4. SONIDO ELECTRÓNICO
===================================== */

function reproducirSonido(frecuencia) {
    if (!sonidoActivado) return;

    try {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) return;

        if (!contextoAudio) {
            contextoAudio = new AudioContextClass();
        }

        if (contextoAudio.state === "suspended") {
            contextoAudio.resume();
        }

        const oscilador = contextoAudio.createOscillator();
        const volumen = contextoAudio.createGain();

        oscilador.type = "sine";
        oscilador.frequency.value = frecuencia;

        volumen.gain.setValueAtTime(
            0.0001,
            contextoAudio.currentTime
        );

        volumen.gain.exponentialRampToValueAtTime(
            0.12,
            contextoAudio.currentTime + 0.03
        );

        volumen.gain.exponentialRampToValueAtTime(
            0.0001,
            contextoAudio.currentTime + 0.25
        );

        oscilador.connect(volumen);
        volumen.connect(contextoAudio.destination);

        oscilador.start();
        oscilador.stop(contextoAudio.currentTime + 0.26);

    } catch (error) {
        console.warn("Error al reproducir el sonido:", error);
    }
}


/* =====================================
   5. CAMBIAR LAS LUCES Y LOS MENSAJES
===================================== */

function cambiarEstado(nuevoEstado, comunicar = true) {
    estadoActual = nuevoEstado;

    // Apagar las dos luces
    luzRoja.classList.remove("activa");
    luzVerde.classList.remove("activa");

    if (estadoActual === "rojo") {

        // ENCENDER ROJO
        luzRoja.classList.add("activa");

        panelEstado.className = "estado estado-rojo";
        iconoEstado.textContent = "✋";

        tituloEstado.textContent = "NO CRUZAR";

        mensajeEstado.textContent =
            "Espera en la acera hasta que la señal cambie.";

        semaforo.setAttribute(
            "aria-label",
            "Semáforo en rojo. No cruzar."
        );

        if (comunicar) {
            reproducirSonido(330);
            hablar("No cruzar");
        }

        anuncio.textContent =
            "Luz roja. No cruzar. Espera en la acera.";

    } else {

        // ENCENDER VERDE
        luzVerde.classList.add("activa");

        panelEstado.className = "estado estado-verde";
        iconoEstado.textContent = "✓";

        tituloEstado.textContent = "PUEDE CRUZAR";

        mensajeEstado.textContent =
            "La señal está en verde. Cruza con atención.";

        semaforo.setAttribute(
            "aria-label",
            "Semáforo en verde. Puede cruzar."
        );

        if (comunicar) {
            reproducirSonido(660);
            hablar("Puede cruzar");
        }

        anuncio.textContent =
            "Luz verde. Puede cruzar con atención.";
    }
}


/* =====================================
   6. BOTÓN CAMBIAR SEÑAL
===================================== */

btnCambiar.addEventListener("click", function () {

    const siguienteEstado =
        estadoActual === "rojo" ? "verde" : "rojo";

    cambiarEstado(siguienteEstado);
});


/* =====================================
   7. ACTIVAR O SILENCIAR EL SONIDO
===================================== */

btnSonido.addEventListener("click", function () {

    sonidoActivado = !sonidoActivado;

    btnSonido.setAttribute(
        "aria-pressed",
        String(sonidoActivado)
    );

    iconoSonido.textContent =
        sonidoActivado ? "🔊" : "🔇";

    textoSonido.textContent =
        sonidoActivado ? "Sonido activado" : "Sonido desactivado";
});


/* =====================================
   8. ACTIVAR O DESACTIVAR LA VOZ
===================================== */

btnVoz.addEventListener("click", function () {

    vozActivada = !vozActivada;

    btnVoz.setAttribute(
        "aria-pressed",
        String(vozActivada)
    );

    textoBotonVoz.textContent =
        vozActivada ? "Voz activada" : "Voz desactivada";

    if (!vozActivada && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        textoVoz.textContent = "Voz desactivada.";
    } else {
        textoVoz.textContent = "Voz activada.";
    }
});


/* =====================================
   9. MODO AUTOMÁTICO
===================================== */

btnAutomatico.addEventListener("click", function () {

    if (modoAutomatico) {
        detenerAutomatico();
    } else {
        iniciarAutomatico();
    }
});


function iniciarAutomatico() {

    modoAutomatico = true;

    btnAutomatico.setAttribute("aria-pressed", "true");

    textoAutomatico.textContent = "Detener automático";

    temporizador = setInterval(function () {

        const siguienteEstado =
            estadoActual === "rojo" ? "verde" : "rojo";

        cambiarEstado(siguienteEstado);

    }, 4000);

    anuncio.textContent =
        "Modo automático iniciado. Cambio de señal cada cuatro segundos.";
}


function detenerAutomatico() {

    clearInterval(temporizador);

    temporizador = null;
    modoAutomatico = false;

    btnAutomatico.setAttribute("aria-pressed", "false");

    textoAutomatico.textContent = "Iniciar automático";

    anuncio.textContent = "Modo automático detenido.";
}


/* =====================================
   10. INICIAR EL SEMÁFORO
===================================== */

// Inicia en rojo sin hablar al cargar la página.
// El primer clic activará la voz y el sonido.
cambiarEstado("rojo", false);
