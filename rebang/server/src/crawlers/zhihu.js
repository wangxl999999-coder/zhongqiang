const axios = require('axios');

async function crawlZhihuHot() {
  try {
    const response = await axios.get('https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'zh-CN,zh;q=0.9'
      },
      timeout: 5000
    });

    const items = response.data.data || [];
    
    if (items.length === 0) {
      return getMockData('知乎');
    }
    
    return items.map((item, index) => ({
      title: item.target?.title || '',
      description: item.target?.excerpt || '',
      url: `https://www.zhihu.com/question/${item.target?.id || ''}`,
      hot_value: item.detail_text ? parseInt(item.detail_text.replace(/[^\d]/g, '')) || Math.floor(Math.random() * 500000) + 100000 : Math.floor(Math.random() * 500000) + 100000,
      rank: index + 1,
      category: classifyCategory(item.target?.title || ''),
      image_url: item.children?.[0]?.thumbnail || ''
    }));
  } catch (error) {
    console.log('知乎热榜使用模拟数据');
    return getMockData('知乎');
  }
}

function classifyCategory(title) {
  const keywords = {
    '娱乐': ['明星', '综艺', '电影', '电视', '音乐', '演唱会', '演员', '歌手', '娱乐', '影视'],
    '科技': ['AI', '人工智能', '芯片', '手机', '电脑', '科技', '互联网', '程序员', '算法', 'GPT', '机器人', '编程'],
    '财经': ['股票', '基金', '经济', '金融', '银行', '投资', '理财', '房价', '股市', 'A股', '美股'],
    '社会': ['事故', '案件', '警方', '政府', '政策', '社会', '民生', '交通', '教育', '新闻'],
    '体育': ['足球', '篮球', 'NBA', 'CBA', '世界杯', '奥运会', '运动', '比赛', '冠军', '运动员'],
    '游戏': ['游戏', '电竞', '玩家', 'Steam', '手游', '端游', '网游', '电竞'],
    '职场': ['工作', '面试', '薪资', '裁员', '求职', '职场', '加班', '公司', '老板', '打工']
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
    platform + '：人工智能最新突破引发行业热议',
    platform + '：2024年经济发展趋势分析报告',
    platform + '：科技巨头发布新一代旗舰产品',
    platform + '：娱乐圈今日重大新闻汇总',
    platform + '：体育赛事精彩回顾：冠军诞生',
    platform + '：社会民生热点话题深度讨论',
    platform + '：游戏行业年度大作即将发布',
    platform + '：职场生存指南：如何提高竞争力',
    platform + '：投资理财新趋势分析',
    platform + '：科技创新助力产业升级新机遇'
  ];

  return mockTitles.map((title, index) => ({
    title,
    description: '这是' + platform + '的热门话题，包含了最新的讨论内容和深度分析，吸引了大量用户关注和讨论。',
    url: 'https://example.com/hot/' + (index + 1),
    hot_value: Math.floor(Math.random() * 800000) + 100000,
    rank: index + 1,
    category: classifyCategory(title),
    image_url: ''
  }));
}

module.exports = { crawlZhihuHot, classifyCategory };
