const videoData = [
    {
        id: 1,
        title: "Big Buck Bunny",
        cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Big%20Buck%20Bunny%20animated%20movie%20cartoon%20rabbit&image_size=square_hd",
        category: "电影",
        categoryKey: "movie",
        time: "2008",
        desc: "Blender基金会出品的开源动画短片，讲述一只巨大的兔子与三只调皮的啮齿动物之间的有趣故事。",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        videoType: "video/mp4"
    },
    {
        id: 2,
        title: "Elephant Dream",
        cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Elephant%20Dream%20surreal%20animation%20fantasy%20artistic&image_size=square_hd",
        category: "动漫",
        categoryKey: "anime",
        time: "2006",
        desc: "世界上第一部开源电影，一部超现实主义的动画短片。",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        videoType: "video/mp4"
    },
    {
        id: 3,
        title: "For Bigger Blazes",
        cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=action%20movie%20explosion%20thriller%20intense&image_size=square_hd",
        category: "电影",
        categoryKey: "movie",
        time: "2020",
        desc: "一部激动人心的动作短片，展现精彩的视觉效果。",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        videoType: "video/mp4"
    },
    {
        id: 4,
        title: "For Bigger Escapes",
        cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=escape%20adventure%20thriller%20exciting%20chase&image_size=square_hd",
        category: "电影",
        categoryKey: "movie",
        time: "2020",
        desc: "紧张刺激的逃亡冒险，精彩的追逐场面。",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        videoType: "video/mp4"
    },
    {
        id: 5,
        title: "For Bigger Fun",
        cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=comedy%20fun%20joyful%20entertainment%20happy&image_size=square_hd",
        category: "综艺",
        categoryKey: "variety",
        time: "2020",
        desc: "欢乐有趣的娱乐短片，让你开心一笑。",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        videoType: "video/mp4"
    },
    {
        id: 6,
        title: "For Bigger Joyrides",
        cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=racing%20car%20speed%20fast%20exciting&image_size=square_hd",
        category: "综艺",
        categoryKey: "variety",
        time: "2020",
        desc: "极速赛车体验，感受速度与激情。",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        videoType: "video/mp4"
    },
    {
        id: 7,
        title: "For Bigger Meltdowns",
        cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=disaster%20drama%20intense%20emotional%20powerful&image_size=square_hd",
        category: "电视剧",
        categoryKey: "tv",
        time: "2020",
        desc: "震撼的灾难场景，展现人性的力量。",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
        videoType: "video/mp4"
    },
    {
        id: 8,
        title: "Sintel",
        cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Sintel%20fantasy%20animation%20dragon%20girl%20epic&image_size=square_hd",
        category: "动漫",
        categoryKey: "anime",
        time: "2010",
        desc: "一个女孩寻找她失踪的龙的感人故事，Blender开源电影项目。",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        videoType: "video/mp4"
    },
    {
        id: 9,
        title: "Subaru Outback",
        cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=car%20commercial%20subaru%20outback%20adventure&image_size=square_hd",
        category: "纪录片",
        categoryKey: "documentary",
        time: "2020",
        desc: "精彩的汽车广告，展现户外冒险精神。",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
        videoType: "video/mp4"
    },
    {
        id: 10,
        title: "Tears of Steel",
        cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Tears%20of%20Steel%20sci-fi%20robot%20future%20action&image_size=square_hd",
        category: "电影",
        categoryKey: "movie",
        time: "2012",
        desc: "Blender基金会出品的科幻短片，真人与CG结合的精彩作品。",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        videoType: "video/mp4"
    },
    {
        id: 11,
        title: "Volkswagen GTI",
        cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=volkswagen%20gti%20car%20racing%20performance&image_size=square_hd",
        category: "纪录片",
        categoryKey: "documentary",
        time: "2020",
        desc: "大众GTI精彩广告，展现汽车性能魅力。",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
        videoType: "video/mp4"
    },
    {
        id: 12,
        title: "We Are Going On Bullrun",
        cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bullrun%20adventure%20racing%20exciting%20journey&image_size=square_hd",
        category: "综艺",
        categoryKey: "variety",
        time: "2020",
        desc: "激动人心的赛车冒险之旅，充满挑战与惊喜。",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
        videoType: "video/mp4"
    }
];

