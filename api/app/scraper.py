import httpx
import re
import json
from bs4 import BeautifulSoup
from typing import Optional, Dict, Any

class TaobaoScraper:
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        }
    
    def _get_item_id(self, url: str) -> Optional[str]:
        patterns = [
            r"item\.taobao\.com/item\.htm\?id=(\d+)",
            r"detail\.tmall\.com/item\.htm\?id=(\d+)",
            r"id=(\d+)",
        ]
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None
    
    async def fetch_page(self, url: str) -> Optional[str]:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            try:
                response = await client.get(url, headers=self.headers)
                if response.status_code == 200:
                    return response.text
            except Exception as e:
                print(f"请求错误: {e}")
        return None
    
    def _extract_from_json(self, html: str) -> Dict[str, Any]:
        result = {
            "title": "",
            "price": "",
            "original_price": "",
            "sku": [],
            "images": [],
            "detail_images": []
        }
        
        g_config_match = re.search(r'g_config\s*=\s*({[^;]+});', html)
        if g_config_match:
            try:
                config_str = g_config_match.group(1)
                config = json.loads(config_str)
                
                item_data = config.get("item", {})
                result["title"] = item_data.get("title", "")
                
                price_info = item_data.get("price", {})
                result["price"] = str(price_info.get("price", ""))
                result["original_price"] = str(price_info.get("originalPrice", ""))
                
                sku_list = item_data.get("skuList", [])
                for sku in sku_list:
                    result["sku"].append({
                        "name": sku.get("skuName", ""),
                        "price": str(sku.get("price", "")),
                        "inventory": sku.get("inventory", 0)
                    })
                
                images = item_data.get("images", [])
                for img in images:
                    if img:
                        result["images"].append(f"https:{img}" if img.startswith("//") else img)
                
            except Exception as e:
                print(f"解析JSON配置错误: {e}")
        
        shop_config_match = re.search(r'shop_config\s*=\s*({[^;]+});', html)
        if shop_config_match:
            try:
                shop_config = json.loads(shop_config_match.group(1))
                detail_images = shop_config.get("apiStack", [{}])[0].get("value", {}).get("item", {}).get("images", [])
                for img in detail_images:
                    if img:
                        result["detail_images"].append(f"https:{img}" if img.startswith("//") else img)
            except Exception as e:
                print(f"解析详情图片错误: {e}")
        
        return result
    
    def _extract_with_bs4(self, html: str) -> Dict[str, Any]:
        result = {
            "title": "",
            "price": "",
            "original_price": "",
            "sku": [],
            "images": [],
            "detail_images": []
        }
        
        soup = BeautifulSoup(html, 'lxml')
        
        title = soup.find("title")
        if title:
            result["title"] = title.text.strip()
        
        price_patterns = [
            (soup.find("strong", class_="tb-price"), "text"),
            (soup.find("span", class_="tm-price"), "text"),
        ]
        
        for elem, attr in price_patterns:
            if elem:
                if attr == "text":
                    result["price"] = elem.get_text(strip=True)
                else:
                    result["price"] = elem.get(attr, "")
                if result["price"]:
                    break
        
        img_tags = soup.find_all("img")
        for img in img_tags:
            src = img.get("src", "") or img.get("data-src", "")
            if src and ("taobaocdn" in src or "alicdn" in src):
                if src.startswith("//"):
                    src = "https:" + src
                if src not in result["images"] and len(result["images"]) < 10:
                    result["images"].append(src)
        
        return result
    
    async def scrape(self, url: str) -> Dict[str, Any]:
        item_id = self._get_item_id(url)
        if not item_id:
            return {
                "success": False,
                "message": "无效的淘宝/天猫链接",
                "data": None
            }
        
        html = await self.fetch_page(url)
        if not html:
            return {
                "success": False,
                "message": "无法获取页面数据，请稍后重试",
                "data": None
            }
        
        data = self._extract_from_json(html)
        
        if not data["title"]:
            backup_data = self._extract_with_bs4(html)
            for key, value in backup_data.items():
                if not data.get(key):
                    data[key] = value
        
        if not data["title"]:
            return {
                "success": False,
                "message": "解析商品信息失败，可能需要登录或页面已变更",
                "data": None
            }
        
        return {
            "success": True,
            "message": "采集成功",
            "data": {
                "item_id": item_id,
                "title": data["title"],
                "price": data["price"],
                "original_price": data["original_price"],
                "sku": data["sku"],
                "images": data["images"],
                "detail_images": data["detail_images"]
            }
        }

class MockTaobaoScraper:
    def __init__(self):
        self.mock_data = {
            "default": {
                "title": "测试商品 - 精品纯棉T恤 男士休闲短袖 夏季新款",
                "price": "99.00",
                "original_price": "199.00",
                "sku": [
                    {"name": "白色 - M码", "price": "99.00", "inventory": 100},
                    {"name": "白色 - L码", "price": "99.00", "inventory": 50},
                    {"name": "黑色 - M码", "price": "109.00", "inventory": 80},
                    {"name": "黑色 - L码", "price": "109.00", "inventory": 30},
                ],
                "images": [
                    "https://img.alicdn.com/imgextra/i1/123456789/O1CN01test1_123456789_01111.jpg",
                    "https://img.alicdn.com/imgextra/i2/123456789/O1CN01test2_123456789_02222.jpg",
                    "https://img.alicdn.com/imgextra/i3/123456789/O1CN01test3_123456789_03333.jpg",
                ],
                "detail_images": [
                    "https://img.alicdn.com/imgextra/i1/123456789/O1CN01detail1_123456789_01111.jpg",
                    "https://img.alicdn.com/imgextra/i2/123456789/O1CN01detail2_123456789_02222.jpg",
                ]
            }
        }
    
    def _get_item_id(self, url: str) -> Optional[str]:
        patterns = [
            r"item\.taobao\.com/item\.htm\?id=(\d+)",
            r"detail\.tmall\.com/item\.htm\?id=(\d+)",
            r"id=(\d+)",
        ]
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None
    
    async def scrape(self, url: str) -> Dict[str, Any]:
        item_id = self._get_item_id(url)
        if not item_id:
            return {
                "success": False,
                "message": "无效的淘宝/天猫链接",
                "data": None
            }
        
        mock_item = self.mock_data["default"].copy()
        mock_item["item_id"] = item_id
        mock_item["title"] = f"商品{item_id} - 精品纯棉T恤 男士休闲短袖 夏季新款"
        
        return {
            "success": True,
            "message": "采集成功（演示数据）",
            "data": mock_item
        }

scraper = MockTaobaoScraper()
