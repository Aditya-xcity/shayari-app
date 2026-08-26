// Built-in fallback shayaris to ensure the app always works
// even when opened directly via file:// protocol without a web server.
const DEFAULT_SHAYARIS = {
    "sad": [
        {
            "text": "कुछ दर्द ऐसे होते हैं,\nजो चेहरे पर नहीं दिखते।",
            "author": "Anonymous",
            "music": "sad.mp3"
        },
        {
            "text": "हम मुस्कुराते रहे,\nऔर लोग समझते रहे कि सब ठीक है।",
            "author": "Anonymous",
            "music": "sad.mp3"
        },
        {
            "text": "वक़्त ने सिखा दी हर बात की हकीकत,\nवरना हम भी कभी बेपरवाह जिया करते थे।",
            "author": "Anonymous",
            "music": "sad.mp3"
        }
    ],

    "love": [
        {
            "text": "तुम मिले तो लगा,\nजैसे किसी दुआ का जवाब मिल गया।",
            "author": "Anonymous",
            "music": "love.mp3"
        },
        {
            "text": "तेरी ख़ामोशी भी बहुत कुछ कह जाती है,\nजब नज़रें मिलती हैं तो बातें मुकम्मल हो जाती हैं।",
            "author": "Anonymous",
            "music": "love.mp3"
        },
        {
            "text": "एक तेरा साथ ही तो माँगा था रब से,\nतेरे बिना यह महफ़िल भी वीरान लगती है।",
            "author": "Anonymous",
            "music": "love.mp3"
        }
    ],

    "zindagi": [
        {
            "text": "ज़िंदगी की उलझनों ने छीन ली मुस्कुराहटें,\nवरना हम भी कभी महफ़िलों की जान हुआ करते थे।",
            "author": "Anonymous",
            "music": "music.mp3"
        },
        {
            "text": "सफ़र खूबसूरत है मंज़िल से भी,\nबस हौसलों में थोड़ी जान चाहिए।",
            "author": "Anonymous",
            "music": "music.mp3"
        },
        {
            "text": "हर दिन एक नया पन्ना है ज़िंदगी की किताब का,\nमुस्कुरा कर जियो, यह वक्त दोबारा नहीं आएगा।",
            "author": "Anonymous",
            "music": "music.mp3"
        }
    ]
};

let shayaris = DEFAULT_SHAYARIS;
let moods = Object.keys(shayaris);

let currentMood = moods[0] || "sad";
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
const progressContainer = document.querySelector(".progress");


// ================================
// LOAD JSON
// ================================

async function loadShayaris() {
    try {
        const response = await fetch("./shayaris.json");

        if (!response.ok) {
            throw new Error(`shayaris.json response not ok: ${response.status}`);
        }

        const data = await response.json();

        if (data && typeof data === "object" && Object.keys(data).length > 0) {
            shayaris = data;
            console.log("Loaded shayaris from JSON file.");
        } else {
            shayaris = DEFAULT_SHAYARIS;
        }

    } catch (error) {
        // Fallback for file:// protocol or network errors
        console.warn("Using built-in shayaris (fetch error or local file:// origin):", error.message);
        shayaris = DEFAULT_SHAYARIS;
    }

    moods = Object.keys(shayaris);

    if (moods.length === 0) {
        shayaris = DEFAULT_SHAYARIS;
        moods = Object.keys(shayaris);
    }

    currentMood = moods[0];
    currentIndex = 0;

    showShayari();
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

    // Wrap around index if out of bounds
    if (currentIndex >= list.length) currentIndex = 0;
    if (currentIndex < 0) currentIndex = list.length - 1;

    const current = list[currentIndex];

    // Text
    shayariElement.textContent = current.text;

    // Mood badge
    moodElement.textContent = `💭 ${currentMood}`;
    moodElement.title = "Click to change mood (or press M)";

    // Author
    authorElement.textContent = current.author ? `— ${current.author}` : "— Anonymous";

    // Re-trigger animation
    shayariElement.style.animation = "none";
    shayariElement.offsetHeight; // Trigger reflow
    shayariElement.style.animation = "fadeIn 0.7s ease";

    // Update music source
    if (current.music) {
        changeMusic(current.music);
    } else {
        changeMusic("music.mp3");
    }
}


// ================================
// CHANGE MUSIC
// ================================

