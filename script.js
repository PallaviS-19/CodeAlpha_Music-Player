
const audio = document.getElementById("audio");
const cover = document.getElementById("cover");
const coverFallback = document.getElementById("cover-fallback");

const title = document.getElementById("title");
const artist = document.getElementById("artist");

const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");

const volume = document.getElementById("volume");
const volumeValue = document.getElementById("volume-value");

const playlistEl = document.getElementById("playlist");
const songCount = document.getElementById("song-count");

const shuffleBtn = document.getElementById("shuffle");
const repeatBtn = document.getElementById("repeat");
const favouriteBtn = document.getElementById("favourite");

const playerMessage = document.getElementById("player-message");

// ======================================
// SONGS
// Start with the file you confirmed works.
// Add more songs after checking their filenames.
// ======================================

const songs = [
    {
        title: "Banjara",
        artist: "Your Favourite Artist",
        src: "./songs/banjara.mp3",
        cover: "./images/banjara.jpg"
    }

 
    ,{
        title: "Humsafar",
         artist: "Ariji Singh",
        src: "./songs/humsafar.mp3",
        cover: "./images/humsafar.jpg"
     }
     ,{
        title: "Rantaan Lambiyan",
         artist: "Jubin Nautiyal",
        src: "./songs/ratan.mp3",
        cover: "./images/Ratann.jpg"
     }
     ,{
        title: "Mere Papa",
         artist: "Tulsi Kumar",
        src: "./songs/merepapa.mp3",
        cover: "./images/merepapa.jpg"
     }
];

let currentIndex = 0;
let isShuffle = false;
let isRepeat = false;
let isFavourite = false;

// ======================================
// HELPER FUNCTIONS
// ======================================

