from PIL import Image
import numpy as np
import cv2
import numpy as np
from PIL import Image

def is_same_screen(before_view_hierarchy_path, after_view_hierarchy_path, during_view_hierarchy_path=None):
    try:
        with open(before_view_hierarchy_path, "r", encoding="utf-8") as f:
                before_view_hierarchy = f.read()
                
        with open(after_view_hierarchy_path, "r", encoding="utf-8") as f:
                after_view_hierarchy = f.read()
        
        if during_view_hierarchy_path is not None:
                with open(during_view_hierarchy_path, "r", encoding="utf-8") as f:
                        during_view_hierarchy = f.read()
                        
                return before_view_hierarchy == after_view_hierarchy and before_view_hierarchy == during_view_hierarchy
        
        return before_view_hierarchy == after_view_hierarchy
    
    except Exception as e:
                print(f"⚠️ Error occurred while comparing view hierarchies: {e}")
                return True

def is_same_screen_img(before_img_path, after_img_path, during_img_path, threshold=5):
    try:
        before_screenshot = cv2.imread(before_img_path)
        during_screenshot = cv2.imread(during_img_path)
        after_screenshot = cv2.imread(after_img_path)
        
        if before_screenshot is None or during_screenshot is None or after_screenshot is None:
            return True 
        
        before_array = np.array(Image.fromarray(cv2.cvtColor(before_screenshot, cv2.COLOR_BGR2RGB)))
        during_array = np.array(Image.fromarray(cv2.cvtColor(during_screenshot, cv2.COLOR_BGR2RGB)))
        after_array = np.array(Image.fromarray(cv2.cvtColor(after_screenshot, cv2.COLOR_BGR2RGB)))
        
        if before_array.shape != after_array.shape or before_array.shape != during_array.shape:
            return False
        
        before_during_diff = np.sum(np.abs(before_array - during_array))
        before_during_norm = before_during_diff / (before_array.shape[0] * before_array.shape[1] * before_array.shape[2])
        
        before_after_diff = np.sum(np.abs(before_array - after_array))
        before_after_norm = before_after_diff / (before_array.shape[0] * before_array.shape[1] * before_array.shape[2])
        
        return not (before_during_norm > threshold or before_after_norm > threshold)
            
    except Exception as e:
        print(f"⚠️ Error occurred while comparing images: {e}")
        return True