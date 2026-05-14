import { Dynasty, HistoricalEvent, Person, Relationship, War, MapItem, Document } from '../types/history'

export const dynasties: Dynasty[] = [
  {
    id: 'xia',
    name: '夏朝',
    startYear: -2070,
    endYear: -1600,
    color: '#8B4513',
    capital: '阳城',
    description: '中国历史上第一个世袭制朝代，标志着中国从原始社会进入奴隶社会。',
    emperors: ['大禹', '启', '太康', '少康', '桀']
  },
  {
    id: 'shang',
    name: '商朝',
    startYear: -1600,
    endYear: -1046,
    color: '#CD853F',
    capital: '殷',
    description: '中国历史上第二个朝代，甲骨文是其重要文化标志。',
    emperors: ['成汤', '盘庚', '武丁', '纣']
  },
  {
    id: 'zhou',
    name: '周朝',
    startYear: -1046,
    endYear: -256,
    color: '#DAA520',
    capital: '镐京、洛邑',
    description: '中国历史上最长的朝代，分为西周和东周，礼乐制度成熟。',
    emperors: ['周武王', '周成王', '周幽王', '周平王']
  },
  {
    id: 'qin',
    name: '秦朝',
    startYear: -221,
    endYear: -206,
    color: '#2F4F4F',
    capital: '咸阳',
    description: '中国历史上第一个大一统王朝，统一文字、度量衡。',
    emperors: ['秦始皇', '秦二世']
  },
  {
    id: 'han',
    name: '汉朝',
    startYear: -202,
    endYear: 220,
    color: '#B22222',
    capital: '长安、洛阳',
    description: '中国历史上强盛的朝代之一，开辟丝绸之路，儒家成为正统。',
    emperors: ['汉高祖', '汉武帝', '光武帝', '汉献帝']
  },
  {
    id: 'tang',
    name: '唐朝',
    startYear: 618,
    endYear: 907,
    color: '#FFD700',
    capital: '长安',
    description: '中国历史上最辉煌的朝代之一，诗歌繁荣，国力强盛。',
    emperors: ['唐高祖', '唐太宗', '武则天', '唐玄宗']
  },
  {
    id: 'song',
    name: '宋朝',
    startYear: 960,
    endYear: 1279,
    color: '#4169E1',
    capital: '开封、临安',
    description: '经济文化高度繁荣，科技发达，宋词鼎盛。',
    emperors: ['宋太祖', '宋神宗', '宋高宗']
  },
  {
    id: 'ming',
    name: '明朝',
    startYear: 1368,
    endYear: 1644,
    color: '#DC143C',
    capital: '南京、北京',
    description: '最后一个由汉族建立的大一统王朝，郑和下西洋，小说繁荣。',
    emperors: ['明太祖', '明成祖', '崇祯帝']
  },
  {
    id: 'qing',
    name: '清朝',
    startYear: 1644,
    endYear: 1912,
    color: '#FF6347',
    capital: '北京',
    description: '中国最后一个封建王朝，康乾盛世，后期沦为半殖民地半封建社会。',
    emperors: ['康熙', '雍正', '乾隆', '光绪', '宣统']
  }
]

