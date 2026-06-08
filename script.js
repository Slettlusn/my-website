const playlist = [
  {
    title: "Nettles",
    artist: "Ethel Cain",
    file: "sanger/Ethel Cain - Nettles (Official Visualizer).mp3",
    image: "bilder/music player nettles.jpg"
  },
  {
    title: "Times Like These",
    artist: "Addison Rae",
    file: "sanger/Addison Rae - Times Like These (Official Lyric Video).mp3",
    image: "bilder/music player times like these.jpg"
  }
];

const musicPlayers = document.querySelectorAll("[data-music-player]");

musicPlayers.forEach((player) => {
  const audio = player.querySelector(".music-audio");
  const progress = player.querySelector(".music-progress");
  const status = player.querySelector(".music-status");
  const baseImage = player.querySelector(".music-player-base");
  const playButton = player.querySelector('[data-action="toggle"]');
  const muteButton = player.querySelector('[data-action="mute"]');
  const previousButton = player.querySelector('[data-action="previous"]');
  const nextButton = player.querySelector('[data-action="next"]');
  const stopButton = player.querySelector('[data-action="stop"]');

  if (
    !audio ||
    !progress ||
    !status ||
    !baseImage ||
    !playButton ||
    !muteButton ||
    !previousButton ||
    !nextButton ||
    !stopButton
  ) {
    return;
  }

  let currentTrackIndex = 0;

  const updateStatus = () => {
    const currentTrack = playlist[currentTrackIndex];
    const isPlaying = !audio.paused;
    const isMuted = audio.muted;

    player.classList.toggle("is-playing", isPlaying);
    player.classList.toggle("is-muted", isMuted);
    playButton.setAttribute("aria-label", isPlaying ? "Pause song" : "Play song");
    muteButton.setAttribute("aria-label", isMuted ? "Unmute audio" : "Mute audio");
    muteButton.setAttribute("aria-pressed", String(isMuted));

    if (isPlaying) {
      status.textContent = `Now playing ${currentTrack.title} by ${currentTrack.artist}.`;
      return;
    }

    if (audio.currentTime > 0 && audio.currentTime < (audio.duration || Infinity)) {
      status.textContent = `Paused on ${currentTrack.title} by ${currentTrack.artist}.`;
      return;
    }

    status.textContent = `${currentTrack.title} by ${currentTrack.artist} is ready to play.`;
  };

  const syncProgress = () => {
    if (!Number.isFinite(audio.duration)) {
      progress.max = 0;
      progress.value = 0;
      return;
    }

    progress.max = audio.duration;

    if (document.activeElement !== progress) {
      progress.value = audio.currentTime;
    }
  };

  const loadTrack = (trackIndex) => {
    currentTrackIndex = (trackIndex + playlist.length) % playlist.length;
    const currentTrack = playlist[currentTrackIndex];

    audio.src = encodeURI(currentTrack.file);
    audio.load();
    baseImage.src = currentTrack.image;
    baseImage.alt = `Retro music player mockup for ${currentTrack.title} by ${currentTrack.artist}`;
    progress.value = 0;
    progress.max = 0;
    updateStatus();
  };

  const playCurrentTrack = async () => {
    try {
      await audio.play();
    } catch (error) {
      status.textContent = "The song could not start. Try clicking play again after the page finishes loading.";
    } finally {
      updateStatus();
    }
  };

  const changeTrack = async (direction) => {
    const wasPlaying = !audio.paused;

    loadTrack(currentTrackIndex + direction);

    if (wasPlaying) {
      await playCurrentTrack();
    }
  };

  playButton.addEventListener("click", async () => {
    if (!audio.src) {
      loadTrack(currentTrackIndex);
    }

    if (audio.paused) {
      await playCurrentTrack();
      return;
    }

    audio.pause();
    updateStatus();
  });

  previousButton.addEventListener("click", async () => {
    await changeTrack(-1);
  });

  nextButton.addEventListener("click", async () => {
    await changeTrack(1);
  });

  stopButton.addEventListener("click", () => {
    audio.pause();
    audio.currentTime = 0;
    syncProgress();
    updateStatus();
  });

  muteButton.addEventListener("click", () => {
    audio.muted = !audio.muted;
    updateStatus();
  });

  progress.addEventListener("input", () => {
    if (Number.isFinite(audio.duration)) {
      audio.currentTime = Number(progress.value);
    }
  });

  audio.addEventListener("loadedmetadata", syncProgress);
  audio.addEventListener("durationchange", syncProgress);
  audio.addEventListener("timeupdate", syncProgress);
  audio.addEventListener("play", updateStatus);
  audio.addEventListener("pause", updateStatus);
  audio.addEventListener("volumechange", updateStatus);
  audio.addEventListener("ended", async () => {
    await changeTrack(1);
  });

  loadTrack(0);
  updateStatus();
});
