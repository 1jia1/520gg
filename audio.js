class AudioManager {
    constructor() {
        this.bgm = new Audio('sounds/bgm.mp3');
        this.moveSound = new Audio('sounds/move.mp3');
        this.rotateSound = new Audio('sounds/rotate.mp3');
        this.dropSound = new Audio('sounds/drop.mp3');
        this.clearSound = new Audio('sounds/clear.mp3');
        
        // 设置背景音乐循环播放
        this.bgm.loop = true;
        this.isMuted = false;
        
        // 初始化音量
        this.bgm.volume = 0.5;
        this.moveSound.volume = 0.6;
        this.rotateSound.volume = 0.6;
        this.dropSound.volume = 0.6;
        this.clearSound.volume = 0.6;
        
        this.initAudioControls();
    }

    initAudioControls() {
        const toggleBtn = document.getElementById('toggleBGM');
        const volumeSlider = document.getElementById('volumeSlider');

        toggleBtn.addEventListener('click', () => {
            this.isMuted = !this.isMuted;
            if (this.isMuted) {
                this.bgm.pause();
                toggleBtn.textContent = '音乐: 关';
            } else {
                this.bgm.play();
                toggleBtn.textContent = '音乐: 开';
            }
        });

        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            this.bgm.volume = volume;
            this.moveSound.volume = volume;
            this.rotateSound.volume = volume;
            this.dropSound.volume = volume;
            this.clearSound.volume = volume;
        });
    }

    playBGM() {
        this.bgm.play().catch(e => console.log('BGM播放失败:', e));
    }

    stopBGM() {
        this.bgm.pause();
        this.bgm.currentTime = 0;
    }

    playMove() {
        this.moveSound.currentTime = 0;
        this.moveSound.play().catch(e => console.log('移动音效播放失败:', e));
    }

    playRotate() {
        this.rotateSound.currentTime = 0;
        this.rotateSound.play().catch(e => console.log('旋转音效播放失败:', e));
    }

    playDrop() {
        this.dropSound.currentTime = 0;
        this.dropSound.play().catch(e => console.log('落地音效播放失败:', e));
    }

    playClear() {
        this.clearSound.currentTime = 0;
        this.clearSound.play().catch(e => console.log('消除音效播放失败:', e));
    }

    setVolume(volume) {
        this.bgm.volume = volume;
        this.moveSound.volume = volume;
        this.rotateSound.volume = volume;
        this.dropSound.volume = volume;
        this.clearSound.volume = volume;
    }
}

const audioManager = new AudioManager();
export default audioManager;