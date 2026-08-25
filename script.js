let shayaris = {};
let moods = [];

let currentMood = "";
let currentIndex = 0;


// ================================
// ELEMENTS
// ================================

const shayariElement = document.getElementById("shayari");
const moodElement = document.getElementById("mood");
const authorElement = document.getElementById("author");

const nextBtn = document.getElementById("nextBtn");
const previousBtn = document.getElementById("previousBtn");
const playBtn = document.getElementById("playBtn");

const music = document.getElementById("music");
const disc = document.querySelector(".disc");
const progressBar = document.getElementById("progressBar");


// ================================
// LOAD JSON
// ================================

async function loadShayaris() {

    try {

        const response = await fetch("./shayaris.json");

        if (!response.ok) {
            throw new Error(
                `shayaris.json failed to load: ${response.status}`
            );
        }

        shayaris = await response.json();

        moods = Object.keys(shayaris);

        if (moods.length === 0) {
            throw new Error("No moods found in shayaris.json");
        }

        // Start with first mood
        currentMood = moods[0];
        currentIndex = 0;

        showShayari();

        console.log("Loaded moods:", moods);

    } catch (error) {

        console.error("Failed to load Shayari:", error);

        shayariElement.textContent =
            "Shayari load nahi ho paayi.";

        moodElement.textContent = "Error";
        authorElement.textContent = "";

    }
}


// ================================
// SHOW SHAYARI
// ================================

function showShayari() {

    const list = shayaris[currentMood];

    if (!list || list.length === 0) {
        console.error(`No Shayari found for mood: ${currentMood}`);
        return;
    }

    const current = list[currentIndex];

    // Text
    shayariElement.textContent = current.text;

    // Mood
    moodElement.textContent = `💭 ${currentMood}`;

    // Author
    authorElement.textContent =
        current.author
            ? `— ${current.author}`
            : "— Anonymous";


    // Animation
    shayariElement.style.animation = "none";
    shayariElement.offsetHeight;
    shayariElement.style.animation = "fadeIn 0.7s ease";


    // Music
    if (current.music) {
        changeMusic(current.music);
    }
}


// ================================
// CHANGE MUSIC
// ================================

function changeMusic(filename) {

    // Remember whether music was playing
    const wasPlaying = !music.paused;

    // Stop current music
    music.pause();

    // Set new source
    music.src = `assets/music/${filename}`;

    // Reset
    music.currentTime = 0;

    // Reset progress
    progressBar.style.width = "0%";


    // If music was already playing,
    // continue playing the new track
    if (wasPlaying) {

        music.play()
            .then(() => {

                playBtn.textContent = "❚❚";
                disc.classList.add("playing");

            })
            .catch(error => {

                console.error("Could not play music:", error);

                playBtn.textContent = "▶";
                disc.classList.remove("playing");

            });
    }
}


// ================================
// NEXT SHAYARI
// ================================

function nextShayari() {

    const list = shayaris[currentMood];

    if (!list || list.length === 0) {
        return;
    }

    currentIndex++;

    if (currentIndex >= list.length) {
        currentIndex = 0;
    }

    showShayari();
}


// ================================
// PREVIOUS SHAYARI
// ================================

function previousShayari() {

    const list = shayaris[currentMood];

    if (!list || list.length === 0) {
        return;
    }

    currentIndex--;

    if (currentIndex < 0) {
        currentIndex = list.length - 1;
    }

    showShayari();
}


// ================================
// CHANGE MOOD
// ================================

function changeMood(mood) {

    if (!shayaris[mood]) {
        console.error(`Mood "${mood}" does not exist.`);
        return;
    }

    currentMood = mood;
    currentIndex = 0;

    showShayari();
}


// ================================
// PLAY / PAUSE
// ================================

async function toggleMusic() {

    if (music.paused) {

        try {

            await music.play();

            playBtn.textContent = "❚❚";
            disc.classList.add("playing");

        } catch (error) {

            console.error("Music could not be played:", error);

        }

    } else {

        music.pause();

        playBtn.textContent = "▶";
        disc.classList.remove("playing");
    }
}


// ================================
// MUSIC EVENTS
// ================================

// Music successfully started
music.addEventListener("play", () => {

    playBtn.textContent = "❚❚";
    disc.classList.add("playing");

});


// Music paused
music.addEventListener("pause", () => {

    playBtn.textContent = "▶";
    disc.classList.remove("playing");

});


// Music finished
music.addEventListener("ended", () => {

    playBtn.textContent = "▶";
    disc.classList.remove("playing");

});


// Music loading error
music.addEventListener("error", () => {

    console.error(
        "Music file could not be loaded:",
        music.src
    );

    playBtn.textContent = "▶";
    disc.classList.remove("playing");

});


// ================================
// MUSIC PROGRESS
// ================================

music.addEventListener("timeupdate", () => {

    if (!music.duration) {
        return;
    }

    const percentage =
        (music.currentTime / music.duration) * 100;

    progressBar.style.width = `${percentage}%`;

});


// ================================
// BUTTONS
// ================================

nextBtn.addEventListener("click", nextShayari);

previousBtn.addEventListener("click", previousShayari);

playBtn.addEventListener("click", toggleMusic);


// ================================
// START APP
// ================================

loadShayaris();