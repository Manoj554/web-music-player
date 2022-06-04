'use-strict';

//Pre-defined songs which are kept in static folder
const songList = [
    { path: 'demo-1.mp3' },
    { path: 'demo-2.mp3' },
];

//Global variables
let liveSongList = [...songList];
let uploadedSongList = [];
let trackNo = 0;
let interval;
let prevVolume;
let currentTrack;

//Funtion which returns dynamic path
const path = (track) => '/assets/music/' + songList[track].path;
const src = (track) => liveSongList[track].src;


//Dom-Elements
const music = document.getElementsByTagName('audio')[0];
const playButton = document.getElementById('play-button');
const musicProgressBar = document.getElementById('music-progress-bar');
const controller = document.querySelector('#music-controller');
const volume = document.getElementById('volume-control');
const IconVolume = document.getElementById('volume-icon');
const MusicList = document.getElementById('music-list');
const TrackTitle = document.getElementById('title');

//Run for the firstTime
music.src = path(trackNo);

//file handling
let fileInput = document.getElementById('file-input');

//Run once for predefined songs
for (let i = 0; i < songList.length; i++) {
    let tr = document.createElement('tr');
    tr.onclick = playsongByIndex.bind(this, i);
    tr.innerHTML = `
        <td>${songList[i].path}</td>
        <td>3.45 mb</td>
        <td><button class="play-music" value=${i} onclick="playsongByIndex(${i})">
            <i class="fa-solid fa-music"></i>
        </button></td>
        `;
    MusicList.appendChild(tr);
}

TrackIndicator(trackNo);

//Handle Music Progress bar
musicProgressBar.addEventListener('mouseup', () => {
    let value = musicProgressBar.value;
    music.currentTime = music.duration * (value / 100);
});

//Handle Volume
volume.addEventListener('click', () => {
    music.volume = volume.value / 100;
    IconVolume.classList.remove('fa-volume-xmark');
    IconVolume.classList.add('fa-volume-off');
});

//Handle Clicks in the controller
controller.addEventListener('click', handleIntervalTimers);

//Handle new Uploaded files by users
fileInput.addEventListener('change', ReadFile);

//All Functions

//Read files and push into liveArraylist
async function ReadFile(e) {
    let files = e.target.files;

    // console.log('i am running');
    for (let i = 0; i < files.length; i++) {
        let result = await convertToBase64(files[i]);
        uploadedSongList.push({
            title: result.title,
            size: result.size,
            src: result.src
        });
    };
    renderSongs();
    liveSongList = [...liveSongList, ...uploadedSongList];
    uploadedSongList = [];
    fileInput.value = null;
};

//Render new uploaded songs
function renderSongs() {
    let allsongsLength = liveSongList.length;
    for (let i = 0; i < uploadedSongList.length; i++) {
        let tr = document.createElement('tr');
        tr.onclick = playsongByIndex.bind(this, (allsongsLength + i));
        let song = uploadedSongList[i];
        tr.innerHTML = `
            <td>${song.title}</td>
            <td>${song.size}</td>
            <td><button class="play-music" value=${allsongsLength + i} onclick="playsongByIndex(${allsongsLength + i})"><i class="fa-solid fa-music"></i></button></td>
            `;
        MusicList.appendChild(tr);
    }
}

//play-pause
function handlePlay() {
    let classes = playButton.classList;
    if (music.paused) {
        classes.remove('fa-circle-play');
        classes.add('fa-circle-pause');
        music.play();
    } else {
        classes.remove('fa-circle-pause');
        classes.add('fa-circle-play');
        music.pause();
    }
};

//Handle-Track
function handleTrack(val) {
    if (val === 1) {
        trackNo++;
    } else {
        trackNo--;
    }
    if (trackNo == -1) {
        trackNo = liveSongList.length - 1;
    }
    trackNo = trackNo % liveSongList.length;
    music.src = trackNo >= songList.length ? src(trackNo) : path(trackNo);
    musicProgressBar.value = 0;
    clearInterval(interval);
    handlePlay();
    TrackIndicator(trackNo);
};

//Function to play next track 
function AutoPlay() {
    // console.log('checking for auto play');
    if (music.currentTime >= music.duration) {
        handleTrack(1);
        handleIntervalTimers();
    }
};

//Function to play indivisual song by index
function playsongByIndex(val) {
    trackNo = val;
    music.src = trackNo >= songList.length ? src(trackNo) : path(trackNo);
    musicProgressBar.value = 0;
    clearInterval(interval);
    handlePlay();
    handleIntervalTimers();
    TrackIndicator(trackNo);
};

//Highlight the song which is playing
function TrackIndicator(track) {
    if (currentTrack) {
        currentTrack.classList.remove('current-track-indicator');
        currentTrack.classList.add('bg-none');

    }
    let btn = document.querySelectorAll('.play-music')[track];
    currentTrack = btn.parentNode.parentNode;
    TrackTitle.textContent = currentTrack.children[0].textContent;
    currentTrack.classList.add('current-track-indicator');
};

//Progress Bar Progression
function handleProgressBar() {
    let val = +musicProgressBar.value + 100 / music.duration;
    musicProgressBar.value = val;
    // console.log(val);
};

//chcekcing status
function handleIntervalTimers() {
    if (!music.paused) {
        interval = setInterval(() => {
            handleProgressBar();
            AutoPlay();
        }, 1000);
    } else {
        clearInterval(interval);
    }
};

//Control the volume
function handleVolume() {
    let classes = IconVolume.classList;
    if (music.volume !== 0) {
        prevVolume = music.volume;
        music.volume = 0;
        volume.value = 0;
        classes.remove('fa-volume-off');
        classes.add('fa-volume-xmark');
    } else {
        music.volume = prevVolume;
        volume.value = prevVolume * 100;
        classes.remove('fa-volume-xmark');
        classes.add('fa-volume-off');
    }
}

//Convert file into base64
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            let obj = {
                title: file.name,
                size: (file.size / 1000000).toFixed(2) + ' mb',
                src: reader.result
            }
            return resolve(obj);
        };
        reader.onerror = (err) => reject(err);
    });
}