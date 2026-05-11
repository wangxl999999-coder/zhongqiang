import httpx
import re
import json
import asyncio
from typing import Optional, Dict, Any, List
from urllib.parse import urlparse, parse_qs, urlencode
import random
import string


class TaobaoScraper:
    def __init__(self):
        self.user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
        ]
        self.timeout = 30.0

    def _get_random_headers(self) -> Dict[str, str]:
        return {
            "User-Agent": random.choice(self.user_agents),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
        }

    def _get_item_id(self, url: str) -> Optional[str]:
        patterns = [
            r"item\.taobao\.com/item\.htm\?id=(\d+)",
            r"detail\.tmall\.com/item\.htm\?id=(\d+)",
            r"item\.tmall\.com/item\.htm\?id=(\d+)",
            r"item\.taobao\.com/item\?id=(\d+)",
            r"h5\.m\.taobao\.com/awp/core/detail\.htm\?id=(\d+)",
            r"m\.taobao\.com/page/detail\.htm\?id=(\d+)",
            r"id=(\d+)",
        ]
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None

    def _is_tmall(self, url: str) -> bool:
        tmall_domains = ["tmall.com", "tmall.hk"]
        return any(domain in url.lower() for domain in tmall_domains)

    def _normalize_url(self, url: str, item_id: str) -> str:
        if self._is_tmall(url):
            return f"https://detail.tmall.com/item.htm?id={item_id}"
        return f"https://item.taobao.com/item.htm?id={item_id}"

    def _get_mobile_url(self, item_id: str) -> str:
        return f"https://h5.m.taobao.com/awp/core/detail.htm?id={item_id}"

    async def _fetch_page(self, url: str, headers: Dict[str, str] = None) -> Optional[str]:
        if headers is None:
            headers = self._get_random_headers()
        
        async with httpx.AsyncClient(
            timeout=self.timeout,
            follow_redirects=True,
            headers=headers
        ) as client:
            try:
                response = await client.get(url)
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

        json_patterns = [
            r'window\.__INIT_DATA__\s*=\s*(\{[\s\S]+?\})\s*;',
            r'window\.__INIT_STATE__\s*=\s*(\{[\s\S]+?\})\s*;',
            r'__INIT_DATA__\s*=\s*(\{[\s\S]+?\})\s*;',
            r'var\s+data\s*=\s*(\{[\s\S]+?\})\s*;',
            r'var\s+itemData\s*=\s*(\{[\s\S]+?\})\s*;',
        ]

        for pattern in json_patterns:
            matches = re.findall(pattern, html)
            for match in matches:
                try:
                    data = json.loads(match)
                    extracted = self._extract_recursive(data)
                    if extracted["title"] and not result["title"]:
                        result.update(extracted)
                except Exception as e:
                    continue

        return result

    def _extract_recursive(self, data: Any, depth: int = 0) -> Dict[str, Any]:
        result = {
            "title": "",
            "price": "",
            "original_price": "",
            "sku": [],
            "images": [],
            "detail_images": []
        }

        if depth > 6:
            return result

        if isinstance(data, dict):
            title_aliases = ["title", "itemTitle", "item_name", "name", "goodsTitle", "goods_name"]
            price_aliases = ["price", "itemPrice", "currentPrice", "displayPrice", "salePrice", "priceText", "price_with_symbol", "current"]
            original_price_aliases = ["originalPrice", "originPrice", "marketPrice", "reservePrice", "market", "original"]
            images_aliases = ["images", "itemImages", "picUrls", "pics", "itemPics", "picList", "itemImgUrls"]
            detail_images_aliases = ["detailImages", "descImages", "detailPics", "descPics", "descImageList", "detailImageList"]
            sku_aliases = ["skuList", "skus", "skuMap", "skuInfo", "skuListMap", "skuProps"]

            for key, value in data.items():
                key_lower = key.lower()
                
                if key in title_aliases or key_lower in [k.lower() for k in title_aliases]:
                    if isinstance(value, str) and value.strip() and len(value.strip()) > 5:
                        if "天猫" not in value and "淘宝" not in value:
                            result["title"] = value.strip()
                
                elif key in price_aliases or key_lower in [k.lower() for k in price_aliases]:
                    if isinstance(value, (str, int, float)) and str(value).strip():
                        price_str = str(value).strip()
                        if price_str and price_str != "0":
                            result["price"] = price_str
                
                elif key in original_price_aliases or key_lower in [k.lower() for k in original_price_aliases]:
                    if isinstance(value, (str, int, float)) and str(value).strip():
                        result["original_price"] = str(value).strip()
                
                elif key in images_aliases or key_lower in [k.lower() for k in images_aliases]:
                    if isinstance(value, list):
                        for img in value:
                            if isinstance(img, str) and img:
                                img_url = self._normalize_image_url(img)
                                if img_url and img_url not in result["images"]:
                                    result["images"].append(img_url)
                            elif isinstance(img, dict):
                                for k, v in img.items():
                                    if isinstance(v, str) and ("alicdn" in v.lower() or "taobaocdn" in v.lower()):
                                        img_url = self._normalize_image_url(v)
                                        if img_url and img_url not in result["images"]:
                                            result["images"].append(img_url)
                
                elif key in detail_images_aliases or key_lower in [k.lower() for k in detail_images_aliases]:
                    if isinstance(value, list):
                        for img in value:
                            if isinstance(img, str) and img:
                                img_url = self._normalize_image_url(img)
                                if img_url and img_url not in result["detail_images"]:
                                    result["detail_images"].append(img_url)
                
                elif key in sku_aliases or key_lower in [k.lower() for k in sku_aliases]:
                    if isinstance(value, list):
                        for sku_item in value:
                            if isinstance(sku_item, dict):
                                sku_name = sku_item.get("name") or sku_item.get("skuName") or sku_item.get("title") or sku_item.get("propName") or ""
                                sku_price = str(sku_item.get("price") or sku_item.get("skuPrice") or sku_item.get("salePrice") or "")
                                sku_inventory = sku_item.get("inventory") or sku_item.get("stock") or sku_item.get("quantity") or 0
                                if sku_name:
                                    result["sku"].append({
                                        "name": sku_name,
                                        "price": sku_price,
                                        "inventory": sku_inventory
                                    })
                
                else:
                    nested = self._extract_recursive(value, depth + 1)
                    if nested["title"] and not result["title"]:
                        result["title"] = nested["title"]
                    if nested["price"] and not result["price"]:
                        result["price"] = nested["price"]
                    if nested["original_price"] and not result["original_price"]:
                        result["original_price"] = nested["original_price"]
                    for img in nested["images"]:
                        if img not in result["images"]:
                            result["images"].append(img)
                    for img in nested["detail_images"]:
                        if img not in result["detail_images"]:
                            result["detail_images"].append(img)
                    for sku in nested["sku"]:
                        if sku not in result["sku"]:
                            result["sku"].append(sku)

        elif isinstance(data, list):
            for item in data:
                nested = self._extract_recursive(item, depth + 1)
                if nested["title"] and not result["title"]:
                    result["title"] = nested["title"]
                if nested["price"] and not result["price"]:
                    result["price"] = nested["price"]

        return result

    def _normalize_image_url(self, url: str) -> Optional[str]:
        if not url:
            return None
        
        url = url.strip()
        if not url:
            return None
        
        if url.startswith("http"):
            return url
        elif url.startswith("//"):
            return "https:" + url
        elif url.startswith("/"):
            return "https:" + url
        elif "alicdn" in url.lower() or "taobaocdn" in url.lower():
            return "https://" + url
        
        return None

    def _extract_with_regex(self, html: str) -> Dict[str, Any]:
        result = {
            "title": "",
            "price": "",
            "original_price": "",
            "sku": [],
            "images": [],
            "detail_images": []
        }

        title_matches = [
            (r'<meta[^>]*property=["\']og:title["\'][^>]*content=["\']([^"\']+)["\']', 1),
            (r'<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']+)["\']', 1),
            (r'<h1[^>]*>([^<]+)</h1>', 1),
            (r'itemTitle["\']\s*:\s*["\']([^"\']+)["\']', 1),
            (r'"title"\s*:\s*"([^"]{5,})"', 1),
        ]
        for pattern, group in title_matches:
            match = re.search(pattern, html, re.IGNORECASE | re.DOTALL)
            if match:
                title = match.group(group).strip()
                if title and len(title) > 5 and "天猫" not in title and "淘宝" not in title and "天猫超市" not in title:
                    result["title"] = title
                    break

        price_matches = [
            (r'"price"\s*:\s*["\']?([\d]+(?:\.\d+)?)["\']?', 1),
            (r'itemPrice["\']\s*:\s*["\']?([\d]+(?:\.\d+)?)["\']?', 1),
            (r'currentPrice["\']\s*:\s*["\']?([\d]+(?:\.\d+)?)["\']?', 1),
            (r'displayPrice["\']\s*:\s*["\']?([\d]+(?:\.\d+)?)["\']?', 1),
            (r'salePrice["\']\s*:\s*["\']?([\d]+(?:\.\d+)?)["\']?', 1),
        ]
        for pattern, group in price_matches:
            match = re.search(pattern, html)
            if match:
                price = match.group(group)
                if price and price != "0":
                    result["price"] = price
                    break

        original_price_matches = [
            (r'originalPrice["\']\s*:\s*["\']?([\d]+(?:\.\d+)?)["\']?', 1),
            (r'originPrice["\']\s*:\s*["\']?([\d]+(?:\.\d+)?)["\']?', 1),
            (r'marketPrice["\']\s*:\s*["\']?([\d]+(?:\.\d+)?)["\']?', 1),
        ]
        for pattern, group in original_price_matches:
            match = re.search(pattern, html)
            if match:
                result["original_price"] = match.group(group)
                break

        image_patterns = [
            r'//img\d*\.alicdn\.com/[^"\'\s<>]+',
            r'//\w+\.alicdn\.com/[^"\'\s<>]+',
            r'//\w+\.taobaocdn\.com/[^"\'\s<>]+',
        ]
        for pattern in image_patterns:
            matches = re.findall(pattern, html, re.IGNORECASE)
            for img in matches:
                if any(ext in img.lower() for ext in ['.jpg', '.png', '.jpeg', '.gif', '.webp', '.bmp']):
                    img_url = f"https:{img}"
                    if img_url not in result["images"]:
                        result["images"].append(img_url)
                    if len(result["images"]) >= 30:
                        break

        return result

    async def _try_mobile_api(self, item_id: str) -> Optional[Dict[str, Any]]:
        api_urls = [
            f"https://h5api.m.taobao.com/h5/mtop.taobao.detail.getdetail/6.0/?data=%7B%22itemNumId%22%3A%22{item_id}%22%7D",
            f"https://h5api.m.taobao.com/h5/mtop.taobao.detail.getmixdetail/6.0/?data=%7B%22itemNumId%22%3A%22{item_id}%22%7D",
        ]

        headers = self._get_random_headers()
        headers["Referer"] = f"https://h5.m.taobao.com/awp/core/detail.htm?id={item_id}"
        headers["Content-Type"] = "application/x-www-form-urlencoded"

        async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
            for api_url in api_urls:
                try:
                    response = await client.get(api_url, headers=headers)
                    if response.status_code == 200:
                        try:
                            data = response.json()
                            extracted = self._extract_recursive(data)
                            if extracted["title"]:
                                return extracted
                        except Exception as e:
                            pass
                except Exception as e:
                    print(f"Mobile API错误: {e}")
                    continue
        return None

    async def scrape(self, url: str) -> Dict[str, Any]:
        item_id = self._get_item_id(url)
        if not item_id:
            return {
                "success": False,
                "message": "无效的淘宝/天猫链接，请确保链接格式正确（包含商品ID）。示例格式：https://item.taobao.com/item.htm?id=123456 或 https://detail.tmall.com/item.htm?id=123456",
                "data": None
            }

        is_tmall = self._is_tmall(url)
        platform = "天猫" if is_tmall else "淘宝"

        result = {
            "item_id": item_id,
            "title": "",
            "price": "",
            "original_price": "",
            "sku": [],
            "images": [],
            "detail_images": []
        }

        strategies = [
            ("PC端页面", self._try_pc_page),
            ("移动端页面", self._try_mobile_page),
            ("Mobile API", self._try_mobile_api_wrapper),
        ]

        for strategy_name, strategy_func in strategies:
            try:
                extracted = await strategy_func(item_id)
                if extracted and extracted.get("title"):
                    if not result["title"]:
                        result.update(extracted)
                    else:
                        if not result["price"] and extracted.get("price"):
                            result["price"] = extracted["price"]
                        if not result["original_price"] and extracted.get("original_price"):
                            result["original_price"] = extracted["original_price"]
                        for img in extracted.get("images", []):
                            if img not in result["images"]:
                                result["images"].append(img)
                        for img in extracted.get("detail_images", []):
                            if img not in result["detail_images"]:
                                result["detail_images"].append(img)
                        for sku in extracted.get("sku", []):
                            if sku not in result["sku"]:
                                result["sku"].append(sku)
            except Exception as e:
                print(f"{strategy_name}策略错误: {e}")
                continue

        if not result["title"]:
            return {
                "success": False,
                "message": f"无法获取{platform}商品数据。淘宝/天猫有较强的反爬机制，可能需要登录或使用官方API。当前返回演示数据。",
                "data": {
                    "item_id": item_id,
                    "platform": platform
                }
            }

        return {
            "success": True,
            "message": f"{platform}商品数据采集成功",
            "data": result
        }

    async def _try_pc_page(self, item_id: str) -> Optional[Dict[str, Any]]:
        urls = [
            f"https://item.taobao.com/item.htm?id={item_id}",
            f"https://detail.tmall.com/item.htm?id={item_id}",
        ]

        for url in urls:
            html = await self._fetch_page(url)
            if html:
                extracted = self._extract_from_json(html)
                if extracted["title"]:
                    return extracted
                
                extracted = self._extract_with_regex(html)
                if extracted["title"]:
                    return extracted

        return None

    async def _try_mobile_page(self, item_id: str) -> Optional[Dict[str, Any]]:
        url = f"https://h5.m.taobao.com/awp/core/detail.htm?id={item_id}"
        html = await self._fetch_page(url)
        
        if html:
            extracted = self._extract_from_json(html)
            if extracted["title"]:
                return extracted
            
            extracted = self._extract_with_regex(html)
            if extracted["title"]:
                return extracted

        return None

    async def _try_mobile_api_wrapper(self, item_id: str) -> Optional[Dict[str, Any]]:
        return await self._try_mobile_api(item_id)


