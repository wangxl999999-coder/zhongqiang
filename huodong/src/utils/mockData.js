export const interestTags = [
  { id: 1, name: '运动健身', color: 'bg-red-100 text-red-600' },
  { id: 2, name: '户外探险', color: 'bg-green-100 text-green-600' },
  { id: 3, name: '音乐演出', color: 'bg-purple-100 text-purple-600' },
  { id: 4, name: '摄影摄像', color: 'bg-blue-100 text-blue-600' },
  { id: 5, name: '美食烹饪', color: 'bg-orange-100 text-orange-600' },
  { id: 6, name: '读书分享', color: 'bg-yellow-100 text-yellow-600' },
  { id: 7, name: '桌游聚会', color: 'bg-pink-100 text-pink-600' },
  { id: 8, name: '电影话剧', color: 'bg-indigo-100 text-indigo-600' },
  { id: 9, name: '艺术展览', color: 'bg-teal-100 text-teal-600' },
  { id: 10, name: '编程技术', color: 'bg-cyan-100 text-cyan-600' },
  { id: 11, name: '手工制作', color: 'bg-amber-100 text-amber-600' },
  { id: 12, name: '语言学习', color: 'bg-emerald-100 text-emerald-600' }
]

export const mockCircles = [
  {
    id: 1,
    name: '周末徒步爱好者',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mountain%20hiking%20group%20logo%20nature&image_size=square',
    intro: '每周组织徒步活动，探索城市周边美景',
    tags: ['户外探险', '运动健身'],
    memberCount: 1256,
    activityCount: 48,
    notice: '本周六我们将前往香山，早上8点地铁口集合'
  },
  {
    id: 2,
    name: '独立音乐现场',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=music%20concert%20guitar%20stage%20lights&image_size=square',
    intro: '发现更多优质独立音乐，组织线下演出',
    tags: ['音乐演出'],
    memberCount: 3420,
    activityCount: 156,
    notice: '本周五Live House演出，凭圈子身份享折扣'
  },
  {
    id: 3,
    name: '城市摄影圈',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=camera%20photography%20city%20landscape&image_size=square',
    intro: '用镜头记录城市的每一个美好瞬间',
    tags: ['摄影摄像'],
    memberCount: 2180,
    activityCount: 89,
    notice: '本周日下午故宫拍摄活动，名额有限'
  },
  {
    id: 4,
    name: '美食探店团',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=food%20delicious%20restaurant%20dining&image_size=square',
    intro: '一起发现城市里的隐藏美食',
    tags: ['美食烹饪'],
    memberCount: 5670,
    activityCount: 234,
    notice: '本周日米其林餐厅探店，报名从速'
  },
  {
    id: 5,
    name: '读书会',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=books%20reading%20library%20knowledge&image_size=square',
    intro: '每周一本书，思想碰撞的聚集地',
    tags: ['读书分享'],
    memberCount: 1890,
    activityCount: 67,
    notice: '本周六晚《人类简史》读书分享会'
  },
  {
    id: 6,
    name: '剧本杀桌游社',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=board%20game%20cards%20dice%20fun&image_size=square',
    intro: '烧脑推理，欢乐聚会',
    tags: ['桌游聚会'],
    memberCount: 2340,
    activityCount: 178,
    notice: '新本到店，欢迎预约体验'
  }
]