export const events: HistoricalEvent[] = [
  {
    id: 'dayu-water-control',
    title: '大禹治水',
    year: -2100,
    type: 'culture',
    dynasty: 'xia',
    location: '黄河流域',
    description: '大禹率领民众治理洪水，三过家门而不入，最终成功治水。',
    relatedPeople: ['大禹'],
    relatedEvents: []
  },
  {
    id: 'zhou-wang-fa-zhou',
    title: '武王伐纣',
    year: -1046,
    type: 'war',
    dynasty: 'zhou',
    location: '牧野',
    description: '周武王姬发率领诸侯联军，在牧野之战中击败商纣王，建立周朝。',
    relatedPeople: ['周武王', '姜子牙', '商纣王'],
    relatedEvents: []
  },
  {
    id: 'spring-autumn',
    title: '春秋时期',
    year: -770,
    type: 'dynasty',
    dynasty: 'zhou',
    description: '周平王东迁后，诸侯争霸，百家争鸣开始。',
    relatedPeople: ['孔子', '老子', '齐桓公'],
    relatedEvents: []
  },
  {
    id: 'qin-unification',
    title: '秦始皇统一中国',
    year: -221,
    type: 'dynasty',
    dynasty: 'qin',
    location: '全国',
    description: '秦王嬴政统一六国，建立中国历史上第一个大一统王朝。',
    relatedPeople: ['秦始皇', '李斯'],
    relatedEvents: []
  },
  {
    id: 'great-wall',
    title: '修筑万里长城',
    year: -214,
    type: 'culture',
    dynasty: 'qin',
    location: '北方边境',
    description: '秦始皇下令连接和修缮战国长城，抵御匈奴入侵。',
    relatedPeople: ['秦始皇', '蒙恬'],
    relatedEvents: ['qin-unification']
  },
  {
    id: 'chu-han-contention',
    title: '楚汉之争',
    year: -206,
    type: 'war',
    dynasty: 'han',
    location: '中原地区',
    description: '项羽和刘邦为争夺天下而进行的四年战争。',
    relatedPeople: ['刘邦', '项羽', '韩信', '张良'],
    relatedEvents: []
  },
  {
    id: 'han-founding',
    title: '汉朝建立',
    year: -202,
    type: 'dynasty',
    dynasty: 'han',
    location: '长安',
    description: '刘邦在楚汉之争中获胜，建立汉朝，史称西汉。',
    relatedPeople: ['刘邦', '萧何'],
    relatedEvents: ['chu-han-contention']
  },
  {
    id: 'silk-road',
    title: '张骞出使西域',
    year: -138,
    type: 'culture',
    dynasty: 'han',
    location: '西域',
    description: '张骞两次出使西域，开辟了丝绸之路。',
    relatedPeople: ['张骞', '汉武帝'],
    relatedEvents: []
  },
  {
    id: 'battle-of-red-cliffs',
    title: '赤壁之战',
    year: 208,
    type: 'war',
    dynasty: 'han',
    location: '赤壁',
    description: '孙刘联军在赤壁大败曹操，奠定三国鼎立基础。',
    relatedPeople: ['曹操', '刘备', '孙权', '周瑜', '诸葛亮'],
    relatedEvents: []
  },
  {
    id: 'tang-founding',
    title: '唐朝建立',
    year: 618,
    type: 'dynasty',
    dynasty: 'tang',
    location: '长安',
    description: '李渊在长安称帝，建立唐朝。',
    relatedPeople: ['李渊', '李世民'],
    relatedEvents: []
  },
  {
    id: 'zhenguan-zhizhi',
    title: '贞观之治',
    year: 627,
    type: 'dynasty',
    dynasty: 'tang',
    description: '唐太宗李世民统治时期，政治清明，经济繁荣。',
    relatedPeople: ['唐太宗', '魏征', '房玄龄'],
    relatedEvents: ['tang-founding']
  },
  {
    id: 'wu-zetian-emperor',
    title: '武则天称帝',
    year: 690,
    type: 'emperor',
    dynasty: 'tang',
    location: '洛阳',
    description: '武则天改唐为周，成为中国历史上唯一的女皇帝。',
    relatedPeople: ['武则天'],
    relatedEvents: ['zhenguan-zhizhi']
  },
  {
    id: 'kaiyuan-shengshi',
    title: '开元盛世',
    year: 713,
    type: 'dynasty',
    dynasty: 'tang',
    description: '唐玄宗统治前期，唐朝达到鼎盛。',
    relatedPeople: ['唐玄宗', '姚崇', '宋璟'],
    relatedEvents: ['wu-zetian-emperor']
  },
  {
    id: 'an-shi-rebellion',
    title: '安史之乱',
    year: 755,
    type: 'war',
    dynasty: 'tang',
    location: '北方地区',
    description: '安禄山和史思明发动叛乱，唐朝由盛转衰。',
    relatedPeople: ['安禄山', '史思明', '郭子仪'],
    relatedEvents: ['kaiyuan-shengshi']
  },
  {
    id: 'song-founding',
    title: '陈桥兵变',
    year: 960,
    type: 'dynasty',
    dynasty: 'song',
    location: '陈桥驿',
    description: '赵匡胤发动兵变，黄袍加身，建立宋朝。',
    relatedPeople: ['宋太祖', '赵普'],
    relatedEvents: []
  },
  {
    id: 'wang-anshi-reform',
    title: '王安石变法',
    year: 1069,
    type: 'culture',
    dynasty: 'song',
    description: '王安石推行变法，富国强兵。',
    relatedPeople: ['王安石', '宋神宗', '司马光'],
    relatedEvents: ['song-founding']
  },
  {
    id: 'yue-fei-northern-expedition',
    title: '岳飞北伐',
    year: 1140,
    type: 'war',
    dynasty: 'song',
    location: '中原地区',
    description: '岳飞率领岳家军北伐，收复失地。',
    relatedPeople: ['岳飞', '秦桧', '宋高宗'],
    relatedEvents: []
  },
  {
    id: 'ming-founding',
    title: '明朝建立',
    year: 1368,
    type: 'dynasty',
    dynasty: 'ming',
    location: '南京',
    description: '朱元璋在应天称帝，建立明朝，随后北伐驱逐元廷。',
    relatedPeople: ['明太祖', '刘伯温', '徐达'],
    relatedEvents: []
  },
  {
    id: 'zheng-he-voyages',
    title: '郑和下西洋',
    year: 1405,
    type: 'culture',
    dynasty: 'ming',
    location: '东南亚、印度洋',
    description: '郑和率领船队七次下西洋，加强中外交流。',
    relatedPeople: ['郑和', '明成祖'],
    relatedEvents: ['ming-founding']
  },
  {
    id: 'qing-founding',
    title: '清朝入关',
    year: 1644,
    type: 'dynasty',
    dynasty: 'qing',
    location: '北京',
    description: '清军入关，定都北京，开始对全国的统治。',
    relatedPeople: ['顺治帝', '多尔衮', '吴三桂'],
    relatedEvents: []
  },
  {
    id: 'kangxi-empire',
    title: '康乾盛世',
    year: 1661,
    type: 'dynasty',
    dynasty: 'qing',
    description: '康熙、雍正、乾隆三朝，清朝达到鼎盛。',
    relatedPeople: ['康熙', '雍正', '乾隆'],
    relatedEvents: ['qing-founding']
  },
  {
    id: 'opium-war',
    title: '鸦片战争',
    year: 1840,
    type: 'war',
    dynasty: 'qing',
    location: '东南沿海',
    description: '英国发动鸦片战争，中国开始沦为半殖民地半封建社会。',
    relatedPeople: ['林则徐', '道光帝'],
    relatedEvents: []
  }
]

