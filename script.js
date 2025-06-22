document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const trackNameEl = document.querySelector('.track-name');
    const coverImg = document.querySelector('.cover-img');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const volumeBtn = document.getElementById('volume-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const progressBar = document.querySelector('.progress-bar');
    const progressContainer = document.querySelector('.progress-container');
    const currentTimeEl = document.querySelector('.current-time');
    const totalDurationEl = document.querySelector('.total-duration');
    const waveform = document.querySelector('.waveform');
    const themeToggle = document.getElementById('theme-toggle');

    let audio;
    let playlist = [];
    let currentTrackIndex = 0;
    let isPlaying = false;
    let isMuted = false;
    let lastVolume = 1;

    // Create waveform bars
    for (let i = 0; i < 50; i++) {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.animationDelay = `${i * 0.05}s`;
        waveform.appendChild(bar);
    }
    const waveformBars = document.querySelectorAll('.waveform .bar');

    // Background gradients for different moods/genres
    const backgroundGradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple/Blue
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink/Red
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue/Cyan
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green/Cyan
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Pink/Yellow
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Mint/Pink
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', // Coral/Pink
        'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // Orange/Peach
        'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)', // Pink/Peach
        'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', // Purple/Pink
        'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)', // Peach/Pink
        'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // Cream/Orange
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple/Blue
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink/Red
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'  // Blue/Cyan
    ];

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }   
    
    function changeBackground(trackName) {
        // Generate a consistent index based on track name
        let hash = 0;
        for (let i = 0; i < trackName.length; i++) {
            const char = trackName.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        const gradientIndex = Math.abs(hash) % backgroundGradients.length;
        const gradient = backgroundGradients[gradientIndex];
        
        // Apply the gradient to body background
        document.body.style.background = gradient;
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.backgroundSize = 'cover';
        
        // Add a subtle animation
        document.body.style.transition = 'background 1s ease-in-out';
        
        // Also change the cover image to match the theme
        const coverImages = [
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop'
        ];
        
        const coverIndex = Math.abs(hash) % coverImages.length;
        coverImg.src = coverImages[coverIndex];
        coverImg.style.transition = 'opacity 0.5s ease-in-out';
        
        // Add a subtle pulse effect to the cover
        coverImg.style.animation = 'pulse 2s infinite';
    }
    
    function loadTrack(index) {
        if (playlist.length === 0) return;
        
        currentTrackIndex = index;
        const track = playlist[currentTrackIndex];
        
        if (audio) {
            audio.src = URL.createObjectURL(track);
            audio.load();
        } else {
            audio = new Audio(URL.createObjectURL(track));
            setupAudioListeners();
        }
        
        trackNameEl.textContent = track.name.replace('.mp3', '');
        
        // Change background based on the track
        changeBackground(track.name);
        
        playTrack();
    }
    
    function setupAudioListeners() {
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', () => {
            totalDurationEl.textContent = formatTime(audio.duration);
        });
        audio.addEventListener('ended', nextTrack);
    }
    
    function playTrack() {
        isPlaying = true;
        audio.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        waveformBars.forEach(bar => bar.style.animationPlayState = 'running');
    }

    function pauseTrack() {
        isPlaying = false;
        audio.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        waveformBars.forEach(bar => bar.style.animationPlayState = 'paused');
    }

    function prevTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrackIndex);
    }

    function nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(currentTrackIndex);
    }
    
    function updateProgress() {
        if (audio.duration) {
            const progressPercent = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
            currentTimeEl.textContent = formatTime(audio.currentTime);
        }
    }
    
    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        audio.currentTime = (clickX / width) * duration;
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function toggleVolume() {
        if (!audio) return;
        isMuted = !isMuted;
        if (isMuted) {
            lastVolume = audio.volume;
            audio.volume = 0;
            volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            volumeSlider.value = 0;
        } else {
            audio.volume = lastVolume;
            volumeBtn.innerHTML = getVolumeIcon(lastVolume);
            volumeSlider.value = lastVolume;
        }
    }

    function setVolume(e) {
        if (!audio) return;
        const volume = e.target.value;
        audio.volume = volume;
        lastVolume = volume;
        isMuted = volume === 0;
        volumeBtn.innerHTML = getVolumeIcon(volume);
    }

    function getVolumeIcon(volume) {
        if (volume == 0) return '<i class="fas fa-volume-mute"></i>';
        if (volume < 0.5) return '<i class="fas fa-volume-low"></i>';
        return '<i class="fas fa-volume-high"></i>';
    }

    // Event Listeners
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        playlist = files;
        loadTrack(0);
    });

    playPauseBtn.addEventListener('click', () => {
        if (!audio) return;
        isPlaying ? pauseTrack() : playTrack();
    });

    prevBtn.addEventListener('click', prevTrack);
    nextBtn.addEventListener('click', nextTrack);
    progressContainer.addEventListener('click', setProgress);
    volumeBtn.addEventListener('click', toggleVolume);
    volumeSlider.addEventListener('input', setVolume);
    themeToggle.addEventListener('change', toggleTheme);
    
    // Set initial theme based on user preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
    }
}); 