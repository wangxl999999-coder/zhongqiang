import httpx
import re
import json
import asyncio
from typing import Optional, Dict, Any, List
from urllib.parse import urlparse, parse_qs, urlencode
import random
import base64


class TaobaoScraper:
    def __init__(self, cookies: str = None):
        self.user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15",
        ]
        self.timeout = 45.0
        self.cookies = self._parse_cookies(cookies) if cookies else {}

    def _parse_cookies(self, cookie_str: str) -> Dict[str, str]:
        cookies = {}
        if not cookie_str:
            return cookies
        
        cookie_str = cookie_str.strip()
        if cookie_str.startswith('{'):
            try:
                return json.loads(cookie_str)
            except:
                pass
        
        parts = cookie_str.split(';')
        for part in parts:
            part = part.strip()
            if '=' in part:
                key, value = part.split('=', 1)
                cookies[key.strip()] = value.strip()
        
        return cookies

    def _get_random_headers(self, referer: str = None) -> Dict[str, str]:
        headers = {
            "User-Agent": random.choice(self.user_agents),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Cache-Control": "max-age=0",
            "sec-ch-ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
        }
        
        if referer:
            headers["Referer"] = referer
        
        return headers

    def _get_item_id(self, url: str) -> Optional[str]:
        patterns = [
            r"item\.taobao\.com/item\.htm\?id=(\d+)",
            r"detail\.tmall\.com/item\.htm\?id=(\d+)",
            r"item\.tmall\.com/item\.htm\?id=(\d+)",
            r"item\.taobao\.com/item\?id=(\d+)",
            r"h5\.m\.taobao\.com/awp/core/detail\.htm\?id=(\d+)",
            r"m\.taobao\.com/page/detail\.htm\?id=(\d+)",
            r"world\.taobao\.com/item\.htm\?id=(\d+)",
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

    async def _fetch_page(self, url: str, headers: Dict[str, str] = None, cookies: Dict[str, str] = None) -> Optional[str]:
        if headers is None:
            headers = self._get_random_headers()
        
        request_cookies = self.cookies.copy()
        if cookies:
            request_cookies.update(cookies)
        
        async with httpx.AsyncClient(
            timeout=self.timeout,
            follow_redirects=True,
            headers=headers,
            cookies=request_cookies if request_cookies else None
        ) as client:
            try:
                response = await client.get(url)
                if response.status_code == 200:
                    return response.text
                else:
                    print(f"请求状态码: {response.status_code}")
            except Exception as e:
                print(f"请求错误: {e}")
        return None

    def _extract_from_html(self, html: str) -> Dict[str, Any]:
        result = {
            "title": "",
            "price": "",
            "original_price": "",
            "sku": [],
            "images": [],
            "detail_images": []
        }

        all_json_data = []
        
        script_patterns = [
            r'<script[^>]*>\s*(window\.__INIT_DATA__\s*=\s*\{[\s\S]+?\})\s*;\s*</script>',
            r'<script[^>]*>\s*(window\.__INIT_STATE__\s*=\s*\{[\s\S]+?\})\s*;\s*</script>',
            r'<script[^>]*>\s*(var\s+\w+\s*=\s*\{[\s\S]+?"title"[\s\S]+?\})\s*;\s*</script>',
            r'<script[^>]*>\s*(let\s+\w+\s*=\s*\{[\s\S]+?"title"[\s\S]+?\})\s*;\s*</script>',
            r'<script[^>]*>\s*(const\s+\w+\s*=\s*\{[\s\S]+?"title"[\s\S]+?\})\s*;\s*</script>',
        ]

        for pattern in script_patterns:
            matches = re.findall(pattern, html, re.IGNORECASE)
            for match in matches:
                try:
                    json_match = re.search(r'=\s*(\{[\s\S]+\})', match)
                    if json_match:
                        data = json.loads(json_match.group(1))
                        all_json_data.append(data)
                except:
                    continue

        for data in all_json_data:
            extracted = self._extract_recursive(data)
            if extracted["title"] and not result["title"]:
                result.update(extracted)
            elif extracted["title"]:
                if not result["price"] and extracted["price"]:
                    result["price"] = extracted["price"]
                if not result["original_price"] and extracted["original_price"]:
                    result["original_price"] = extracted["original_price"]
                for img in extracted["images"]:
                    if img not in result["images"]:
                        result["images"].append(img)

        if not result["title"]:
            result = self._extract_with_regex(html)

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

        if depth > 8:
            return result

        if isinstance(data, dict):
            title_keys = [
                "title", "itemTitle", "item_name", "name", "goodsTitle", 
                "goods_name", "subTitle", "item_sub_title", "itemSubTitle"
            ]
            price_keys = [
                "price", "itemPrice", "currentPrice", "displayPrice", 
                "salePrice", "priceText", "price_with_symbol", "current",
                "priceInfo", "finalPrice", "payPrice", "realPrice"
            ]
            original_price_keys = [
                "originalPrice", "originPrice", "marketPrice", 
                "reservePrice", "market", "original", "listPrice"
            ]
            images_keys = [
                "images", "itemImages", "picUrls", "pics", "itemPics", 
                "picList", "itemImgUrls", "imageList", "imgList"
            ]
            detail_images_keys = [
                "detailImages", "descImages", "detailPics", "descPics", 
                "descImageList", "detailImageList", "descriptionImages"
            ]
            sku_keys = [
                "skuList", "skus", "skuMap", "skuInfo", "skuListMap", 
                "skuProps", "skuItems", "skuMapList"
            ]

            for key, value in data.items():
                key_lower = key.lower()
                
                if key in title_keys or key_lower in [k.lower() for k in title_keys]:
                    if isinstance(value, str) and value.strip() and len(value.strip()) > 3:
                        title = value.strip()
                        if "天猫" not in title and "淘宝" not in title and "天猫超市" not in title:
                            result["title"] = title
                
                elif key in price_keys or key_lower in [k.lower() for k in price_keys]:
                    if isinstance(value, dict):
                        if "priceText" in value:
                            result["price"] = str(value["priceText"])
                        elif "price" in value:
                            result["price"] = str(value["price"])
                        elif "currentPriceText" in value:
                            result["price"] = str(value["currentPriceText"])
                    elif isinstance(value, (str, int, float)) and str(value).strip():
                        price_str = str(value).strip()
                        if price_str and price_str != "0":
                            result["price"] = price_str
                
                elif key in original_price_keys or key_lower in [k.lower() for k in original_price_keys]:
                    if isinstance(value, dict):
                        if "priceText" in value:
                            result["original_price"] = str(value["priceText"])
                        elif "price" in value:
                            result["original_price"] = str(value["price"])
                    elif isinstance(value, (str, int, float)) and str(value).strip():
                        result["original_price"] = str(value).strip()
                
                elif key in images_keys or key_lower in [k.lower() for k in images_keys]:
                    if isinstance(value, list):
                        for img in value:
                            img_url = self._extract_image_url(img)
                            if img_url and img_url not in result["images"]:
                                result["images"].append(img_url)
                
                elif key in detail_images_keys or key_lower in [k.lower() for k in detail_images_keys]:
                    if isinstance(value, list):
                        for img in value:
                            img_url = self._extract_image_url(img)
                            if img_url and img_url not in result["detail_images"]:
                                result["detail_images"].append(img_url)
                
                elif key in sku_keys or key_lower in [k.lower() for k in sku_keys]:
                    sku_list = self._extract_sku_list(value)
                    for sku in sku_list:
                        if sku not in result["sku"]:
                            result["sku"].append(sku)
                
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

    def _extract_image_url(self, img_data: Any) -> Optional[str]:
        if isinstance(img_data, str):
            return self._normalize_image_url(img_data)
        elif isinstance(img_data, dict):
            for key in ["url", "imgUrl", "image", "img", "path", "pic"]:
                if key in img_data and isinstance(img_data[key], str):
                    return self._normalize_image_url(img_data[key])
        return None

    def _extract_sku_list(self, sku_data: Any) -> List[Dict[str, Any]]:
        result = []
        
        if isinstance(sku_data, list):
            for item in sku_data:
                if isinstance(item, dict):
                    sku_name = ""
                    for key in ["name", "skuName", "title", "propName", "properties", "spec"]:
                        if key in item:
                            sku_name = str(item[key])
                            break
                    
                    sku_price = ""
                    for key in ["price", "skuPrice", "salePrice", "priceText"]:
                        if key in item:
                            sku_price = str(item[key])
                            break
                    
                    sku_inventory = 0
                    for key in ["inventory", "stock", "quantity", "count"]:
                        if key in item:
                            try:
                                sku_inventory = int(item[key])
                            except:
                                sku_inventory = 0
                            break
                    
                    if sku_name:
                        result.append({
                            "name": sku_name,
                            "price": sku_price,
                            "inventory": sku_inventory
                        })
        
        elif isinstance(sku_data, dict):
            for key, value in sku_data.items():
                sku_item = self._extract_sku_list(value)
                result.extend(sku_item)
        
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

        title_patterns = [
            r'<meta[^>]*property=["\']og:title["\'][^>]*content=["\']([^"\']+)["\']',
            r'<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']+)["\']',
            r'<h1[^>]*class=["\'][^"\']*title[^"\']*["\'][^>]*>([^<]+)</h1>',
            r'<h1[^>]*>([^<]+)</h1>',
            r'itemTitle["\']\s*:\s*["\']([^"\']+)["\']',
            r'"title"\s*:\s*"([^"]{3,})"',
            r'<title[^>]*>([^<]+)</title>',
        ]
        for pattern in title_patterns:
            match = re.search(pattern, html, re.IGNORECASE | re.DOTALL)
            if match:
                title = match.group(1).strip()
                if title and len(title) > 3:
                    filtered_title = re.sub(r'[\s\u3000]+', ' ', title).strip()
                    if "天猫" not in filtered_title and "淘宝" not in filtered_title and "天猫超市" not in filtered_title:
                        result["title"] = filtered_title
                        break

        price_patterns = [
            r'"price"\s*:\s*["\']?([\d]+(?:\.\d+)?)["\']?',
            r'itemPrice["\']\s*:\s*["\']?([\d]+(?:\.\d+)?)["\']?',
            r'currentPrice["\']\s*:\s*["\']?([\d]+(?:\.\d+)?)["\']?',
            r'displayPrice["\']\s*:\s*["\']?([\d]+(?:\.\d+)?)["\']?',
            r'salePrice["\']\s*:\s*["\']?([\d]+(?:\.\d+)?)["\']?',
            r'priceText["\']\s*:\s*["\']([^"\']+)["\']',
            r'¥\s*([\d]+(?:\.\d+)?)',
        ]
        for pattern in price_patterns:
            match = re.search(pattern, html)
            if match:
                price = match.group(1).strip()
                if price and price != "0":
                    result["price"] = price
                    break

        original_price_patterns = [
            r'originalPrice["\']\s*:\s*["\']?([\d]+(?:\.\d+)?)["\']?',
            r'originPrice["\']\s*:\s*["\']?([\d]+(?:\.\d+)?)["\']?',
            r'marketPrice["\']\s*:\s*["\']?([\d]+(?:\.\d+)?)["\']?',
            r'reservePrice["\']\s*:\s*["\']?([\d]+(?:\.\d+)?)["\']?',
        ]
        for pattern in original_price_patterns:
            match = re.search(pattern, html)
            if match:
                result["original_price"] = match.group(1).strip()
                break

        image_patterns = [
            r'//img\d*\.alicdn\.com/[^"\'\s<>]+',
            r'//\w+\.alicdn\.com/[^"\'\s<>]+',
            r'//\w+\.taobaocdn\.com/[^"\'\s<>]+',
        ]
        for pattern in image_patterns:
            matches = re.findall(pattern, html, re.IGNORECASE)
            for img in matches:
                if any(ext in img.lower() for ext in ['.jpg', '.png', '.jpeg', '.gif', '.webp', '.bmp']) or 'jpg' in img.lower() or 'png' in img.lower():
                    img_url = f"https:{img}"
                    if img_url not in result["images"]:
                        result["images"].append(img_url)
                    if len(result["images"]) >= 50:
                        break

        return result

    async def _try_pc_page(self, item_id: str, is_tmall: bool) -> Optional[Dict[str, Any]]:
        urls = []
        if is_tmall:
            urls.extend([
                f"https://detail.tmall.com/item.htm?id={item_id}",
            ])
        else:
            urls.extend([
                f"https://item.taobao.com/item.htm?id={item_id}",
                f"https://world.taobao.com/item.htm?id={item_id}",
            ])

        for url in urls:
            headers = self._get_random_headers(referer="https://www.taobao.com/")
            html = await self._fetch_page(url, headers=headers)
            if html:
                extracted = self._extract_from_html(html)
                if extracted["title"]:
                    return extracted

        return None

    async def _try_mobile_page(self, item_id: str) -> Optional[Dict[str, Any]]:
        urls = [
            f"https://h5.m.taobao.com/awp/core/detail.htm?id={item_id}",
            f"https://m.intl.taobao.com/detail/detail.html?id={item_id}",
        ]

        for url in urls:
            headers = self._get_random_headers(referer="https://h5.m.taobao.com/")
            html = await self._fetch_page(url, headers=headers)
            if html:
                extracted = self._extract_from_html(html)
                if extracted["title"]:
                    return extracted

        return None

    async def _try_mobile_api(self, item_id: str) -> Optional[Dict[str, Any]]:
        api_urls = [
            f"https://h5api.m.taobao.com/h5/mtop.taobao.detail.getdetail/6.0/?data=%7B%22itemNumId%22%3A%22{item_id}%22%7D",
        ]

        headers = self._get_random_headers()
        headers["Referer"] = f"https://h5.m.taobao.com/awp/core/detail.htm?id={item_id}"
        headers["X-Requested-With"] = "XMLHttpRequest"

        async with httpx.AsyncClient(
            timeout=self.timeout, 
            follow_redirects=True, 
            headers=headers,
            cookies=self.cookies if self.cookies else None
        ) as client:
            for api_url in api_urls:
                try:
                    response = await client.get(api_url)
                    if response.status_code == 200:
                        try:
                            data = response.json()
                            extracted = self._extract_recursive(data)
                            if extracted["title"]:
                                return extracted
                        except Exception as e:
                            print(f"JSON解析错误: {e}")
                            pass
                except Exception as e:
                    print(f"Mobile API错误: {e}")
                    continue
        return None

    async def scrape(self, url: str, cookies: str = None) -> Dict[str, Any]:
        if cookies:
            self.cookies.update(self._parse_cookies(cookies))

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
            ("PC端页面", self._try_pc_page, (item_id, is_tmall)),
            ("移动端页面", self._try_mobile_page, (item_id,)),
            ("Mobile API", self._try_mobile_api, (item_id,)),
        ]

        for strategy_name, strategy_func, args in strategies:
            try:
                extracted = await strategy_func(*args)
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
                "message": f"无法获取{platform}商品数据。淘宝/天猫有较强的反爬机制，请尝试以下方法：1) 配置登录后的Cookie 2) 稍后重试 3) 使用官方API。",
                "data": {
                    "item_id": item_id,
                    "platform": platform,
                    "has_cookies": bool(self.cookies)
                }
            }

        return {
            "success": True,
            "message": f"{platform}商品数据采集成功",
            "data": result
        }


class SmartScraper:
    def __init__(self, default_cookies: str = None):
        self.default_cookies = default_cookies

    async def scrape(self, url: str, cookies: str = None) -> Dict[str, Any]:
        use_cookies = cookies or self.default_cookies
        scraper = TaobaoScraper(cookies=use_cookies)
        real_result = await scraper.scrape(url, cookies=cookies)
        
        if real_result["success"]:
            return real_result
        
        item_id = scraper._get_item_id(url)
        is_tmall = scraper._is_tmall(url)
        platform = "天猫" if is_tmall else "淘宝"
        
        mock_result = {
            "success": True,
            "message": f"{platform}商品数据采集（演示模式）- 提示：请配置Cookie以获取真实数据",
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