export const people: Person[] = [
  {
    id: 'confucius',
    name: '孔子',
    birthYear: -551,
    deathYear: -479,
    dynasty: 'zhou',
    category: 'thinker',
    identity: '思想家、教育家',
    birthplace: '鲁国陬邑',
    mainAchievements: ['创立儒家学派', '编纂《春秋》', '修订《六经》', '开创私学'],
    evaluation: '中国古代最伟大的思想家，儒家思想影响中国两千多年。'
  },
  {
    id: 'laozi',
    name: '老子',
    birthYear: -571,
    deathYear: -471,
    dynasty: 'zhou',
    category: 'thinker',
    identity: '思想家、哲学家',
    birthplace: '楚国苦县',
    mainAchievements: ['创立道家学派', '著《道德经》'],
    evaluation: '道家学派创始人，其思想对中国哲学发展具有深远影响。'
  },
  {
    id: 'qin-shi-huang',
    name: '秦始皇',
    birthYear: -259,
    deathYear: -210,
    dynasty: 'qin',
    category: 'emperor',
    identity: '秦朝开国皇帝',
    birthplace: '赵国邯郸',
    mainAchievements: ['统一六国', '统一文字度量衡', '修筑长城', '建立中央集权制度'],
    evaluation: '中国历史上第一个大一统王朝的建立者，千古一帝。'
  },
  {
    id: 'li-si',
    name: '李斯',
    birthYear: -284,
    deathYear: -208,
    dynasty: 'qin',
    category: 'scholar',
    identity: '丞相',
    birthplace: '楚国上蔡',
    mainAchievements: ['辅助秦始皇统一六国', '制定秦律', '统一文字'],
    evaluation: '秦朝著名政治家、文学家。'
  },
  {
    id: 'han-wu-di',
    name: '汉武帝',
    birthYear: -156,
    deathYear: -87,
    dynasty: 'han',
    category: 'emperor',
    identity: '西汉皇帝',
    birthplace: '长安',
    mainAchievements: ['罢黜百家独尊儒术', '开辟丝绸之路', '开疆拓土', '创立太学'],
    evaluation: '西汉最有作为的皇帝，开创了汉武盛世。'
  },
  {
    id: 'simu-qian',
    name: '司马迁',
    birthYear: -145,
    deathYear: -86,
    dynasty: 'han',
    category: 'scholar',
    identity: '史学家、文学家',
    birthplace: '夏阳',
    mainAchievements: ['著《史记》', '开创纪传体史学'],
    evaluation: '中国史学之父，《史记》被誉为"史家之绝唱，无韵之离骚"。'
  },
  {
    id: 'zhang-qian',
    name: '张骞',
    birthYear: -164,
    deathYear: -114,
    dynasty: 'han',
    category: 'general',
    identity: '外交家、探险家',
    birthplace: '汉中',
    mainAchievements: ['出使西域', '开辟丝绸之路'],
    evaluation: '丝绸之路的开拓者，伟大的外交家。'
  },
  {
    id: 'cao-cao',
    name: '曹操',
    birthYear: 155,
    deathYear: 220,
    dynasty: 'han',
    category: 'military',
    identity: '政治家、军事家、诗人',
    birthplace: '沛国谯县',
    mainAchievements: ['统一北方', '实行屯田制', '建安文学代表'],
    evaluation: '三国时期曹魏政权的奠基人，一代枭雄。'
  },
  {
    id: 'zhuge-liang',
    name: '诸葛亮',
    birthYear: 181,
    deathYear: 234,
    dynasty: 'han',
    category: 'general',
    identity: '政治家、军事家',
    birthplace: '琅琊阳都',
    mainAchievements: ['辅佐刘备建立蜀汉', '五次北伐', '发明木牛流马'],
    evaluation: '智慧的化身，鞠躬尽瘁死而后已的典范。'
  },
  {
    id: 'li-shi-min',
    name: '唐太宗',
    birthYear: 598,
    deathYear: 649,
    dynasty: 'tang',
    category: 'emperor',
    identity: '唐朝第二位皇帝',
    birthplace: '武功',
    mainAchievements: ['开创贞观之治', '平定天下', '虚心纳谏'],
    evaluation: '中国历史上最贤明的皇帝之一，开创了大唐盛世。'
  },
  {
    id: 'wu-zetian',
    name: '武则天',
    birthYear: 624,
    deathYear: 705,
    dynasty: 'tang',
    category: 'emperor',
    identity: '武周皇帝',
    birthplace: '并州文水',
    mainAchievements: ['中国唯一女皇帝', '开创殿试', '重视人才选拔'],
    evaluation: '中国历史上唯一的女皇帝，政启开元，治宏贞观。'
  },
  {
    id: 'li-bai',
    name: '李白',
    birthYear: 701,
    deathYear: 762,
    dynasty: 'tang',
    category: 'artist',
    identity: '诗人',
    birthplace: '碎叶城',
    mainAchievements: ['诗仙', '浪漫主义诗歌巅峰'],
    evaluation: '唐代最伟大的诗人之一，被誉为"诗仙"。'
  },
  {
    id: 'du-fu',
    name: '杜甫',
    birthYear: 712,
    deathYear: 770,
    dynasty: 'tang',
    category: 'artist',
    identity: '诗人',
    birthplace: '巩县',
    mainAchievements: ['诗圣', '现实主义诗歌巅峰', '著"三吏三别"'],
    evaluation: '唐代最伟大的现实主义诗人，被誉为"诗圣"。'
  },
  {
    id: 'song-tai-zu',
    name: '宋太祖',
    birthYear: 927,
    deathYear: 976,
    dynasty: 'song',
    category: 'emperor',
    identity: '宋朝开国皇帝',
    birthplace: '洛阳',
    mainAchievements: ['建立宋朝', '结束五代十国', '杯酒释兵权'],
    evaluation: '宋朝开国皇帝，结束了唐末以来的分裂局面。'
  },
  {
    id: 'wang-anshi',
    name: '王安石',
    birthYear: 1021,
    deathYear: 1086,
    dynasty: 'song',
    category: 'scholar',
    identity: '政治家、文学家',
    birthplace: '临川',
    mainAchievements: ['推行王安石变法', '唐宋八大家之一'],
    evaluation: '北宋著名政治家、改革家、文学家。'
  },
  {
    id: 'su-shi',
    name: '苏轼',
    birthYear: 1037,
    deathYear: 1101,
    dynasty: 'song',
    category: 'artist',
    identity: '文学家、书画家',
    birthplace: '眉山',
    mainAchievements: ['唐宋八大家之一', '宋词豪放派代表', '书画家'],
    evaluation: '中国历史上少有的文学艺术全才。'
  },
  {
    id: 'yue-fei',
    name: '岳飞',
    birthYear: 1103,
    deathYear: 1142,
    dynasty: 'song',
    category: 'military',
    identity: '抗金名将',
    birthplace: '相州汤阴',
    mainAchievements: ['收复建康', '北伐中原', '创建岳家军'],
    evaluation: '民族英雄，精忠报国的典范。'
  },
  {
    id: 'zhu-yuan-zhang',
    name: '明太祖',
    birthYear: 1328,
    deathYear: 1398,
    dynasty: 'ming',
    category: 'emperor',
    identity: '明朝开国皇帝',
    birthplace: '濠州钟离',
    mainAchievements: ['推翻元朝', '建立明朝', '洪武之治'],
    evaluation: '布衣天子，推翻了蒙古统治，恢复了汉族政权。'
  },
  {
    id: 'zheng-he',
    name: '郑和',
    birthYear: 1371,
    deathYear: 1433,
    dynasty: 'ming',
    category: 'general',
    identity: '航海家、外交家',
    birthplace: '云南昆阳',
    mainAchievements: ['七下西洋', '加强中外交流'],
    evaluation: '中国历史上最伟大的航海家。'
  },
  {
    id: 'kang-xi',
    name: '康熙',
    birthYear: 1654,
    deathYear: 1722,
    dynasty: 'qing',
    category: 'emperor',
    identity: '清朝皇帝',
    birthplace: '北京',
    mainAchievements: ['平定三藩', '收复台湾', '抗击沙俄', '康乾盛世'],
    evaluation: '中国历史上在位时间最长的皇帝，开创了康乾盛世。'
  },
  {
    id: 'lin-zexu',
    name: '林则徐',
    birthYear: 1785,
    deathYear: 1850,
    dynasty: 'qing',
    category: 'general',
    identity: '政治家、民族英雄',
    birthplace: '福建侯官',
    mainAchievements: ['虎门销烟', '抗英斗争', '开眼看世界'],
    evaluation: '近代中国开眼看世界的第一人，民族英雄。'
  }
]

