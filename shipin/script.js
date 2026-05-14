const videoData = [
    {
        id: 1,
        title: "Big Buck Bunny",
        cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Big%20Buck%20Bunny%20animated%20movie%20cartoon%20rabbit&image_size=square_hd",
        category: "电影",
        categoryKey: "movie",
        time: "2008",
        desc: "Blender基金会出品的开源动画短片，讲述一只巨大的兔子与三只调皮的啮齿动物之间的有趣故事。",
        videoUrl: "https://www.youtube.com/embed/YE7VzlLtp-4"
    },
    {
        id: 2,
        title: "Sintel",
        cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Sintel%20fantasy%20animation%20dragon%20girl%20epic&image_size=square_hd",
        category: "动漫",
        categoryKey: "anime",
        time: "2010",
        desc: "一个女孩寻找她失踪的龙的感人故事，Blender开源电影项目。",
        videoUrl: "https://www.youtube.com/embed/eRsGyueVLvQ"
    },
    {
        id: 3,
        title: "Tears of Steel",
        cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Tears%20of%20Steel%20sci-fi%20robot%20future%20action&image_size=square_hd",
        category: "电影",
        categoryKey: "movie",
        time: "2012",
        desc: "Blender基金会出品的科幻短片，真人与CG结合的精彩作品。",
        videoUrl: "https://www.youtube.com/embed/R6NJlG1xlq0"
    },
    {
        id: 4,
        title: "Cosmos Laundromat",
        cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Cosmos%20Laundromat%20sheep%20colorful%20surreal%20animation&image_size=square_hd",
        category: "动漫",
        categoryKey: "anime",
        time: "2015",
        desc: "一只想要自杀的绵羊的奇妙冒险，Blender开源动画项目。",
        videoUrl: "https://player.vimeo.com/video/142850195"
    },
    {
        id: 5,
        title: "Spring - Blender Open Movie",
        cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Spring%20animation%20forest%20nature%20beautiful%20artistic&image_size=square_hd",
        category: "动漫",
        categoryKey: "anime",
        time: "2019",
        desc: "Blender基金会最新开源动画，讲述春天与自然的美丽故事。",
        videoUrl: "https://www.youtube.com/embed/9v412fZ7Qm0"
    },
    {
        id: 6,
        title: "Nature Documentary HD",
        cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=BBC%20Planet%20Earth%20nature%20documentary%20beautiful%20landscape%20mountains%20forest&image_size=square_hd",
        category: "纪录片",
        categoryKey: "documentary",
        time: "2023",
        desc: "探索地球上最壮观的自然景观和野生动物，领略地球之美。",
        videoUrl: "https://www.youtube.com/embed/LFqayacgk80"
    },
    {
        id: 7,
        title: "Amazing Nature",
        cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=amazing%20nature%20waterfall%20forest%20sunset%20beautiful&image_size=square_hd",
        category: "纪录片",
        categoryKey: "documentary",
        time: "2024",
        desc: "4K超高清自然纪录片，展示地球上最令人惊叹的自然奇观。",
        videoUrl: "https://www.youtube.com/embed/6GJ2k0n-BQ0"
    },
    {
        id: 8,
        title: "Ocean Life Documentary",
        cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ocean%20life%20underwater%20coral%20reef%20fish%20colorful&image_size=square_hd",
        category: "纪录片",
        categoryKey: "documentary",
        time: "2023",
        desc: "探索神秘的海底世界，了解各种海洋生物的生活习性。",
        videoUrl: "https://www.youtube.com/embed/8Zjg3QoX7g0"
    },
    {
        id: 9,
        title: "Cooking Tutorial - Pasta",
        cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Italian%20pasta%20cooking%20chef%20kitchen%20delicious%20food&image_size=square_hd",
        category: "综艺",
        categoryKey: "variety",
        time: "2024",
        desc: "意大利名厨教你制作正宗的意大利面，简单又美味！",
        videoUrl: "https://www.youtube.com/embed/3w3z71jv5Lw"
    },
    {
        id: 10,
        title: "Travel Vlog - Japan",
        cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japan%20travel%20tokyo%20cherry%20blossom%20temple%20culture&image_size=square_hd",
        category: "综艺",
        categoryKey: "variety",
        time: "2024",
        desc: "跟随博主的镜头，探索日本的美丽风景和独特文化。",
        videoUrl: "https://www.youtube.com/embed/9ZfN8jUyFjI"
    },
    {
        id: 11,
        title: "Science Explained",
        cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=science%20education%20laboratory%20experiment%20learning&image_size=square_hd",
        category: "电视剧",
        categoryKey: "tv",
        time: "2024",
        desc: "用简单易懂的方式解释复杂的科学原理，寓教于乐。",
        videoUrl: "https://www.youtube.com/embed/76dZfX7Qz7k"
    },
    {
        id: 12,
        title: "Music Live Concert",
        cover: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=music%20concert%20live%20stage%20performance%20band&image_size=square_hd",
        category: "综艺",
        categoryKey: "variety",
        time: "2024",
        desc: "精彩的现场音乐会，感受音乐的魅力和激情。",
        videoUrl: "https://www.youtube.com/embed/5qap5aO4i9A"
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
    
    videoPlayer.src = video.videoUrl;
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
    videoPlayer.src = '';
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