function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return "0:00";
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${String(secs).padStart(2, "0")}`;
}

function showMessage(message) {
    playerMessage.textContent = message;
}

function updateRangeFill(input) {
    const min = Number(input.min) || 0;
    const max = Number(input.max) || 100;
    const value = Number(input.value) || 0;

    const percentage = max > min
        ? ((value - min) / (max - min)) * 100
        : 0;

    input.style.setProperty("--fill", `${percentage}%`);
}

function updatePlayButton() {
    const playing = !audio.paused;

    playBtn.textContent = playing ? "Ⅱ" : "▶";
    playBtn.setAttribute(
        "aria-label",
        playing ? "Pause" : "Play"
    );
    playBtn.title = playing ? "Pause" : "Play";
}

// ======================================
// LOAD A SONG
// ======================================

function loadSong(index) {
    if (index < 0 || index >= songs.length) return;

    currentIndex = index;

    const song = songs[currentIndex];

    audio.pause();
    audio.removeAttribute("src");
    audio.load();

    title.textContent = song.title;
    artist.textContent = song.artist;

    coverFallback.classList.remove("hidden");
    cover.src = song.cover;
    cover.alt = `Album artwork for ${song.title}`;

    progress.value = 0;
    updateRangeFill(progress);

    currentTimeEl.textContent = "0:00";
    durationEl.textContent = "0:00";

    audio.src = song.src;
    audio.load();

    renderPlaylist();
    updatePlayButton();

    showMessage(`Selected: ${song.title}`);
}

// ======================================
// PLAY
// ======================================

async function playSong() {
    if (!audio.src) {
        showMessage("No audio file has been selected.");
        return;
    }

    showMessage("Loading song...");

    try {
        await audio.play();
        showMessage(`Now playing: ${songs[currentIndex].title}`);
        updatePlayButton();
    } catch (error) {
        console.error("Playback error:", error.name);
        console.error("Audio source:", audio.currentSrc || audio.src);
        console.error("Audio error code:", audio.error?.code);
        console.error("Audio error message:", audio.error?.message);

        updatePlayButton();

        if (audio.error) {
            showMessage(
                "Audio could not be loaded. Check the MP3 filename and path."
            );
        } else {
            showMessage(
                "Playback failed. Try clicking Play again."
            );
        }
    }
}

// ======================================
// PLAY / PAUSE
// ======================================

playBtn.addEventListener("click", () => {
    if (audio.paused) {
        playSong();
    } else {
        audio.pause();
    }
});

audio.addEventListener("play", updatePlayButton);

audio.addEventListener("pause", updatePlayButton);

// ======================================
// NEXT SONG
// ======================================

function nextSong() {
    if (songs.length <= 1) {
        if (isRepeat) {
            audio.currentTime = 0;
            playSong();
        } else {
            showMessage("Add more songs to your playlist.");
        }
        return;
    }

    let nextIndex;

    if (isShuffle) {
        do {
            nextIndex = Math.floor(Math.random() * songs.length);
        } while (nextIndex === currentIndex);
    } else {
        nextIndex = (currentIndex + 1) % songs.length;
    }

    loadSong(nextIndex);
    playSong();
}

nextBtn.addEventListener("click", nextSong);

// ======================================
// PREVIOUS SONG
// ======================================

function previousSong() {
    if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
    }

    if (songs.length <= 1) {
        audio.currentTime = 0;
        showMessage("Restarting current song.");
        return;
    }

    currentIndex =
        (currentIndex - 1 + songs.length) % songs.length;

    loadSong(currentIndex);
    playSong();
}

prevBtn.addEventListener("click", previousSong);

// ======================================
// PROGRESS AND DURATION
// ======================================

audio.addEventListener("loadedmetadata", () => {
    durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener("durationchange", () => {
    durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
        return;
    }

    progress.value =
        (audio.currentTime / audio.duration) * 100;

    currentTimeEl.textContent = formatTime(audio.currentTime);

    updateRangeFill(progress);
});

progress.addEventListener("input", () => {
    updateRangeFill(progress);

    if (Number.isFinite(audio.duration) && audio.duration > 0) {
        audio.currentTime =
            (Number(progress.value) / 100) * audio.duration;
    }
});

// ======================================
// VOLUME
// ======================================

function setVolume() {
    audio.volume = Number(volume.value);

    volumeValue.textContent =
        `${Math.round(audio.volume * 100)}%`;

    updateRangeFill(volume);
}

volume.addEventListener("input", setVolume);

setVolume();

// ======================================
// SHUFFLE
// ======================================

shuffleBtn.addEventListener("click", () => {
    isShuffle = !isShuffle;

    shuffleBtn.classList.toggle("active", isShuffle);

    shuffleBtn.setAttribute(
        "aria-pressed",
        String(isShuffle)
    );

    showMessage(
        isShuffle ? "Shuffle is on." : "Shuffle is off."
    );
});

// ======================================
// REPEAT CURRENT SONG
// ======================================

repeatBtn.addEventListener("click", () => {
    isRepeat = !isRepeat;

    repeatBtn.classList.toggle("active", isRepeat);

    repeatBtn.setAttribute(
        "aria-pressed",
        String(isRepeat)
    );

    showMessage(
        isRepeat
            ? "Repeat current song is on."
            : "Repeat is off."
    );
});

audio.addEventListener("ended", () => {
    if (isRepeat) {
        audio.currentTime = 0;
        playSong();
    } else if (isShuffle && songs.length > 1) {
        nextSong();
    } else if (currentIndex < songs.length - 1) {
        nextSong();
    } else {
        audio.currentTime = 0;
        updatePlayButton();
        progress.value = 0;
        updateRangeFill(progress);
        currentTimeEl.textContent = "0:00";
        showMessage("Playlist finished. Press Play to listen again.");
    }
});

// ======================================
// FAVOURITE BUTTON
// ======================================

favouriteBtn.addEventListener("click", () => {
    isFavourite = !isFavourite;

    favouriteBtn.classList.toggle("active", isFavourite);
    favouriteBtn.textContent = isFavourite ? "♥" : "♡";

    favouriteBtn.setAttribute(
        "aria-pressed",
        String(isFavourite)
    );

    showMessage(
        isFavourite
            ? "Added to favourites."
            : "Removed from favourites."
    );
});

// ======================================
// RENDER PLAYLIST
// ======================================

function renderPlaylist() {
    playlistEl.replaceChildren();

    songs.forEach((song, index) => {
        const li = document.createElement("li");

        if (index === currentIndex) {
            li.classList.add("active");
        }

        li.setAttribute("tabindex", "0");
        li.setAttribute("role", "button");
        li.setAttribute(
            "aria-label",
            `Play ${song.title} by ${song.artist}`
        );

        const number = document.createElement("span");
        number.className = "track-number";
        number.textContent = String(index + 1).padStart(2, "0");

        const details = document.createElement("div");
        details.className = "track-details";

        const songTitle = document.createElement("strong");
        songTitle.textContent = song.title;

        const songArtist = document.createElement("small");
        songArtist.textContent = song.artist;

        details.append(songTitle, songArtist);

        const icon = document.createElement("span");
        icon.className = "track-duration";
        icon.textContent = index === currentIndex ? "♫" : "♪";

        li.append(number, details, icon);

        function selectSong() {
            if (index === currentIndex) {
                if (audio.paused) {
                    playSong();
                } else {
                    audio.pause();
                }
            } else {
                loadSong(index);
                playSong();
            }
        }

        li.addEventListener("click", selectSong);

        li.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                selectSong();
            }
        });

        playlistEl.appendChild(li);
    });

    songCount.textContent =
        `${songs.length} ${songs.length === 1 ? "song" : "songs"}`;
}

// ======================================
// COVER IMAGE FALLBACK
// ======================================

cover.addEventListener("load", () => {
    coverFallback.classList.add("hidden");
});

cover.addEventListener("error", () => {
    coverFallback.classList.remove("hidden");
    console.warn("Cover image not found:", cover.src);
});

// ======================================
// AUDIO ERROR HANDLING
// ======================================

audio.addEventListener("error", () => {
    const code = audio.error?.code;

    console.error("Audio error code:", code);
    console.error("Audio source:", audio.currentSrc || audio.src);

    if (code === 4) {
        showMessage(
            "Audio source unsupported or not found. Check the MP3 path."
        );
    } else if (code === 3) {
        showMessage(
            "The audio could not be decoded. Check the audio file."
        );
    } else {
        showMessage(
            "Unable to load the song. Check your songs folder."
        );
    }

    updatePlayButton();
});

// ======================================
// INITIALIZE PLAYER
// ======================================

loadSong(0);
setVolume();
updatePlayButton();