export const relationships: Relationship[] = [
  { id: 'r1', source: 'li-si', target: 'qin-shi-huang', type: 'lord', description: '李斯是秦始皇的丞相' },
  { id: 'r2', source: 'zhang-qian', target: 'han-wu-di', type: 'lord', description: '张骞是汉武帝时期的大臣' },
  { id: 'r3', source: 'simu-qian', target: 'han-wu-di', type: 'lord', description: '司马迁是汉武帝时期的太史令' },
  { id: 'r4', source: 'zhuge-liang', target: 'cao-cao', type: 'opponent', description: '诸葛亮与曹操是敌对关系' },
  { id: 'r5', source: 'confucius', target: 'laozi', type: 'teacher', description: '孔子曾问礼于老子' },
  { id: 'r6', source: 'li-bai', target: 'du-fu', type: 'friend', description: '李白与杜甫是挚友，"李杜"并称' },
  { id: 'r7', source: 'wang-anshi', target: 'song-tai-zu', type: 'lord', description: '王安石是宋神宗时期的宰相' },
  { id: 'r8', source: 'zheng-he', target: 'zhu-yuan-zhang', type: 'lord', description: '郑和是明成祖时期的太监' },
  { id: 'r9', source: 'lin-zexu', target: 'kang-xi', type: 'lord', description: '林则徐是道光时期的大臣' },
  { id: 'r10', source: 'yue-fei', target: 'qin-shi-huang', type: 'opponent', description: '岳飞抗金' },
  { id: 'r11', source: 'su-shi', target: 'wang-anshi', type: 'opponent', description: '苏轼反对王安石变法' }
]

