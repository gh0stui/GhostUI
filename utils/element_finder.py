from xml.etree import ElementTree
class ElementFinder:
    def __init__(self, driver):
        self.driver = driver
        self.xml_source = None
        self.root = None

    def get_view_hierarchy(self, force_refresh=False) -> str:
        if force_refresh or self.xml_source is None:
            self.xml_source = self.driver.page_source
            self.root = ElementTree.fromstring(self.xml_source)

        return self.xml_source

    def refresh(self):
        return self.get_view_hierarchy(force_refresh=True)
    
    def ensure_hierarchy_loaded(self) -> None:
        if self.root is None:
            self.get_view_hierarchy()
    
    def process_node_dfs(self, node, condition_func, elements_to_test, processed_nodes) -> None:
        children = list(node)
        for child in children:
            self.process_node_dfs(child, condition_func, elements_to_test, processed_nodes)
        
        if condition_func(node) and node not in processed_nodes:
            elements_to_test.append(node)
            processed_nodes.append(node)
    
    def find_tappable_elements_from_leaves(self) -> list[ElementTree.Element]:
        self.ensure_hierarchy_loaded()
        
        elements_to_test = []
        processed_nodes = []
        
        def is_tappable(node):
            return (node.attrib.get("clickable") == "true" and 
                    "bounds" in node.attrib)
        
        self.process_node_dfs(self.root, is_tappable, elements_to_test, processed_nodes)
        
        return elements_to_test
    
    def find_long_pressable_elements_from_leaves(self) -> list[ElementTree.Element]:
        self.ensure_hierarchy_loaded()
        
        elements_to_test = []
        processed_nodes = []
        
        def is_long_pressable(node):
            return (node.attrib.get("long-clickable") == "true" and
                    "bounds" in node.attrib)
        
        self.process_node_dfs(self.root, is_long_pressable, elements_to_test, processed_nodes)
        
        return elements_to_test
    
    def find_swipeable_elements_from_leaves(self) -> list[ElementTree.Element]:
        self.ensure_hierarchy_loaded()
        
        elements_to_test = []
        processed_nodes = []
        
        def is_swipeable(node):
            return (node.attrib.get("scrollable") == "true" and
                    "bounds" in node.attrib)
        
        def is_recycler_view(node):
            class_name = node.attrib.get("class", "").lower()
            resource_id = node.attrib.get("resource-id", "").lower()
            
            return (("recyclerview" in class_name or 
                    "recycler" in class_name or 
                    "recyclerview" in resource_id or
                    "recycler" in resource_id) and 
                    "bounds" in node.attrib)
        
        def process_node_with_special_layouts(node):
            if is_swipeable(node):
                if node not in processed_nodes:
                    elements_to_test.append(node)
                    processed_nodes.append(node)
            
            is_recycler = is_recycler_view(node)

            if is_recycler:
                if node not in processed_nodes:
                    elements_to_test.append(node)
                    processed_nodes.append(node)
                
                for child in node:
                    if "bounds" in child.attrib and child not in processed_nodes:
                        elements_to_test.append(child)
                        processed_nodes.append(child)
                    
                    process_node_with_special_layouts(child)
            else:
                for child in node:
                    process_node_with_special_layouts(child)
        
        process_node_with_special_layouts(self.root)
        
        return elements_to_test

    def find_scrollable_elements_from_leaves(self) -> list[ElementTree.Element]:
        self.ensure_hierarchy_loaded()
        
        elements_to_test = []
        processed_nodes = []
        
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
                
            if is_vertical and "bounds" in node.attrib:
                try:
                    import re

                    bounds = node.attrib.get("bounds")
                    match = re.findall(r'\[(\d+),(\d+)\]', bounds)
                    if len(match) == 2: 
                        x1, y1 = map(int, match[0])
                        x2, y2 = map(int, match[1])
                        width = x2 - x1
                        height = y2 - y1
                        if width > height * 1.5:
                            is_vertical = False
                except:
                    pass
                    
            return is_scrollable and is_vertical
        
        self.process_node_dfs(self.root, is_vertically_scrollable, elements_to_test, processed_nodes)
        
        return elements_to_test
    
    def find_zoomable_elements_from_leaves(self) -> list[ElementTree.Element]:
        self.ensure_hierarchy_loaded()
        
        elements_to_test = []
        processed_nodes = []
        
        def is_zoomable(node):
            if "bounds" not in node.attrib:
                return False
            
            class_name = node.attrib.get("class", "").lower()
            resource_id = node.attrib.get("resource-id", "").lower()
            content_desc = node.attrib.get("content-desc", "").lower()
            
            is_image_view = ("imageview" in class_name or 
                            "image" in resource_id or 
                            "photo" in resource_id or 
                            "picture" in resource_id)
            
            is_map_view = ("mapview" in class_name or 
                        "map" in class_name or
                        "map" in resource_id or
                        "map" in content_desc)
            
            is_web_view = ("webview" in class_name or
                        "web" in resource_id)
            
            has_zoom_controls = ("zoom" in resource_id or
                                "zoom" in content_desc)
            
            is_document_viewer = ("pdf" in class_name or 
                                "pdf" in resource_id or
                                "document" in class_name or
                                "document" in resource_id or
                                "viewer" in class_name or
                                "viewer" in resource_id)
            
            is_gallery_viewer = ("gallery" in class_name or
                                "gallery" in resource_id or
                                "photo" in class_name or
                                "viewer" in class_name)
            
            is_large_element = False
            try:
                import re
                bounds = node.attrib.get("bounds")
                match = re.findall(r'\[(\d+),(\d+)\]', bounds)
                if len(match) == 2:
                    x1, y1 = map(int, match[0])
                    x2, y2 = map(int, match[1])
                    width = x2 - x1
                    height = y2 - y1
                    if width > 500 and height > 500:
                        is_large_element = True
            except:
                pass
            
            return (is_map_view or is_web_view or 
                    has_zoom_controls or is_document_viewer or 
                    is_gallery_viewer or 
                    (is_large_element and (is_image_view or is_gallery_viewer)))
        
        self.process_node_dfs(self.root, is_zoomable, elements_to_test, processed_nodes)
        
        return elements_to_test