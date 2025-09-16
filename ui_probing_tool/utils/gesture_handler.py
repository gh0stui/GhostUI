import time
from selenium.webdriver.common.actions import interaction
from selenium.webdriver.common.actions.action_builder import ActionBuilder
from selenium.webdriver.common.actions.pointer_input import PointerInput
from selenium.webdriver import ActionChains

class GestureHandler:
    def __init__(self, driver):
        self.driver = driver
        self.data_saver = None  
        self.app_package = None 
        self.actions = ActionBuilder(driver, mouse=PointerInput(interaction.POINTER_TOUCH, "touch"))

    def set_data_saver(self, data_saver, app_package):
        self.data_saver = data_saver
        self.app_package = app_package

    def perform_tap(self, x, y):
        self.actions.pointer_action.move_to_location(x, y).pointer_down().pointer_up()
        self.actions.perform()

    def perform_long_press(self, x, y, duration=2):
        self.actions.pointer_action.move_to_location(x, y).pointer_down()
        self.actions.pointer_action.pause(duration)
        self.actions.pointer_action.pointer_up()

        self.actions.perform()

    def perform_long_press_with_screenshot(self, current_screen, x, y, duration=2) -> None:
        try:
            self.actions.pointer_action.move_to_location(x, y).pointer_down()
            self.actions.perform()
                        
            wait_time = 1
            time.sleep(wait_time)
            
            self.data_saver.save_screenshot(self.driver, self.app_package, current_screen, "long_press", "during")
            self.data_saver.save_view_hierarchy(self.driver, "during")
            self.data_saver.save_html_hierarchy("during")
            self.data_saver.save_simplified_view_hierarchy(self.driver, "during")
            
            remaining_time = duration - wait_time
            if remaining_time > 0:
                time.sleep(remaining_time)
            
            self.actions.pointer_action.move_to_location(x, y).pointer_up()
            self.actions.perform()
            
            return
            
        except Exception as e:
            print(f"⚠️ Error occurred during long press: {e}")
            try:
                self.actions.pointer_action.move_to_location(x, y).pointer_up()
                self.actions.perform()
            except Exception as release_error:
                print(f"⚠️ Error occurred while releasing pointer: {release_error}")
    
    def perform_double_tap(self, x, y, duration=0.1) -> None:
        self.actions.pointer_action.move_to_location(x, y).pointer_down().pointer_up()
        self.actions.pointer_action.pause(duration)
        self.actions.pointer_action.pointer_down().pointer_up()

        self.actions.perform()
    
    def perform_swipe_or_scroll(self, start_x, start_y, end_x, end_y, duration=1):
        self.actions.pointer_action.move_to_location(start_x, start_y).pointer_down()
        self.actions.pointer_action.pause(0.1)
        self.actions.pointer_action.move_to_location(end_x, end_y, duration).pointer_up()

        self.actions.perform()

    def perform_pinch_zoom(self, current_screen, x, y, zoom_in=True, duration=1):
        finger1_start_x, finger1_start_y, finger1_end_x, finger1_end_y, finger2_start_x, finger2_start_y, finger2_end_x, finger2_end_y = calculate_pinch_zoom_coordinates(
            self.driver, x, y, zoom_in
        )

        actions1 = ActionChains(self.driver)
        finger1 = actions1.w3c_actions.add_pointer_input('touch', 'finger1')
        finger2 = actions1.w3c_actions.add_pointer_input('touch', 'finger2')
        
        finger1.create_pointer_move(x=finger1_start_x, y=finger1_start_y)
        finger1.create_pointer_down(button=0)
        
        finger2.create_pointer_move(x=finger2_start_x, y=finger2_start_y)
        finger2.create_pointer_down(button=0)
        
        actions1.w3c_actions.perform()
        time.sleep(0.2) 
        
        actions2 = ActionChains(self.driver)
        finger1_move = actions2.w3c_actions.add_pointer_input('touch', 'finger1_move')
        finger2_move = actions2.w3c_actions.add_pointer_input('touch', 'finger2_move')
        
        finger1_move.create_pointer_move(x=finger1_start_x, y=finger1_start_y)
        finger1_move.create_pointer_down(button=0)
        finger1_move.create_pointer_move(x=finger1_end_x, y=finger1_end_y)
        
        finger2_move.create_pointer_move(x=finger2_start_x, y=finger2_start_y)
        finger2_move.create_pointer_down(button=0)
        finger2_move.create_pointer_move(x=finger2_end_x, y=finger2_end_y)
        
        actions2.w3c_actions.perform()
        
        time.sleep(0.5)
        
        self.data_saver.save_screenshot(self.driver, self.app_package, current_screen, 
                                       "pinch_zoom_in" if zoom_in else "pinch_zoom_out", "during")
        self.data_saver.save_view_hierarchy(self.driver, "during")
        self.data_saver.save_html_hierarchy("during")
        self.data_saver.save_simplified_view_hierarchy(self.driver, "during")
        
        actions3 = ActionChains(self.driver)
        finger1_release = actions3.w3c_actions.add_pointer_input('touch', 'finger1_release')
        finger2_release = actions3.w3c_actions.add_pointer_input('touch', 'finger2_release')
        
        finger1_release.create_pointer_move(x=finger1_end_x, y=finger1_end_y)
        finger1_release.create_pointer_up(button=0)
        
        finger2_release.create_pointer_move(x=finger2_end_x, y=finger2_end_y)
        finger2_release.create_pointer_up(button=0)
        
        actions3.w3c_actions.perform()

def calculate_pinch_zoom_coordinates(driver, x, y, zoom_in=True, min_distance=200, max_distance=800) -> tuple:

    screen_size = driver.get_window_size()
    screen_width = screen_size['width']
    screen_height = screen_size['height']
        
    min_distance = min(screen_width, screen_height) * 0.15
    max_distance = min(screen_width, screen_height) * 0.45
        
    if zoom_in:
        start_distance = min_distance
        end_distance = max_distance
    else:
        start_distance = max_distance
        end_distance = min_distance
    
    start_half_distance = start_distance / 2
    end_half_distance = end_distance / 2
    
    finger1_start_x = x - start_half_distance
    finger1_start_y = y
    finger1_end_x = x - end_half_distance
    finger1_end_y = y
    
    finger2_start_x = x + start_half_distance
    finger2_start_y = y
    finger2_end_x = x + end_half_distance
    finger2_end_y = y

    def ensure_within_screen(x_coord, y_coord):
        x_coord = max(0, min(x_coord, screen_width))
        y_coord = max(0, min(y_coord, screen_height))
        return x_coord, y_coord
        
    finger1_start_x, finger1_start_y = ensure_within_screen(finger1_start_x, finger1_start_y)
    finger1_end_x, finger1_end_y = ensure_within_screen(finger1_end_x, finger1_end_y)
    finger2_start_x, finger2_start_y = ensure_within_screen(finger2_start_x, finger2_start_y)
    finger2_end_x, finger2_end_y = ensure_within_screen(finger2_end_x, finger2_end_y)
    
    return finger1_start_x, finger1_start_y, finger1_end_x, finger1_end_y, finger2_start_x, finger2_start_y, finger2_end_x, finger2_end_y