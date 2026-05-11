import asyncio
import sys
sys.path.insert(0, '.')

from app.scraper import TaobaoScraper, SmartScraper


async def test_scraper():
    print("=" * 60)
    print("测试淘宝/天猫商品采集器")
    print("=" * 60)

    test_urls = [
        # 你可以添加真实的淘宝/天猫链接进行测试
        # "https://item.taobao.com/item.htm?id=6987654321",
        # "https://detail.tmall.com/item.htm?id=7123456789",
    ]

    if not test_urls:
        print("\n⚠️  没有配置测试URL")
        print("请在test_scraper.py中添加真实的淘宝/天猫链接进行测试")
        print("\n示例格式：")
        print("  - 淘宝: https://item.taobao.com/item.htm?id=1234567890")
        print("  - 天猫: https://detail.tmall.com/item.htm?id=1234567890")
        return

    scraper = TaobaoScraper()
    smart_scraper = SmartScraper()

    for url in test_urls:
        print(f"\n{'='*60}")
        print(f"测试链接: {url}")
        print("=" * 60)

        print("\n--- 测试TaobaoScraper (真实数据) ---")
        result = await scraper.scrape(url)
        print(f"成功: {result.get('success')}")
        print(f"消息: {result.get('message')}")
        if result.get('data'):
            data = result['data']
            print(f"商品ID: {data.get('item_id')}")
            print(f"标题: {data.get('title')[:50]}..." if len(str(data.get('title'))) > 50 else f"标题: {data.get('title')}")
            print(f"价格: {data.get('price')}")
            print(f"原价: {data.get('original_price')}")
            print(f"图片数: {len(data.get('images', []))}")
            print(f"详情图数: {len(data.get('detail_images', []))}")
            print(f"SKU数: {len(data.get('sku', []))}")

        print("\n--- 测试SmartScraper (智能模式) ---")
        result2 = await smart_scraper.scrape(url)
        print(f"成功: {result2.get('success')}")
        print(f"消息: {result2.get('message')}")
        if result2.get('data'):
            data = result2['data']
            print(f"商品ID: {data.get('item_id')}")
            print(f"标题: {data.get('title')[:50]}..." if len(str(data.get('title'))) > 50 else f"标题: {data.get('title')}")
            print(f"价格: {data.get('price')}")

    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(test_scraper())
