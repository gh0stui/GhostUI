import os
import json
import re
import shutil
from xml.etree import ElementTree
from PIL import Image, ImageDraw
from utils.bounding_box import parse_bounds
from utils.gesture_handler import calculate_pinch_zoom_coordinates
from utils.xml_to_html import xml_to_html
class DataSaver:
    def __init__(self, base_dir="dataset"):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)
        self.current_index_dir = None

    def get_action_dir(self, app_package, current_screen, action) -> str:
        return os.path.join(self.base_dir, app_package, current_screen, action)
    
    def get_next_index_dir(self, app_package, current_screen, action) -> str:
        action_dir = self.get_action_dir(app_package, current_screen, action)
        os.makedirs(action_dir, exist_ok=True)

        existing_indices = [
            int(folder) for folder in os.listdir(action_dir) if folder.isdigit()
        ]
        
        next_index = (max(existing_indices) + 1) if existing_indices else 0
        self.current_index_dir = os.path.join(action_dir, str(next_index))
        os.makedirs(self.current_index_dir, exist_ok=True)
        
        return self.current_index_dir

    def get_save_path(self, stage, extension) -> str:
        if not self.current_index_dir:
            raise ValueError("❌ Index folder does not exist.")

        return os.path.join(self.current_index_dir, f"{stage}.{extension}")

    def get_app_info(self, driver):
        try:
            current_package = driver.current_package
            
            package_info_cmd = f"adb shell dumpsys package {current_package}"
            result = os.popen(package_info_cmd).read()
            
            version_name_match = re.search(r"versionName=([^\s]+)", result)            
            version_name = version_name_match.group(1) if version_name_match else "Unknown"
                        
            app_info = {
                "app_name": "Unknown",
                "category": "Unknown",
                "description": "Unknown",
                "package_name": current_package,
                "version": version_name,
            }
            
            return app_info
            
        except Exception as e:
            print(f"❌ Failed to retrieve app information: {e}")
            return {
                "package_name": driver.current_package,
            }
    
    def get_app_description_from_play_store(self, package_name):
        try:
            import requests
            from bs4 import BeautifulSoup
            
            url = f"https://play.google.com/store/apps/details?id={package_name}&hl=en"
            headers = {
                "User-Agent": "Chrome/120.0.0.0"
            }
            
            response = requests.get(url, headers=headers)
            soup = BeautifulSoup(response.text, "html.parser")
            
            app_element = soup.select_one("h1 > span.AfwdI")
            app_name = app_element.text.strip() if app_element else "Unknown"

            category_element = soup.find("a", class_="WpHeLc VfPpkd-mRLv6 VfPpkd-RLmnJb")
            category = category_element.get("aria-label") if category_element else "Unknown"

            description_element = soup.select_one("meta[itemprop='description']")
            description = description_element.get("content") if description_element else "Unknown"

            return {
                "app_name": app_name,
                "category": category,
                "description": description
            }
        
        except Exception as e:
            print(f"❌ Failed to retrieve Play Store information: {e}")
            return {
                "app_name": "Unknown",
                "category": "Unknown",
                "description": "Unknown"
            }
    
    def save_app_metadata(self, app_package, app_info) -> str:
        app_dir = os.path.join(self.base_dir, app_package)
        os.makedirs(app_dir, exist_ok=True)
        
        metadata_path = os.path.join(app_dir, "metadata.json")
        existing_metadata = {}
        if os.path.exists(metadata_path):
            try:
                with open(metadata_path, "r", encoding="utf-8") as f:
                    existing_metadata = json.load(f)
            except Exception as e:
                print(f"❌ Failed to load existing metadata: {e}")
        
        updated_metadata = {**existing_metadata, **app_info}
        
        try:
            with open(metadata_path, "w", encoding="utf-8") as f:
                json.dump(updated_metadata, f, indent=2, ensure_ascii=False)
            print(f"✅ App metadata has been saved: {metadata_path}")
            return metadata_path
        except Exception as e:
            print(f"❌ Failed to save metadata: {e}")
            return None
    
    def save_screenshot(self, driver, app_package, current_screen, action, stage) -> str:
        if stage == "before":
            self.get_next_index_dir(app_package, current_screen, action)

        path = self.get_save_path(stage, "png")
        driver.get_screenshot_as_file(path)
        return path


    def save_annotated_screenshot(self, driver, action_name, screenshot_path, start_point=None, bounds=None, end_point=None) -> str:
        if not os.path.exists(screenshot_path):
            print(f"❌ Screenshot file does not exist: {screenshot_path}")
            return None
            
        try:
            img = Image.open(screenshot_path)
            draw = ImageDraw.Draw(img)
            
            if isinstance(start_point, tuple) and len(start_point) == 2:
                x, y = start_point
            else:
                print(f"❌ Invalid point format: {start_point}")
                return None
            
            circle_color=(239, 128, 34, 254)
            box_color=(239, 128, 34, 254)  # Changed from red to orange
            line_color=(239, 128, 34, 254)
            arrow_color=(239, 128, 34, 254)
            pinch_color=(239, 128, 34, 254)

            circle_radius=25
            line_width=10

            if action_name in ["pinch_zoom_in", "pinch_zoom_out"]:
                if action_name == "pinch_zoom_in":
                    zoom_in = True
                else:
                    zoom_in = False
                
                finger1_start_x, finger1_start_y, finger1_end_x, finger1_end_y, finger2_start_x, finger2_start_y, finger2_end_x, finger2_end_y = calculate_pinch_zoom_coordinates(driver, x, y, zoom_in)

                draw.ellipse(
                    [(finger1_start_x - circle_radius, finger1_start_y - circle_radius), 
                    (finger1_start_x + circle_radius, finger1_start_y + circle_radius)], 
                    outline=pinch_color, width=line_width
                )
                draw.ellipse(
                    [(finger2_start_x - circle_radius, finger2_start_y - circle_radius), 
                    (finger2_start_x + circle_radius, finger2_start_y + circle_radius)], 
                    outline=pinch_color, width=line_width
                )
                
                for i in range(0, 360, 20):
                    import math
                    rad = math.radians(i)
                    x1 = finger1_end_x + circle_radius * math.cos(rad)
                    y1 = finger1_end_y + circle_radius * math.sin(rad)
                    x2 = finger1_end_x + (circle_radius + 5) * math.cos(rad)
                    y2 = finger1_end_y + (circle_radius + 5) * math.sin(rad)
                    draw.line([(x1, y1), (x2, y2)], fill=pinch_color, width=2)
                    
                    x1 = finger2_end_x + circle_radius * math.cos(rad)
                    y1 = finger2_end_y + circle_radius * math.sin(rad)
                    x2 = finger2_end_x + (circle_radius + 5) * math.cos(rad)
                    y2 = finger2_end_y + (circle_radius + 5) * math.sin(rad)
                    draw.line([(x1, y1), (x2, y2)], fill=pinch_color, width=2)
                
                draw.line([(finger1_start_x, finger1_start_y), (finger1_end_x, finger1_end_y)], 
                        fill=pinch_color, width=line_width)
                draw.line([(finger2_start_x, finger2_start_y), (finger2_end_x, finger2_end_y)], 
                        fill=pinch_color, width=line_width)
                
                arrow_size = 15
                import math
                
                angle1 = math.atan2(finger1_end_y - finger1_start_y, finger1_end_x - finger1_start_x)
                arrow1_x1 = finger1_end_x - arrow_size * math.cos(angle1 - math.pi/6)
                arrow1_y1 = finger1_end_y - arrow_size * math.sin(angle1 - math.pi/6)
                arrow1_x2 = finger1_end_x - arrow_size * math.cos(angle1 + math.pi/6)
                arrow1_y2 = finger1_end_y - arrow_size * math.sin(angle1 + math.pi/6)
                draw.polygon([(finger1_end_x, finger1_end_y), (arrow1_x1, arrow1_y1), (arrow1_x2, arrow1_y2)], 
                            fill=pinch_color)
                
                angle2 = math.atan2(finger2_end_y - finger2_start_y, finger2_end_x - finger2_start_x)
                arrow2_x1 = finger2_end_x - arrow_size * math.cos(angle2 - math.pi/6)
                arrow2_y1 = finger2_end_y - arrow_size * math.sin(angle2 - math.pi/6)
                arrow2_x2 = finger2_end_x - arrow_size * math.cos(angle2 + math.pi/6)
                arrow2_y2 = finger2_end_y - arrow_size * math.sin(angle2 + math.pi/6)
                draw.polygon([(finger2_end_x, finger2_end_y), (arrow2_x1, arrow2_y1), (arrow2_x2, arrow2_y2)], 
                            fill=pinch_color)
            
            elif action_name in ["swipe_left", "swipe_right", "scroll_up", "scroll_down"] and end_point:
                end_x, end_y = end_point
                
                draw.ellipse(
                    [(x - circle_radius, y - circle_radius), 
                    (x + circle_radius, y + circle_radius)], 
                    fill=circle_color
                )
                
                draw.line([(x, y), (end_x, end_y)], fill=line_color, width=5)
                
                arrow_size = 20

                import math
                angle = math.atan2(end_y - y, end_x - x)
                
                arrow_x1 = end_x - arrow_size * math.cos(angle - math.pi/6)
                arrow_y1 = end_y - arrow_size * math.sin(angle - math.pi/6)
                arrow_x2 = end_x - arrow_size * math.cos(angle + math.pi/6)
                arrow_y2 = end_y - arrow_size * math.sin(angle + math.pi/6)
                
                draw.polygon([(end_x, end_y), (arrow_x1, arrow_y1), (arrow_x2, arrow_y2)], 
                            fill=arrow_color)
            else:
                draw.ellipse(
                    [(x - circle_radius, y - circle_radius), (x + circle_radius, y + circle_radius)], 
                    outline=circle_color, width=line_width
                )

                draw.ellipse(
                    [(x - 10, y - 10), (x + 10, y + 10)], 
                    fill=circle_color
                )
            
            if bounds:
                if isinstance(bounds, str):
                    bounds = parse_bounds(bounds)
                
                x1, y1, x2, y2 = bounds
                draw.rectangle([(x1, y1), (x2, y2)], outline=box_color, width=line_width)
            
            annotated_path = self.get_save_path("before_annotated", "png")
            img.save(annotated_path)
            
            return annotated_path
            
        except Exception as e:
            print(f"❌ Failed to add annotation: {e}")
            return None
    
    def save_annotated_with_children_screenshot(self, driver, action_name, screenshot_path, target_element_path=None) -> str:
        """Save annotated screenshot with interactive children highlighted"""
        try:
            annotated_path = self.get_save_path("before_annotated", "png")
            if not os.path.exists(annotated_path):
                print(f"❌ Annotated screenshot does not exist: {annotated_path}")
                return None
            
            xml_path = self.get_save_path("before", "xml")
            if not os.path.exists(xml_path):
                print(f"❌ XML file does not exist: {xml_path}")
                return None
            
            tree = ElementTree.parse(xml_path)
            root = tree.getroot()
            
            # Find the target element using path
            target_element = None
            if target_element_path:
                target_element = self._find_element_by_path(root, target_element_path)
                
            # If path-based search fails, try bounds-based search
            if target_element is None:
                action_json_path = self.get_save_path("action", "json")
                if os.path.exists(action_json_path):
                    with open(action_json_path, "r", encoding="utf-8") as f:
                        action_data = json.load(f)
                        target_bounds = action_data.get("bounds")
                        if target_bounds:
                            target_element = self._find_element_by_bounds(root, target_bounds)
            
            if target_element is None:
                # Create children annotation without target element (copy existing annotated image)
                children_annotated_path = self.get_save_path("before_annotated_with_children", "png")
                import shutil
                shutil.copy2(annotated_path, children_annotated_path)
                return children_annotated_path
            
            # Load the already annotated image as base
            img = Image.open(annotated_path)

            if img.mode != 'RGBA':
                img = img.convert('RGBA')

            draw = ImageDraw.Draw(img)
            
            # Draw interactive children on top of existing annotations
            self._draw_interactive_children_boxes(img, target_element, action_name)
            
            # Redraw action annotation on top of hatching
            self._redraw_action_annotation_on_children(img, action_name)
            
            # Save the annotated image with children
            children_annotated_path = self.get_save_path("before_annotated_with_children", "png")
            img.save(children_annotated_path)
            
            return children_annotated_path
            
        except Exception as e:
            print(f"❌ Failed to add children annotation: {e}")
            return None
    
    def _find_element_by_path(self, root, target_path):
        """Find element by path using class_name[index] format"""
        def parse_path_component(component):
            if '[' not in component:
                return component, None
            class_part, rest = component.split('[', 1)
            index_part = rest.split(']', 1)[0]
            target_index = int(index_part)
            return class_part, target_index
        
        def traverse(element, path_parts, current_index=0):
            if current_index >= len(path_parts):
                return element
            if not path_parts[current_index]:
                return traverse(element, path_parts, current_index + 1)
            
            target_class, target_index = parse_path_component(path_parts[current_index])
            
            if current_index == 1 and len(path_parts) > 1:
                current_class = element.attrib.get("class", element.tag)
                current_index_val = int(element.attrib.get("index", "0"))
                if current_class == target_class and current_index_val == target_index:
                    return traverse(element, path_parts, current_index + 1)
            
            for child in element:
                child_class = child.attrib.get("class", child.tag)
                child_index = int(child.attrib.get("index", "0"))
                if child_class == target_class and child_index == target_index:
                    return traverse(child, path_parts, current_index + 1)
            return None
        
        path_parts = target_path.split("/")
        return traverse(root, path_parts)
    
    def _find_element_by_bounds(self, root, target_bounds):
        """Find element by bounds"""
        target_bounds_tuple = parse_bounds(target_bounds)
        if not target_bounds_tuple:
            return None
        
        def traverse(element):
            bounds_str = element.attrib.get("bounds")
            if bounds_str:
                bounds = parse_bounds(bounds_str)
                if bounds == target_bounds_tuple:
                    return element
            
            for child in element:
                result = traverse(child)
                if result is not None:
                    return result
            return None
        
        return traverse(root)
    
    def _draw_interactive_children_boxes(self, image, element, gesture):

        from PIL import ImageDraw, Image
        
        draw = ImageDraw.Draw(image)

        """Draw boxes around interactive children"""
        def is_swipeable(node):
            return (node.attrib.get("scrollable") == "true" and "bounds" in node.attrib)
        
        def is_vertically_scrollable(node):
            if "bounds" not in node.attrib:
                return False
            is_scrollable = node.attrib.get("scrollable") == "true"
            is_vertical = True
            class_name = node.attrib.get("class", "").lower()
            horizontal_classes = ["horizontalscrollview", "viewpager", "gallery", "carousel"]
            if any(h_class in class_name for h_class in horizontal_classes):
                is_vertical = False
            resource_id = node.attrib.get("resource-id", "").lower()
            if any(keyword in resource_id for keyword in ["horizontal", "gallery", "carousel", "viewpager"]):
                is_vertical = False
            if node.attrib.get("horizontal", "false") == "true":
                is_vertical = False
            return is_scrollable and is_vertical
            
        def is_recycler_view(node):
            class_name = node.attrib.get("class", "").lower()
            resource_id = node.attrib.get("resource-id", "").lower()
            return (("recyclerview" in class_name or "recycler" in class_name or 
                    "recyclerview" in resource_id or "recycler" in resource_id) and 
                   "bounds" in node.attrib)

        def is_zoomable(node):
            if "bounds" not in node.attrib:
                return False
            class_name = node.attrib.get("class", "").lower()
            resource_id = node.attrib.get("resource-id", "").lower()
            content_desc = node.attrib.get("content-desc", "").lower()
            
            is_image_view = ("imageview" in class_name or "image" in resource_id or 
                           "photo" in resource_id or "picture" in resource_id)
            is_map_view = ("mapview" in class_name or "map" in class_name or
                          "map" in resource_id or "map" in content_desc)
            is_web_view = ("webview" in class_name or "web" in resource_id)
            has_zoom_controls = ("zoom" in resource_id or "zoom" in content_desc)
            
            return (is_map_view or is_web_view or has_zoom_controls or 
                   (is_image_view and self._is_large_element(node)))
        
        def is_element_interactive_for_gesture(elem, gesture_type):
            if "bounds" not in elem.attrib:
                return False
            if gesture_type in ["tap", "double_tap"]:
                return elem.attrib.get("clickable") == "true"
            elif gesture_type == "long_press":
                # For long press, show both clickable and long-clickable elements
                return (elem.attrib.get("clickable") == "true" or 
                       elem.attrib.get("long-clickable") == "true")
            elif gesture_type in ["swipe_left", "swipe_right"]:
                return is_swipeable(elem) or is_recycler_view(elem)
            elif gesture_type in ["scroll_up", "scroll_down"]:
                return is_vertically_scrollable(elem) or is_recycler_view(elem)
            elif gesture_type in ["pinch_zoom_in", "pinch_zoom_out"]:
                return is_zoomable(elem)
            else:
                return False
        
        def find_interactive_children(parent_elem, gesture_type):
            interactive_children = []
            for child in parent_elem:
                if is_element_interactive_for_gesture(child, gesture_type):
                    interactive_children.append(child)
                interactive_children.extend(find_interactive_children(child, gesture_type))
            return interactive_children
        
        # Find all interactive children
        interactive_children = find_interactive_children(element, gesture)
        
        def fill_hatched(image, bounds, color=(0, 128, 255, 180), spacing=12, line_width=3, cross=False, bg_alpha=0, outline=None, outline_width=2):
            """Apply hatching pattern to a rectangular area"""
            x1, y1, x2, y2 = bounds
            w, h = x2 - x1, y2 - y1

            # Create overlay canvas
            overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
            od = ImageDraw.Draw(overlay)

            # Optional background fill
            if bg_alpha > 0:
                r, g, b, _ = color if len(color) == 4 else (*color, 255)
                od.rectangle((0, 0, w, h), fill=(r, g, b, bg_alpha))

            # Diagonal hatching pattern
            for off in range(-h, w, spacing):
                od.line([(off, h), (off + h, 0)], fill=color, width=line_width)

            # Cross hatching (optional)
            if cross:
                for off in range(0, w + h, spacing):
                    od.line([(off, 0), (off - h, h)], fill=color, width=line_width)

            # Outline for better visibility
            if outline is not None and outline_width > 0:
                od.rectangle((0, 0, w - 1, h - 1), outline=outline, width=outline_width)

            # Composite onto original image
            image.paste(overlay, (x1, y1), overlay)

        # Draw boxes for interactive children
        for child in interactive_children:
            bounds_str = child.attrib.get("bounds")
            if bounds_str:
                bounds = parse_bounds(bounds_str)
                if bounds:
                    fill_hatched(
                        image,
                        bounds,
                        color=(0, 128, 255, 180),
                        spacing=10,
                        line_width=4,
                        cross=False,
                        bg_alpha=0,
                        outline=(0, 128, 255, 220),
                        outline_width=2,
                    )
    
    def _is_large_element(self, node):
        """Check if element is large enough for zoom interaction"""
        try:
            import re
            bounds = node.attrib.get("bounds")
            match = re.findall(r'\[(\d+),(\d+)\]', bounds)
            if len(match) == 2:
                x1, y1 = map(int, match[0])
                x2, y2 = map(int, match[1])
                width = x2 - x1
                height = y2 - y1
                return width > 500 and height > 500
        except:
            pass
        return False
    
    def _redraw_action_annotation_on_children(self, img, action_name):
        """Redraw action annotation on top of hatching for children annotation"""
        try:
            # Load action data from saved action.json
            action_json_path = self.get_save_path("action", "json")
            if not os.path.exists(action_json_path):
                return
            
            with open(action_json_path, "r", encoding="utf-8") as f:
                action_data = json.load(f)
            
            draw = ImageDraw.Draw(img)
            
            circle_color = (239, 128, 34, 254)
            box_color = (239, 128, 34, 254)  # Orange color
            line_color = (239, 128, 34, 254)
            arrow_color = (239, 128, 34, 254)
            
            circle_radius = 25
            line_width = 10
            
            bounds = action_data.get("bounds")
            if bounds:
                bounds_tuple = parse_bounds(bounds)
                if bounds_tuple:
                    x1, y1, x2, y2 = bounds_tuple
                    draw.rectangle([(x1, y1), (x2, y2)], outline=box_color, width=line_width)
            
            if action_name in ["swipe_left", "swipe_right", "scroll_up", "scroll_down"]:
                start_point = action_data.get("start_point")
                end_point = action_data.get("end_point")
                
                if start_point and end_point:
                    x, y = start_point
                    end_x, end_y = end_point
                    
                    # Draw start circle
                    draw.ellipse(
                        [(x - circle_radius, y - circle_radius), 
                        (x + circle_radius, y + circle_radius)], 
                        fill=circle_color
                    )
                    
                    # Draw line
                    draw.line([(x, y), (end_x, end_y)], fill=line_color, width=5)
                    
                    # Draw arrow
                    arrow_size = 20
                    import math
                    angle = math.atan2(end_y - y, end_x - x)
                    
                    arrow_x1 = end_x - arrow_size * math.cos(angle - math.pi/6)
                    arrow_y1 = end_y - arrow_size * math.sin(angle - math.pi/6)
                    arrow_x2 = end_x - arrow_size * math.cos(angle + math.pi/6)
                    arrow_y2 = end_y - arrow_size * math.sin(angle + math.pi/6)
                    
                    draw.polygon([(end_x, end_y), (arrow_x1, arrow_y1), (arrow_x2, arrow_y2)], 
                                fill=arrow_color)
            
            elif action_name in ["tap", "double_tap", "long_press"]:
                tap_point = action_data.get("tap_point")
                if tap_point:
                    x, y = tap_point
                    
                    # Draw outer circle (outline)
                    draw.ellipse(
                        [(x - circle_radius, y - circle_radius), (x + circle_radius, y + circle_radius)], 
                        outline=circle_color, width=line_width
                    )
                    
                    # Draw inner circle (filled)
                    draw.ellipse(
                        [(x - 10, y - 10), (x + 10, y + 10)], 
                        fill=circle_color
                    )
                    
        except Exception as e:
            print(f"❌ Failed to redraw action annotation: {e}")
        
    def save_view_hierarchy(self, driver, stage) -> str:
        path = self.get_save_path(stage, "xml")
        xml_data = driver.page_source

        with open(path, "w", encoding="utf-8") as f:
            f.write(xml_data)

        return path
    
    def save_html_hierarchy(self, stage) -> str:
        xml_path = self.get_save_path(stage, "xml")
        html_path = self.get_save_path(stage, "html")
        
        if os.path.exists(xml_path):
            try:
                xml_to_html(xml_path, html_path)
                return html_path
            except Exception as e:
                print(f"❌ Failed to convert XML to HTML for {stage}: {e}")
                return None
        else:
            print(f"⚠️ XML file not found for HTML conversion: {xml_path}")
            return None

    def save_simplified_view_hierarchy(self, driver, stage) -> str:
        path = self.get_save_path(stage, "vh")
        xml_data = driver.page_source
        root = ElementTree.fromstring(xml_data)
        
        elements_dict = {}
        
        temp_id = 0
        
        def process_node(node, parent_id=-1):
            nonlocal temp_id
            current_id = temp_id
            temp_id += 1
            
            bounds_str = node.attrib.get("bounds", "")
            bounds = parse_bounds(bounds_str) if bounds_str else (0, 0, 0, 0)
            
            if bounds is None:
                bounds = (0, 0, 0, 0)
            
            width = bounds[2] - bounds[0]
            height = bounds[3] - bounds[1]
            size = f"{width}*{height}"
                        
            formatted_bounds = f"[{bounds[0]},{bounds[1]}][{bounds[2]},{bounds[3]}]"

            element_info = {
                "id": current_id,
                "parent": parent_id,
                "children": [],
                "child_count": 0,
                "class": node.attrib.get("class", ""),
                "resource_id": node.attrib.get("resource-id", "").strip() or None,
                "text": node.attrib.get("text", "").strip() or None,
                "content_description": node.attrib.get("content-desc", "").strip() or None,
                "package": node.attrib.get("package", "").strip() or None,
                "bounds": formatted_bounds,
                "size": size,
                
                "clickable": node.attrib.get("clickable") == "true",
                "long_clickable": node.attrib.get("long-clickable") == "true",
                "scrollable": node.attrib.get("scrollable") == "true",
                "checkable": node.attrib.get("checkable") == "true",
                "checked": node.attrib.get("checked") == "true",
                "focusable": node.attrib.get("focusable") == "true",
                "focused": node.attrib.get("focused") == "true",
                "selected": node.attrib.get("selected") == "true",
                "enabled": node.attrib.get("enabled") != "false", 
                "editable": node.attrib.get("editable") == "true",
                "is_password": node.attrib.get("password") == "true",
                "displayed": node.attrib.get("displayed") != "false" 
            }
            
            children_ids = []
            for child in list(node):
                child_id = process_node(child, current_id)
                children_ids.append(child_id)
            
            element_info["children"] = children_ids
            element_info["child_count"] = len(children_ids)
            elements_dict[current_id] = element_info
            
            return current_id
        
        root_children = list(root)
        root_elements_ids = []
        
        for i, child in enumerate(root_children):
            child_id = process_node(child, -1)
            root_elements_ids.append(child_id)
        
        elements_list = [elements_dict[i] for i in range(len(elements_dict))]
        
        with open(path, "w", encoding="utf-8") as f:
            json.dump(elements_list, f, indent=2, ensure_ascii=False)
        
        return path
    
    def save_action_data(self, driver, action, start_point, bounds, end_point=None) -> str:
        path = self.get_save_path("action", "json")
        metadata = {
            "gesture": action,
            "bounds": bounds,
        }

        if (action.startswith("swipe_") or action.startswith("scroll_")) and end_point:
            metadata["start_point"] = start_point
            metadata["end_point"] = end_point

        elif action.startswith("pinch_"):
            if action == "pinch_zoom_in":
                zoom_in = True
            else:
                zoom_in = False
            
            x, y = start_point

            finger1_start_x, finger1_start_y, finger1_end_x, finger1_end_y, finger2_start_x, finger2_start_y, finger2_end_x, finger2_end_y = calculate_pinch_zoom_coordinates(driver, x, y, zoom_in)

            metadata["finger1_start_point"] = [finger1_start_x, finger1_start_y]
            metadata["finger1_end_point"] = [finger1_end_x, finger1_end_y]

            metadata["finger2_start_point"] = [finger2_start_x, finger2_start_y]
            metadata["finger2_end_point"] = [finger2_end_x, finger2_end_y]
        else:
            metadata["tap_point"] = start_point
        
        with open(path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=4)

        return path

    def save_element_path(self, element_path) -> str:
        path = self.get_save_path("path", "txt")
        with open(path, "w", encoding="utf-8") as f:
            f.write(element_path)

        return path
    
    def delete_data(self) -> None:
        if self.current_index_dir and os.path.exists(self.current_index_dir):
            shutil.rmtree(self.current_index_dir)
            self.current_index_dir = None
        else:
            print("❌ No folder to delete.")
        