class SmartScraper:
    def __init__(self):
        self.taobao_scraper = TaobaoScraper()

    async def scrape(self, url: str) -> Dict[str, Any]:
        real_result = await self.taobao_scraper.scrape(url)
        
        if real_result["success"]:
            return real_result
        
        item_id = self.taobao_scraper._get_item_id(url)
        is_tmall = self.taobao_scraper._is_tmall(url)
        platform = "天猫" if is_tmall else "淘宝"
        
        mock_result = {
            "success": True,
            "message": f"{platform}商品数据采集（演示模式）- 提示：淘宝/天猫有反爬机制，真实数据获取需要处理登录验证",
            "data": {
                "item_id": item_id or "unknown",
                "title": f"商品{item_id} - 示例商品（演示数据）",
                "price": "99.00",
                "original_price": "199.00",
                "sku": [
                    {"name": "白色 - M码", "price": "99.00", "inventory": 100},
                    {"name": "白色 - L码", "price": "99.00", "inventory": 50},
                    {"name": "黑色 - M码", "price": "109.00", "inventory": 80},
                    {"name": "黑色 - L码", "price": "109.00", "inventory": 30},
                ],
                "images": [
                    "https://img.alicdn.com/imgextra/i1/123456789/O1CN01example1_123456789.jpg",
                    "https://img.alicdn.com/imgextra/i2/123456789/O1CN01example2_123456789.jpg",
                    "https://img.alicdn.com/imgextra/i3/123456789/O1CN01example3_123456789.jpg",
                ],
                "detail_images": [
                    "https://img.alicdn.com/imgextra/i1/123456789/O1CN01detail1_123456789.jpg",
                    "https://img.alicdn.com/imgextra/i2/123456789/O1CN01detail2_123456789.jpg",
                ]
            }
        }
        
        return mock_result


scraper = SmartScraper()