function changeMusic(filename) {
    if (!filename) return;

    const targetSrc = `assets/music/${filename}`;
    const currentSrc = music.getAttribute("src");

    // Avoid restarting track if the same track is already assigned
    if (currentSrc === targetSrc || (currentSrc && currentSrc.endsWith(filename))) {
        return;
    }

    // Remember whether music was playing
    const wasPlaying = !music.paused;

    // Stop current music
    music.pause();

    // Set new source
    music.src = targetSrc;

    // Reset progress
    music.currentTime = 0;
    progressBar.style.width = "0%";

    // If music was already playing, continue playing the new track
    if (wasPlaying) {
        const playPromise = music.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    playBtn.textContent = "❚❚";
                    disc.classList.add("playing");
                })
                .catch(error => {
                    console.warn("Could not autoplay track transition:", error);
                    playBtn.textContent = "▶";
                    disc.classList.remove("playing");
                });
        }
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

    // When reaching the end of the current mood, transition to next mood
    if (currentIndex >= list.length) {
        const currentMoodIndex = moods.indexOf(currentMood);
        const nextMoodIndex = (currentMoodIndex + 1) % moods.length;
        currentMood = moods[nextMoodIndex];
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

    // When reaching before the start of the current mood, go to previous mood
    if (currentIndex < 0) {
        const currentMoodIndex = moods.indexOf(currentMood);
        const prevMoodIndex = (currentMoodIndex - 1 + moods.length) % moods.length;
        currentMood = moods[prevMoodIndex];
        const prevList = shayaris[currentMood] || [];
        currentIndex = Math.max(0, prevList.length - 1);
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


// Cycle to next mood
function cycleNextMood() {
    if (moods.length <= 1) return;
    const currentMoodIndex = moods.indexOf(currentMood);
    const nextMoodIndex = (currentMoodIndex + 1) % moods.length;
    changeMood(moods[nextMoodIndex]);
}


// ================================
// PLAY / PAUSE
// ================================

async function toggleMusic() {
    // Ensure music source is set
    if (!music.src || music.src === "" || music.src === window.location.href) {
        const list = shayaris[currentMood];
        const current = list ? list[currentIndex] : null;
        const track = (current && current.music) ? current.music : "music.mp3";
        music.src = `assets/music/${track}`;
    }

    if (music.paused) {
        try {
            await music.play();
            playBtn.textContent = "❚❚";
            disc.classList.add("playing");
        } catch (error) {
            console.error("Music could not be played:", error);

            // If selected track fails, try fallback music.mp3
            if (!music.src.endsWith("music.mp3")) {
                console.log("Trying fallback audio: music.mp3");
                music.src = "assets/music/music.mp3";
                try {
                    await music.play();
                    playBtn.textContent = "❚❚";
                    disc.classList.add("playing");
                } catch (fallbackError) {
                    console.error("Fallback music also failed:", fallbackError);
                }
            }
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

// Music finished -> loop audio smoothly
music.addEventListener("ended", () => {
    music.currentTime = 0;
    music.play().catch(() => {
        playBtn.textContent = "▶";
        disc.classList.remove("playing");
    });
});

// Music loading error -> try fallback
music.addEventListener("error", () => {
    console.error("Music file failed to load:", music.src);
    if (!music.src.endsWith("music.mp3")) {
        console.log("Falling back to default track music.mp3");
        music.src = "assets/music/music.mp3";
    } else {
        playBtn.textContent = "▶";
        disc.classList.remove("playing");
    }
});


// ================================
// MUSIC PROGRESS & SEEKING
// ================================

music.addEventListener("timeupdate", () => {
    if (!music.duration || isNaN(music.duration)) {
        return;
    }

    const percentage = (music.currentTime / music.duration) * 100;
    progressBar.style.width = `${percentage}%`;
});

// Allow user to click progress bar to seek
if (progressContainer) {
    progressContainer.addEventListener("click", (e) => {
        if (!music.duration || isNaN(music.duration)) return;
        const rect = progressContainer.getBoundingClientRect();
        const clickPosition = (e.clientX - rect.left) / rect.width;
        const boundedRatio = Math.max(0, Math.min(1, clickPosition));
        music.currentTime = boundedRatio * music.duration;
    });
}


// ================================
// INTERACTION LISTENERS
// ================================

nextBtn.addEventListener("click", nextShayari);
previousBtn.addEventListener("click", previousShayari);
playBtn.addEventListener("click", toggleMusic);

// Clicking mood badge cycles to next mood
moodElement.addEventListener("click", cycleNextMood);

// Keyboard navigation
document.addEventListener("keydown", (e) => {
    // Avoid triggering if an input field is focused
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    if (e.code === "Space") {
        e.preventDefault();
        toggleMusic();
    } else if (e.code === "ArrowRight" || e.code === "ArrowDown") {
        e.preventDefault();
        nextShayari();
    } else if (e.code === "ArrowLeft" || e.code === "ArrowUp") {
        e.preventDefault();
        previousShayari();
    } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        cycleNextMood();
    }
});


// ================================
// START APP
// ================================

loadShayaris();