export const wars: War[] = [
  {
    id: 'muye-war',
    name: '牧野之战',
    startYear: -1046,
    location: '牧野',
    belligerents: ['周', '商'],
    result: '周胜利，商朝灭亡',
    commanders: ['周武王', '姜子牙', '商纣王'],
    description: '周武王伐纣的决胜战，商朝灭亡，周朝建立。'
  },
  {
    id: 'changping-war',
    name: '长平之战',
    startYear: -260,
    location: '长平',
    belligerents: ['秦国', '赵国'],
    result: '秦国胜利，赵国元气大伤',
    commanders: ['白起', '赵括'],
    description: '战国时期规模最大的战役，坑杀赵卒四十万。'
  },
  {
    id: 'chuhan-war',
    name: '楚汉之争',
    startYear: -206,
    endYear: -202,
    location: '中原地区',
    belligerents: ['刘邦', '项羽'],
    result: '刘邦胜利，建立汉朝',
    commanders: ['刘邦', '韩信', '项羽', '范增'],
    description: '刘邦与项羽争夺天下的战争。'
  },
  {
    id: 'red-cliffs-war',
    name: '赤壁之战',
    startYear: 208,
    location: '赤壁',
    belligerents: ['孙刘联军', '曹操'],
    result: '孙刘联军胜利，奠定三国鼎立',
    commanders: ['周瑜', '诸葛亮', '曹操'],
    description: '以少胜多的著名战役，奠定了三国鼎立的基础。'
  },
  {
    id: 'anshi-war',
    name: '安史之乱',
    startYear: 755,
    endYear: 763,
    location: '北方地区',
    belligerents: ['唐朝', '安禄山叛军'],
    result: '唐朝胜利，但由盛转衰',
    commanders: ['郭子仪', '李光弼', '安禄山', '史思明'],
    description: '唐朝由盛转衰的转折点。'
  },
  {
    id: 'yancheng-war',
    name: '郾城大捷',
    startYear: 1140,
    location: '郾城',
    belligerents: ['岳家军', '金军'],
    result: '岳家军胜利',
    commanders: ['岳飞', '金兀术'],
    description: '岳飞北伐中的著名战役。'
  }
]

