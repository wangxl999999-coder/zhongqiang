import asyncio
import sys
sys.path.insert(0, '.')

from app.scraper import TaobaoScraper, SmartScraper


async def test_scraper():
    print("=" * 60)
    print("测试淘宝/天猫商品采集器")
    print("=" * 60)

    test_urls = [
        "https://item.taobao.com/item.htm?ali_refid=a3_420434_1006%3A1680024826%3AH%3A%2B%2F7ty7ghmlYQXjScmAyqtn3rV%2B48BJvG%3A79744a194112be488253d73cd34a8632&ali_trackid=282_79744a194112be488253d73cd34a8632&id=710901206600&mm_sceneid=1_0_3792568038_0&pisk=gjSEhyDvbkEFevVc3txzu256hLtp53PbYgOWETXkdBAHOTvk41f7pB6u9_SysTQQpUNKUvINg0iQ9yBo43tuGSZbc9Hp23VXQHLQuXp2evqWtpmMvLTL1RG_c9BpwvluhNqbzHEvS00kZ_xMsppJqLxo-C2wUKRkqBYosVvDsQxlZeqMSp9jt40HKV2weCAkq3flIRJysQxkq_XiNCAkGcJ2-J1ZcKNSyETei9AZ0OIwKh3dLCoo4GJ98ImX_0mlbpXJgAvK0zOckBTXi1qsY3WMU18f8SoFaTXArFSrtJ1csa5kBNFrzI7ldZI65Y0hQgReoMYZe-6cpLfkzNFqcp-C7ESFJ8hGKsOFoHBS3W6wuN8vIFDr-H_fhgLcxklv1EpP_E_UgD5c4EGJIwPN2wlozev9QIwaQyUpsKMkar4Ey4LdWdRbpJ3-yev9QIwaQ43JJnpwGJed.&skuId=6202115986280&spm=a21n57.1.hoverItem.3&utparam=%7B%22aplus_abtest%22%3A%223afb98f1e0176a64e73d50c63be10621%22%7D&xxc=ad_ztc"
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
