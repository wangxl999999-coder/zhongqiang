const db = require('../database/db');

function calculateSimilarity(str1, str2) {
  const set1 = new Set(str1.split(''));
  const set2 = new Set(str2.split(''));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

function extractKeywords(title) {
  const stopWords = ['的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'];
  const words = title.split(/[\s，。！？、：；""''（）【】]+/);
  return words.filter(word => word.length > 1 && !stopWords.includes(word));
}

async function aggregateEvents() {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT hi.*, p.name as platform_name
      FROM hot_items hi
      JOIN platforms p ON hi.platform_id = p.id
      WHERE hi.crawled_at >= datetime('now', '-24 hours')
      ORDER BY hi.hot_value DESC
    `, [], (err, items) => {
      if (err) {
        reject(err);
        return;
      }

      const events = [];
      const similarityThreshold = 0.3;

      items.forEach(item => {
        let matched = false;
        
        for (const event of events) {
          const similarity = calculateSimilarity(item.title, event.title);
          
          if (similarity >= similarityThreshold) {
            event.items.push(item);
            event.platforms.add(item.platform_name);
            event.platform_count = event.platforms.size;
            matched = true;
            break;
          }

          const keywords1 = extractKeywords(item.title);
          const keywords2 = extractKeywords(event.title);
          const commonKeywords = keywords1.filter(k => keywords2.includes(k));
          
          if (commonKeywords.length >= 2) {
            event.items.push(item);
            event.platforms.add(item.platform_name);
            event.platform_count = event.platforms.size;
            matched = true;
            break;
          }
        }

        if (!matched) {
          events.push({
            title: item.title,
            description: item.description,
            items: [item],
            platforms: new Set([item.platform_name]),
            platform_count: 1
          });
        }
      });

      events.sort((a, b) => {
        const hotA = a.items.reduce((sum, item) => sum + item.hot_value, 0);
        const hotB = b.items.reduce((sum, item) => sum + item.hot_value, 0);
        return hotB - hotA;
      });

      resolve(events);
    });
  });
}

async function updateEventRelations() {
  const events = await aggregateEvents();
  
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      events.forEach((event, index) => {
        db.run(`
          INSERT OR REPLACE INTO events (id, title, description, platform_count, updated_at)
          VALUES ((SELECT id FROM events WHERE title = ? LIMIT 1), ?, ?, ?, CURRENT_TIMESTAMP)
        `, [event.title, event.title, event.description, event.platform_count], function(err) {
          if (err) {
            console.error('插入事件失败:', err);
            return;
          }
          
          const eventId = this.lastID || 0;
          
          event.items.forEach(item => {
            db.run(`
              UPDATE hot_items SET event_id = ? WHERE id = ?
            `, [eventId, item.id]);
          });
        });
      });
      
      db.run('COMMIT', (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`事件聚合完成，共聚合 ${events.length} 个事件`);
          resolve();
        }
      });
    });
  });
}

module.exports = { aggregateEvents, updateEventRelations };
