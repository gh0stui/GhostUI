import re
import random

def parse_bounds(bounds_str: str) -> tuple[int, int, int, int]:
    match = re.findall(r"\d+", bounds_str)
    if len(match) != 4:
        return None
    return tuple(map(int, match))

def get_safe_random_point(node, child_bounds_list=None) -> tuple[int, int]:
    bounds_str = node.attrib.get("bounds")
    parent_bounds = parse_bounds(bounds_str)
    x1_p, y1_p, x2_p, y2_p = parent_bounds

    if child_bounds_list is None:
        child_bounds_list = []

    for _ in range(10):
        random_x = random.randint(x1_p, x2_p)
        random_y = random.randint(y1_p, y2_p)
        
        point_is_safe = True
        for child_bounds in child_bounds_list:
            x1_c, y1_c, x2_c, y2_c = child_bounds
            
            if x1_c <= random_x <= x2_c and y1_c <= random_y <= y2_c:
                point_is_safe = False
                break
        
        if point_is_safe:
            return random_x, random_y
    
    center_x = (x1_p + x2_p) // 2
    center_y = (y1_p + y2_p) // 2
    
    return center_x, center_y

def get_random_point(bounds_str) -> tuple[int, int]:
    bounds = parse_bounds(bounds_str)
    if not bounds:
        return None
    
    x1, y1, x2, y2 = bounds
    
    random_x = random.randint(x1, x2)
    random_y = random.randint(y1, y2)
    
    return random_x, random_y

def get_center_point(bounds_str) -> tuple[int, int]:
    bounds = parse_bounds(bounds_str)
    if not bounds:
        return None
    
    x1, y1, x2, y2 = bounds
    
    center_x = (x1 + x2) // 2
    center_y = (y1 + y2) // 2
    
    return center_x, center_y

def collect_child_bounds(action, node) -> list[tuple[int, int, int, int]]:
    child_bounds_list = []
    
    for child in node:
        if action in ["tap", "double_tap"]:
            is_interactive = child.attrib.get("clickable") == "true"
        elif action == "long_press":
            is_interactive = child.attrib.get("long-clickable") == "true" or child.attrib.get("clickable") == "true"
        else:
            is_interactive = False
            
        if is_interactive:
            bounds_str = child.attrib.get("bounds")
            bounds = parse_bounds(bounds_str)
            if bounds: 
                child_bounds_list.append(bounds)
        
        child_bounds_list.extend(collect_child_bounds(action, child))
    
    return child_bounds_list
