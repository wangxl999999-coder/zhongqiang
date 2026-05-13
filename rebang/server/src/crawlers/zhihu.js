const axios = require('axios');

async function crawlZhihuHot() {
  try {
    const response = await axios.get('https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const items = response.data.data || [];
    
    return items.map((item, index) => ({
      title: item.target.title,
      description: item.target.excerpt || '',
      url: `https://www.zhihu.com/question/${item.target.id}`,
      hot_value: item.detail_text ? parseInt(item.detail_text.replace(/[^\d]/g, '')) || 0 : 0,
      rank: index + 1,
      category: classifyCategory(item.target.title),
      image_url: item.children?.[0]?.thumbnail || ''
    }));
  } catch (error) {
    console.error('知乎热榜爬取失败:', error.message);
    return getMockData('知乎');
  }
}

function classifyCategory(title) {
  const keywords = {
    '娱乐': ['明星', '综艺', '电影', '电视', '音乐', '演唱会', '演员', '歌手', '娱乐'],
    '科技': ['AI', '人工智能', '芯片', '手机', '电脑', '科技', '互联网', '程序员', '算法', 'GPT', '机器人'],
    '财经': ['股票', '基金', '经济', '金融', '银行', '投资', '理财', '房价', '股市', 'A股'],
    '社会': ['事故', '案件', '警方', '政府', '政策', '社会', '民生', '交通', '教育'],
    '体育': ['足球', '篮球', 'NBA', 'CBA', '世界杯', '奥运会', '运动', '比赛', '冠军'],
    '游戏': ['游戏', '电竞', '玩家', 'Steam', '手游', '端游', '网游'],
    '职场': ['工作', '面试', '薪资', '裁员', '求职', '职场', '加班', '公司', '老板']
  };

  for (const [category, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (title.includes(word)) {
        return category;
      }
    }
  }
  
  return '其他';
}

function getMockData(platform) {
  const mockTitles = [
    `${platform}热门话题1：人工智能最新进展`,
    `${platform}热门话题2：2024年经济趋势分析`,
    `${platform}热门话题3：科技巨头发布新产品`,
    `${platform}热门话题4：娱乐圈重大新闻`,
    `${platform}热门话题5：体育赛事精彩回顾`,
    `${platform}热门话题6：社会民生热点讨论`,
    `${platform}热门话题7：游戏行业新动态`,
    `${platform}热门话题8：职场生存技巧`,
    `${platform}热门话题9：投资理财建议`,
    `${platform}热门话题10：科技创新突破`
  ];

  return mockTitles.map((title, index) => ({
    title,
    description: `这是${platform}的热门话题描述，包含了最新的讨论内容。`,
    url: `https://example.com/hot/${index + 1}`,
    hot_value: Math.floor(Math.random() * 1000000) + 100000,
    rank: index + 1,
    category: classifyCategory(title),
    image_url: ''
  }));
}

module.exports = { crawlZhihuHot, classifyCategory };