const videoGrid = document.getElementById('videoGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categoryBtns = document.querySelectorAll('.category-btn');
const videoModal = document.getElementById('videoModal');
const closeModal = document.getElementById('closeModal');
const videoPlayer = document.getElementById('videoPlayer');
const modalTitle = document.getElementById('modalTitle');
const modalCategory = document.getElementById('modalCategory');
const modalTime = document.getElementById('modalTime');
const modalDesc = document.getElementById('modalDesc');

let currentCategory = 'all';
let searchKeyword = '';

function renderVideos(videos) {
    if (videos.length === 0) {
        videoGrid.innerHTML = `
            <div class="no-results">
                <span>😢</span>
                <p>没有找到相关视频</p>
            </div>
        `;
        return;
    }

    videoGrid.innerHTML = videos.map(video => `
        <div class="video-card" data-id="${video.id}">
            <div class="video-cover-container">
                <img src="${video.cover}" alt="${video.title}" class="video-cover">
            </div>
            <div class="video-info">
                <h3 class="video-title">${video.title}</h3>
                <div class="video-meta">
                    <span class="video-category">${video.category}</span>
                    <span>${video.time}</span>
                </div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.video-card').forEach(card => {
        card.addEventListener('click', () => {
            const videoId = parseInt(card.dataset.id);
            openVideoModal(videoId);
        });
    });
}

function filterVideos() {
    let filtered = videoData;

    if (currentCategory !== 'all') {
        filtered = filtered.filter(video => video.categoryKey === currentCategory);
    }

    if (searchKeyword) {
        filtered = filtered.filter(video => 
            video.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            video.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            video.desc.toLowerCase().includes(searchKeyword.toLowerCase())
        );
    }

    renderVideos(filtered);
}

function openVideoModal(videoId) {
    const video = videoData.find(v => v.id === videoId);
    if (!video) return;

    modalTitle.textContent = video.title;
    modalCategory.textContent = video.category;
    modalTime.textContent = video.time;
    modalDesc.textContent = video.desc;
    
    const loadingHtml = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#fff;font-size:18px;"><div class="spinner" style="border:4px solid rgba(255,255,255,0.3);border-top:4px solid #ff6b6b;border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite;margin-right:15px;"></div>视频加载中...</div>';
    
    const playerContainer = document.querySelector('.video-player-container');
    
    playerContainer.innerHTML = loadingHtml;
    
    const videoElement = document.createElement('video');
    videoElement.id = 'videoPlayer';
    videoElement.style.width = '100%';
    videoElement.style.height = '100%';
    videoElement.style.borderRadius = '15px';
    videoElement.controls = true;
    videoElement.autoplay = true;
    videoElement.preload = 'auto';
    
    const sourceElement = document.createElement('source');
    sourceElement.src = video.videoUrl;
    sourceElement.type = video.videoType || 'video/mp4';
    
    videoElement.appendChild(sourceElement);
    
    videoElement.onloadeddata = function() {
        playerContainer.innerHTML = '';
        playerContainer.appendChild(videoElement);
    };
    
    videoElement.onerror = function() {
        playerContainer.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#fff;text-align:center;padding:20px;"><span style="font-size:50px;margin-bottom:15px;">⚠️</span><p>视频加载失败，请稍后重试</p><p style="font-size:14px;color:rgba(255,255,255,0.6);margin-top:10px;">可能是网络问题或视频源不可用</p></div>';
    };
    
    setTimeout(() => {
        if (playerContainer.querySelector('.spinner')) {
            playerContainer.appendChild(videoElement);
        }
    }, 3000);
    
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function getBilibiliUrl(bvid) {
    return `https://player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&danmaku=0`;
}

function getVimeoUrl(videoId) {
    return `https://player.vimeo.com/video/${videoId}`;
}

function getDailymotionUrl(videoId) {
    return `https://www.dailymotion.com/embed/video/${videoId}`;
}

function closeVideoModal() {
    videoModal.classList.remove('active');
    const currentVideo = document.getElementById('videoPlayer');
    if (currentVideo) {
        currentVideo.pause();
        currentVideo.src = '';
    }
    document.body.style.overflow = '';
}

categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        filterVideos();
    });
});

searchBtn.addEventListener('click', () => {
    searchKeyword = searchInput.value.trim();
    filterVideos();
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchKeyword = searchInput.value.trim();
        filterVideos();
    }
});

closeModal.addEventListener('click', closeVideoModal);

videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) {
        closeVideoModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal.classList.contains('active')) {
        closeVideoModal();
    }
});

renderVideos(videoData);