export const maps: MapItem[] = [
  {
    id: 'qin-territory',
    name: '秦朝疆域图',
    year: -210,
    dynasty: 'qin',
    type: 'territory',
    description: '秦始皇统一六国后的疆域，东至大海，西至陇西，北至长城，南至南海。'
  },
  {
    id: 'han-territory',
    name: '西汉疆域图',
    year: -100,
    dynasty: 'han',
    type: 'territory',
    description: '汉武帝时期的疆域，开辟了河西走廊，设置了西域都护府。'
  },
  {
    id: 'silk-road-map',
    name: '丝绸之路',
    year: -100,
    dynasty: 'han',
    type: 'trade',
    description: '张骞开辟的丝绸之路，连接东西方文明。'
  },
  {
    id: 'tang-territory',
    name: '唐朝疆域图',
    year: 700,
    dynasty: 'tang',
    type: 'territory',
    description: '唐朝鼎盛时期的疆域，东至朝鲜半岛，西至中亚。'
  },
  {
    id: 'zheng-he-route',
    name: '郑和下西洋航线',
    year: 1405,
    dynasty: 'ming',
    type: 'trade',
    description: '郑和七次下西洋的航线，到达东南亚、印度洋、非洲东海岸。'
  }
]

export const documents: Document[] = [
  {
    id: 'shiji',
    title: '史记',
    author: '司马迁',
    year: -91,
    dynasty: 'han',
    category: '史书',
    content: '《史记》是中国第一部纪传体通史，记载了从黄帝到汉武帝时期的历史。',
    description: '史家之绝唱，无韵之离骚。'
  },
  {
    id: 'analects',
    title: '论语',
    author: '孔子弟子',
    year: -479,
    dynasty: 'zhou',
    category: '儒家经典',
    content: '《论语》记载了孔子及其弟子的言行，是儒家最重要的经典之一。',
    description: '半部《论语》治天下。'
  },
  {
    id: 'daodejing',
    title: '道德经',
    author: '老子',
    year: -500,
    dynasty: 'zhou',
    category: '道家经典',
    content: '《道德经》是道家学派的经典著作，阐述了"道"的哲学思想。',
    description: '中国古代哲学的瑰宝。'
  },
  {
    id: 'zizhi-tongjian',
    title: '资治通鉴',
    author: '司马光',
    year: 1084,
    dynasty: 'song',
    category: '史书',
    content: '《资治通鉴》是中国第一部编年体通史，记载了从战国到五代的历史。',
    description: '鉴于往事，有资于治道。'
  }
]
