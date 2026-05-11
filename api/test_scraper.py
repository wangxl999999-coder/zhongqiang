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
        # 示例: "https://item.taobao.com/item.htm?id=6987654321",
        # 示例: "https://detail.tmall.com/item.htm?id=7123456789",
    ]

    # 可选：配置登录后的Cookie
    # 从浏览器复制Cookie字符串，格式: "key1=value1; key2=value2"
    test_cookies = ""  # 例如: "cookie2=xxx; _tb_token_=xxx; t=xxx"

    if not test_urls:
        print("\n⚠️  没有配置测试URL")
        print("\n请在test_scraper.py中添加真实的淘宝/天猫链接进行测试")
        print("\n示例格式：")
        print("  - 淘宝: https://item.taobao.com/item.htm?id=1234567890")
        print("  - 天猫: https://detail.tmall.com/item.htm?id=1234567890")
        print("\n配置Cookie（可选，用于获取完整数据）：")
        print("  1. 在浏览器中登录淘宝/天猫")
        print("  2. 按F12打开开发者工具")
        print("  3. 切换到Network标签，刷新页面")
        print("  4. 点击任意请求，在Request Headers中找到Cookie")
        print("  5. 复制Cookie值到test_cookies变量")
        return

    scraper = TaobaoScraper(cookies=test_cookies)
    smart_scraper = SmartScraper(default_cookies=test_cookies)

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
            title = str(data.get('title', ''))
            print(f"标题: {title[:50]}..." if len(title) > 50 else f"标题: {title}")
            print(f"价格: {data.get('price')}")
            print(f"原价: {data.get('original_price')}")
            print(f"图片数: {len(data.get('images', []))}")
            if data.get('images'):
                print(f"首张图: {data['images'][0][:80]}...")
            print(f"详情图数: {len(data.get('detail_images', []))}")
            print(f"SKU数: {len(data.get('sku', []))}")

        print("\n--- 测试SmartScraper (智能模式) ---")
        result2 = await smart_scraper.scrape(url)
        print(f"成功: {result2.get('success')}")
        print(f"消息: {result2.get('message')}")
        if result2.get('data'):
            data = result2['data']
            print(f"商品ID: {data.get('item_id')}")
            title = str(data.get('title', ''))
            print(f"标题: {title[:50]}..." if len(title) > 50 else f"标题: {title}")
            print(f"价格: {data.get('price')}")

    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(test_scraper())
