import httpx
import re
import json
import asyncio
import logging
from typing import Optional, Dict, Any, List
from urllib.parse import urlparse, parse_qs, urlencode, quote
import random
import base64

logger = logging.getLogger(__name__)

class TaobaoScraper:
    def __init__(self, cookies: str = None):
        self.user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
        ]
        self.timeout = 60.0
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
            "sec-ch-ua": '"Chromium";v="125", "Not(A:Brand";v="24", "Google Chrome";v="125"',
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
        
        logger.info(f"请求URL: {url}")
        logger.info(f"使用Cookie: {'是' if request_cookies else '否'}")
        
        async with httpx.AsyncClient(
            timeout=self.timeout,
            follow_redirects=True,
            headers=headers,
            cookies=request_cookies if request_cookies else None
        ) as client:
            try:
                response = await client.get(url)
                logger.info(f"响应状态码: {response.status_code}")
                logger.info(f"响应长度: {len(response.text) if response.text else 0} 字符")
                
                if response.status_code == 200:
                    return response.text
                elif response.status_code == 302:
                    logger.info(f"重定向到: {response.headers.get('Location')}")
                else:
                    logger.warning(f"请求失败，状态码: {response.status_code}")
            except Exception as e:
                logger.error(f"请求错误: {e}")
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

        logger.info("开始解析HTML...")
        logger.info(f"HTML长度: {len(html)} 字符")

        all_json_data = []
        
        script_patterns = [
            r'window\.__INIT_DATA__\s*=\s*(\{[\s\S]+?\})\s*;\s*</script>',
            r'window\.__INIT_STATE__\s*=\s*(\{[\s\S]+?\})\s*;\s*</script>',
            r'window\.g_config\s*=\s*(\{[\s\S]+?\})\s*;\s*</script>',
            r'window\.g_page_config\s*=\s*(\{[\s\S]+?\})\s*;\s*</script>',
            r'window\.g\_tb\_page\_config\s*=\s*(\{[\s\S]+?\})\s*;\s*</script>',
            r'var\s+g_config\s*=\s*(\{[\s\S]+?\})\s*;\s*</script>',
            r'var\s+g_page_config\s*=\s*(\{[\s\S]+?\})\s*;\s*</script>',
        ]

        for pattern in script_patterns:
            matches = re.findall(pattern, html, re.IGNORECASE)
            for match in matches:
                try:
                    data = json.loads(match)
                    all_json_data.append(data)
                    logger.info(f"成功解析JSON数据块，类型: {type(data)}")
                except:
                    continue

        logger.info(f"找到 {len(all_json_data)} 个JSON数据块")

        for i, data in enumerate(all_json_data):
            extracted = self._extract_recursive(data)
            logger.info(f"第{i+1}个JSON块提取结果 - 标题: {'有' if extracted['title'] else '无'}, 价格: {'有' if extracted['price'] else '无'}, 图片: {len(extracted['images'])}")
            
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
                for img in extracted["detail_images"]:
                    if img not in result["detail_images"]:
                        result["detail_images"].append(img)
                for sku in extracted["sku"]:
                    if sku not in result["sku"]:
                        result["sku"].append(sku)

        if not result["title"]:
            logger.info("JSON解析未找到数据，尝试正则表达式...")
            result = self._extract_with_regex(html)

        logger.info(f"最终解析结果 - 标题: {bool(result['title'])}, 价格: {bool(result['price'])}, 图片: {len(result['images'])}")
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

        if depth > 10:
            return result

        if isinstance(data, dict):
            title_keys = [
                "title", "itemTitle", "item_name", "name", "goodsTitle", 
                "goods_name", "subTitle", "item_sub_title", "itemSubTitle",
                "mainTitle", "main_title", "itemMainTitle"
            ]
            price_keys = [
                "price", "itemPrice", "currentPrice", "displayPrice", 
                "salePrice", "priceText", "price_with_symbol", "current",
                "priceInfo", "finalPrice", "payPrice", "realPrice",
                "activityPrice", "promotionPrice", "discountPrice",
                "extraPrice", "extractedPrice"
            ]
            original_price_keys = [
                "originalPrice", "originPrice", "marketPrice", 
                "reservePrice", "market", "original", "listPrice",
                "suggestedPrice", "tagPrice", "strikethroughPrice"
            ]
            images_keys = [
                "images", "itemImages", "picUrls", "pics", "itemPics", 
                "picList", "itemImgUrls", "imageList", "imgList",
                "itemPicList", "mainPicList", "imageUrls"
            ]
            detail_images_keys = [
                "detailImages", "descImages", "detailPics", "descPics", 
                "descImageList", "detailImageList", "descriptionImages",
                "descImgList", "descPicList", "contentImages"
            ]
            sku_keys = [
                "skuList", "skus", "skuMap", "skuInfo", "skuListMap", 
                "skuProps", "skuItems", "skuMapList", "skuProperties"
            ]

            for key, value in data.items():
                key_lower = key.lower()
                
                if key in title_keys or key_lower in [k.lower() for k in title_keys]:
                    if isinstance(value, str) and value.strip():
                        title = value.strip()
                        if len(title) > 3 and "天猫" not in title and "淘宝" not in title and "天猫超市" not in title:
                            result["title"] = title
                
                elif key in price_keys or key_lower in [k.lower() for k in price_keys]:
                    if isinstance(value, dict):
                        if "priceText" in value:
                            result["price"] = str(value["priceText"])
                        elif "price" in value:
                            result["price"] = str(value["price"])
                        elif "currentPriceText" in value:
                            result["price"] = str(value["currentPriceText"])
                        elif "text" in value:
                            result["price"] = str(value["text"])
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
                for img in nested["images"]:
                    if img not in result["images"]:
                        result["images"].append(img)

        return result

    def _extract_image_url(self, img_data: Any) -> Optional[str]:
        if isinstance(img_data, str):
            return self._normalize_image_url(img_data)
        elif isinstance(img_data, dict):
            for key in ["url", "imgUrl", "image", "img", "path", "pic", "img_url", "imageUrl", "image_url"]:
                if key in img_data and isinstance(img_data[key], str):
                    return self._normalize_image_url(img_data[key])
        return None

    def _extract_sku_list(self, sku_data: Any) -> List[Dict[str, Any]]:
        result = []
        
        if isinstance(sku_data, list):
            for item in sku_data:
                if isinstance(item, dict):
                    sku_name = ""
                    for key in ["name", "skuName", "title", "propName", "properties", "spec", "label", "value", "text"]:
                        if key in item:
                            sku_name = str(item[key])
                            break
                    
                    sku_price = ""
                    for key in ["price", "skuPrice", "salePrice", "priceText", "text", "value", "amount"]:
                        if key in item:
                            sku_price = str(item[key])
                            break
                    
                    sku_inventory = 0
                    for key in ["inventory", "stock", "quantity", "count", "qty", "quantity"]:
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

        logger.info("使用正则表达式解析...")

        title_patterns = [
            r'<meta[^>]*property=["\']og:title["\'][^>]*content=["\']([^"\']+)["\']',
            r'<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']+)["\']',
            r'<h1[^>]*class=["\'][^"\']*title[^"\']*["\'][^>]*>([^<]+)</h1>',
            r'<h1[^>]*>([^<]+)</h1>',
            r'itemTitle["\']\s*:\s*["\']([^"\']+)["\']',
            r'"title"\s*:\s*"([^"]{3,})"',
            r'<title[^>]*>([^<]+)</title>',
            r'"itemTitle"\s*:\s*"([^"]+)"',
            r'"subTitle"\s*:\s*"([^"]+)"',
            r'"title"\s*:\s*"([^"]{5,})"',
        ]
        for pattern in title_patterns:
            match = re.search(pattern, html, re.IGNORECASE | re.DOTALL)
            if match:
                title = match.group(1).strip()
                if title and len(title) > 3:
                    filtered_title = re.sub(r'[\s\u3000]+', ' ', title).strip()
                    if "天猫" not in filtered_title and "淘宝" not in filtered_title and "天猫超市" not in filtered_title:
                        result["title"] = filtered_title
                        logger.info(f"正则找到标题: {filtered_title[:50]}")
                        break

        price_patterns = [
            r'"price"\s*:\s*["\']?([\d]+(?:\.\d+)?)["\']?',
            r'itemPrice["\']\s*:\s*["\']?([\d]+(?:\.\d+)?)["\']?',
            r'currentPrice["\']\s*:\s*["\']?([\d]+(?:\.\d+)?)["\']?',
            r'displayPrice["\']\s*:\s*["\']?([\d]+(?:\.\d+)?)["\']?',
            r'salePrice["\']\s*:\s*["\']?([\d]+(?:\.\d+)?)["\']?',
            r'priceText["\']\s*:\s*["\']([^"\']+)["\']',
            r'¥\s*([\d]+(?:\.\d+)?)',
            r'"priceText"\s*:\s*"([^"]+)"',
            r'"currentPriceText"\s*:\s*"([^"]+)"',
            r'"activityPrice"\s*:\s*"([^"]+)"',
        ]
        for pattern in price_patterns:
            match = re.search(pattern, html)
            if match:
                price = match.group(1).strip()
                if price and price != "0":
                    result["price"] = price
                    logger.info(f"正则找到价格: {price}")
                    break

        original_price_patterns = [
            r'originalPrice["\']\s*:\s*["\']?([\d]+(?:\.\d+)?)["\']?',
            r'originPrice["\']\s*:\s*["\']?([\d]+(?:\.\d+)?)["\']?',
            r'marketPrice["\']\s*:\s*["\']?([\d]+(?:\.\d+)?)["\']?',
            r'reservePrice["\']\s*:\s*["\']?([\d]+(?:\.\d+)?)["\']?',
            r'"originalPrice"\s*:\s*"([^"]+)"',
            r'"marketPrice"\s*:\s*"([^"]+)"',
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
            r'https?://img\d*\.alicdn\.com/[^"\'\s<>]+',
            r'https?://\w+\.alicdn\.com/[^"\'\s<>]+',
            r'https?://\w+\.taobaocdn\.com/[^"\'\s<>]+',
        ]
        for pattern in image_patterns:
            matches = re.findall(pattern, html, re.IGNORECASE)
            for img in matches:
                if any(ext in img.lower() for ext in ['.jpg', '.png', '.jpeg', '.gif', '.webp', '.bmp']) or 'jpg' in img.lower() or 'png' in img.lower():
                    img_url = f"https:{img}" if img.startswith("//") else img
                    if img_url not in result["images"]:
                        result["images"].append(img_url)
                    if len(result["images"]) >= 50:
                        break

        if result["images"]:
            logger.info(f"正则找到 {len(result['images'])} 张图片")

        return result

    async def _try_pc_page(self, item_id: str, is_tmall: bool) -> Optional[Dict[str, Any]]:
        logger.info(f"尝试PC端页面策略 (商品ID: {item_id}, 天猫: {is_tmall})")
        
        urls = []
        if is_tmall:
            urls.extend([
                f"https://detail.tmall.com/item.htm?id={item_id}",
                f"https://detail.tmall.com/item.htm?id={item_id}&spm=a220m.1000858.1000725.1",
            ])
        else:
            urls.extend([
                f"https://item.taobao.com/item.htm?id={item_id}",
                f"https://item.taobao.com/item.htm?id={item_id}&spm=a21bo.jianhua.201875.1",
                f"https://world.taobao.com/item.htm?id={item_id}",
            ])

        for i, url in enumerate(urls):
            logger.info(f"尝试PC端URL {i+1}/{len(urls)}: {url}")
            headers = self._get_random_headers(referer="https://www.taobao.com/")
            headers["Referer"] = f"https://www.taobao.com/"
            headers["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
            
            html = await self._fetch_page(url, headers=headers)
            if html:
                extracted = self._extract_from_html(html)
                if extracted["title"]:
                    logger.info(f"PC端页面策略成功 - 标题: {extracted['title'][:30]}")
                    return extracted
                else:
                    logger.warning(f"PC端页面策略未找到标题，尝试下一个URL")

        logger.warning("PC端页面策略失败")
        return None

    async def _try_mobile_page(self, item_id: str) -> Optional[Dict[str, Any]]:
        logger.info(f"尝试移动端页面策略 (商品ID: {item_id})")
        
        urls = [
            f"https://h5.m.taobao.com/awp/core/detail.htm?id={item_id}",
            f"https://m.intl.taobao.com/detail/detail.html?id={item_id}",
            f"https://m.tb.cn/h.{item_id}",
        ]

        for i, url in enumerate(urls):
            logger.info(f"尝试移动端URL {i+1}/{len(urls)}: {url}")
            headers = self._get_random_headers(referer="https://h5.m.taobao.com/")
            headers["User-Agent"] = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1"
            headers["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
            
            html = await self._fetch_page(url, headers=headers)
            if html:
                extracted = self._extract_from_html(html)
                if extracted["title"]:
                    logger.info(f"移动端页面策略成功 - 标题: {extracted['title'][:30]}")
                    return extracted
                else:
                    logger.warning(f"移动端页面策略未找到标题，尝试下一个URL")

        logger.warning("移动端页面策略失败")
        return None

    async def _try_mobile_api(self, item_id: str) -> Optional[Dict[str, Any]]:
        logger.info(f"尝试Mobile API策略 (商品ID: {item_id})")
        
        api_urls = [
            f"https://h5api.m.taobao.com/h5/mtop.taobao.detail.getdetail/6.0/?data=%7B%22itemNumId%22%3A%22{item_id}%22%7D",
            f"https://h5api.m.taobao.com/h5/mtop.taobao.detail.getdetail/6.0/?data={quote(json.dumps({'itemNumId': str(item_id)}))}",
        ]

        headers = self._get_random_headers()
        headers["Referer"] = f"https://h5.m.taobao.com/awp/core/detail.htm?id={item_id}"
        headers["X-Requested-With"] = "XMLHttpRequest"
        headers["Accept"] = "application/json, text/plain, */*"

        async with httpx.AsyncClient(
            timeout=self.timeout, 
            follow_redirects=True, 
            headers=headers,
            cookies=self.cookies if self.cookies else None
        ) as client:
            for i, api_url in enumerate(api_urls):
                logger.info(f"尝试Mobile API {i+1}/{len(api_urls)}: {api_url[:80]}")
                try:
                    response = await client.get(api_url)
                    logger.info(f"API响应状态码: {response.status_code}")
                    
                    if response.status_code == 200:
                        try:
                            data = response.json()
                            logger.info(f"API响应数据类型: {type(data)}, 包含字段: {list(data.keys()) if isinstance(data, dict) else 'N/A'}")
                            
                            extracted = self._extract_recursive(data)
                            if extracted["title"]:
                                logger.info(f"Mobile API策略成功 - 标题: {extracted['title'][:30]}")
                                return extracted
                            else:
                                logger.warning(f"Mobile API响应未找到标题")
                        except Exception as e:
                            logger.error(f"JSON解析错误: {e}")
                            logger.debug(f"原始响应: {response.text[:500]}")
                            pass
                except Exception as e:
                    logger.error(f"Mobile API请求错误: {e}")
                    continue
        
        logger.warning("Mobile API策略失败")
        return None

    async def scrape(self, url: str, cookies: str = None) -> Dict[str, Any]:
        logger.info("=" * 60)
        logger.info(f"开始采集: {url}")
        logger.info("=" * 60)

        if cookies:
            new_cookies = self._parse_cookies(cookies)
            logger.info(f"更新Cookie: {len(new_cookies)} 个键值")
            self.cookies.update(new_cookies)
        logger.info(f"当前Cookie数量: {len(self.cookies)}")

        item_id = self._get_item_id(url)
        if not item_id:
            logger.error("无法提取商品ID")
            return {
                "success": False,
                "message": "无效的淘宝/天猫链接，请确保链接格式正确（包含商品ID）。示例格式：https://item.taobao.com/item.htm?id=123456 或 https://detail.tmall.com/item.htm?id=123456",
                "data": None
            }
        logger.info(f"商品ID: {item_id}")

        is_tmall = self._is_tmall(url)
        platform = "天猫" if is_tmall else "淘宝"
        logger.info(f"平台: {platform}")

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
            logger.info(f"\n尝试策略: {strategy_name}")
            try:
                extracted = await strategy_func(*args)
                if extracted and extracted.get("title"):
                    logger.info(f"策略 {strategy_name} 成功")
                    if not result["title"]:
                        result.update(extracted)
                        logger.info(f"更新结果 - 标题: {result['title'][:50] if result['title'] else '空'}")
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
                else:
                    logger.warning(f"策略 {strategy_name} 未找到有效数据")
            except Exception as e:
                logger.error(f"{strategy_name}策略错误: {e}")
                import traceback
                logger.error(traceback.format_exc())
                continue

        logger.info("\n" + "=" * 60)
        logger.info("采集结果汇总")
        logger.info("=" * 60)
        logger.info(f"标题: {'✅' if result['title'] else '❌'} {result['title'][:50] if result['title'] else '无'}")
        logger.info(f"价格: {'✅' if result['price'] else '❌'} {result['price']}")
        logger.info(f"原价: {'✅' if result['original_price'] else '❌'} {result['original_price']}")
        logger.info(f"图片: {len(result['images'])} 张")
        logger.info(f"详情图: {len(result['detail_images'])} 张")
        logger.info(f"SKU: {len(result['sku'])} 个")

        if not result["title"]:
            logger.error("所有策略都未找到标题，采集失败")
            return {
                "success": False,
                "message": f"无法获取{platform}商品数据。淘宝/天猫有较强的反爬机制，请尝试以下方法：1) 配置登录后的Cookie 2) 稍后重试 3) 使用官方API。",
                "data": {
                    "item_id": item_id,
                    "platform": platform,
                    "has_cookies": bool(self.cookies),
                    "cookie_count": len(self.cookies)
                }
            }

        logger.info("✅ 采集成功！")
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