export const mockActivities = [
  {
    id: 1,
    title: '香山红叶徒步赏秋',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=autumn%20mountain%20red%20leaves%20hiking&image_size=landscape_16_9',
    time: '2024-11-16 08:00',
    location: '北京香山公园东门',
    people: 50,
    joined: 38,
    fee: 39,
    tags: ['户外探险', '运动健身'],
    circle: { id: 1, name: '周末徒步爱好者' },
    organizer: { id: 1, name: '爬山达人', avatar: '' }
  },
  {
    id: 2,
    title: '独立乐队Live演出',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=live%20music%20concert%20band%20stage&image_size=landscape_16_9',
    time: '2024-11-15 20:00',
    location: 'MAO Livehouse',
    people: 200,
    joined: 156,
    fee: 128,
    tags: ['音乐演出'],
    circle: { id: 2, name: '独立音乐现场' },
    organizer: { id: 2, name: '音乐策划人', avatar: '' }
  },
  {
    id: 3,
    title: '故宫建筑摄影课',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forbidden%20city%20architecture%20photography&image_size=landscape_16_9',
    time: '2024-11-17 14:00',
    location: '故宫博物院',
    people: 30,
    joined: 22,
    fee: 199,
    tags: ['摄影摄像'],
    circle: { id: 3, name: '城市摄影圈' },
    organizer: { id: 3, name: '光影猎人', avatar: '' }
  },
  {
    id: 4,
    title: '日料大师课体验',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sushi%20japanese%20cooking%20chef&image_size=landscape_16_9',
    time: '2024-11-18 10:00',
    location: '高级日料店',
    people: 15,
    joined: 12,
    fee: 599,
    tags: ['美食烹饪'],
    circle: { id: 4, name: '美食探店团' },
    organizer: { id: 4, name: '美食家小王', avatar: '' }
  },
  {
    id: 5,
    title: '沉浸式剧本杀体验',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mystery%20detective%20game%20drama&image_size=landscape_16_9',
    time: '2024-11-16 14:00',
    location: '推理剧场',
    people: 12,
    joined: 10,
    fee: 168,
    tags: ['桌游聚会'],
    circle: { id: 6, name: '剧本杀桌游社' },
    organizer: { id: 5, name: 'DM大神', avatar: '' }
  },
  {
    id: 6,
    title: '油画初体验工作坊',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=oil%20painting%20art%20canvas%20colors&image_size=landscape_16_9',
    time: '2024-11-17 10:00',
    location: '艺术空间',
    people: 20,
    joined: 14,
    fee: 299,
    tags: ['艺术展览'],
    circle: null,
    organizer: { id: 6, name: '艺术老师', avatar: '' }
  }
]

export const mockActivityDetail = {
  id: 1,
  title: '香山红叶徒步赏秋',
  cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=autumn%20mountain%20red%20leaves%20hiking&image_size=landscape_16_9',
  time: '2024-11-16 08:00',
  endTime: '2024-11-16 18:00',
  location: '北京香山公园东门',
  address: '海淀区买卖街40号',
  people: 50,
  joined: 38,
  fee: 39,
  tags: ['户外探险', '运动健身'],
  circle: { id: 1, name: '周末徒步爱好者' },
  organizer: { id: 1, name: '爬山达人', avatar: '', bio: '资深徒步领队，10年户外经验' },
  images: [
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mountain%20trail%20autumn%20scenery&image_size=landscape_16_9',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=group%20hiking%20friends%20nature&image_size=landscape_16_9',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=red%20maple%20leaves%20closeup&image_size=landscape_16_9'
  ],
  description: '秋高气爽，正是赏红叶的好时节！本周六我们一起前往香山，漫步在红叶满山的小径上，感受秋天的美好。这是一个结识新朋友、锻炼身体、放松心情的好机会。',
  schedule: [
    { time: '08:00', content: '香山公园东门集合签到' },
    { time: '08:30', content: '破冰活动，领队介绍路线' },
    { time: '09:00', content: '开始徒步登山' },
    { time: '12:00', content: '山顶午餐（自带）' },
    { time: '13:30', content: '下山游览' },
    { time: '16:30', content: '东门解散，可自愿AA聚餐' }
  ],
  guests: [
    { name: '张领队', title: '资深户外向导', intro: '拥有10年户外徒步经验，累计带队500+次' }
  ],
  notices: [
    '穿着舒适的运动鞋和运动服',
    '自带午餐和足够的饮用水',
    '注意防晒，可携带帽子、墨镜',
    '如有不适请及时告知领队'
  ],
  conditions: [
    '身体健康，无心脑血管疾病',
    '热爱户外运动，有团队精神',
    '服从领队安排，不擅自离队'
  ],
  refundPolicy: '活动开始前48小时可全额退款，24-48小时退款50%，24小时内不支持退款'
}
