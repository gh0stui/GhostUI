import json
import time
import os
from appium import webdriver
from appium.options.android import UiAutomator2Options
from utils.element_finder import ElementFinder
from utils.gesture_handler import GestureHandler
from utils.data_saver import DataSaver
from utils.bounding_box import get_safe_random_point, get_center_point, collect_child_bounds
from utils.view_comparator import is_same_screen, is_same_screen_img

class UIActionAutomator:
    def __init__(self, driver):
        self.driver = driver
        self.gesture_handler = GestureHandler(driver)
        self.element_finder = ElementFinder(driver)
        self.data_saver = DataSaver()
        self.app_package = self.driver.capabilities.get("appPackage", "unknown_app")
        self.gesture_handler.set_data_saver(self.data_saver, self.app_package)

        self.action_list = ["tap", "double_tap", "long_press", "swipe_left", "swipe_right", "scroll_up", "scroll_down", "pinch_zoom_in", "pinch_zoom_out"]

        self.element_to_path = {}
        self.path_to_element = {}

        self.visited_paths_by_screen = {}

        self.progress_dir = os.path.join("test_progress", self.app_package)
        os.makedirs(self.progress_dir, exist_ok=True)
        self.restore_test_progress()

    def save_test_progress(self, screen_name):
        progress_file = os.path.join(self.progress_dir, f"{screen_name}_progress.json")
        
        if screen_name not in self.visited_paths_by_screen:
            self.visited_paths_by_screen[screen_name] = set()
        
        progress_data = {
            "visited_paths": list(self.visited_paths_by_screen[screen_name]),
            "screen_name": screen_name,
            "timestamp": time.time()
        }
        
        with open(progress_file, 'w', encoding='utf-8') as f:
            json.dump(progress_data, f, ensure_ascii=False, indent=2)

        print(f"✅ Test progress successfully saved: {len(self.visited_paths_by_screen[screen_name])} paths")

    def restore_test_progress(self):
        progress_files = [f for f in os.listdir(self.progress_dir) if f.endswith("_progress.json")]
        
        if not progress_files:
            print("🔄 No previous test progress found. Starting a new test.")
            return
            
        for file_name in progress_files:
            file_path = os.path.join(self.progress_dir, file_name)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    progress_data = json.load(f)
                
                screen_name = progress_data.get("screen_name", "Unknown")
                visited_paths = set(progress_data.get("visited_paths", []))

                self.visited_paths_by_screen[screen_name] = visited_paths
                
                timestamp = progress_data.get("timestamp", "Unknown")
                if isinstance(timestamp, (int, float)):
                    timestamp_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(timestamp))
                else:
                    timestamp_str = str(timestamp)
                
                screen_name = progress_data.get("screen_name", "Unknown")
                print(f"✅ Successfully restored progress for screen '{screen_name}': {len(visited_paths)} paths (Saved at: {timestamp_str})")
                
            except Exception as e:
                print(f"⚠️ Error occurred while restoring progress ({file_name}): {e}")
    
    def take_screenshot(self, current_screen, action_name, stage="before", path=None, start_point=None, bounds=None, end_point=None) -> str:
        screenshot_path = self.data_saver.save_screenshot(self.driver, self.app_package, current_screen, action_name, stage)
        self.data_saver.save_view_hierarchy(self.driver, stage)
        self.data_saver.save_html_hierarchy(stage)
        self.data_saver.save_simplified_view_hierarchy(self.driver, stage)
        
        if stage == "before":
            self.data_saver.save_action_data(self.driver, action_name, start_point, bounds, end_point)
            self.data_saver.save_element_path(path)
            self.data_saver.save_annotated_screenshot(self.driver, action_name, screenshot_path, start_point, bounds, end_point)
            self.data_saver.save_annotated_with_children_screenshot(self.driver, action_name, screenshot_path, path)

        return screenshot_path

    def clear_data(self) -> None:
        self.data_saver.delete_data()

    def ensure_app_running(self) -> bool:
        try:
            current_package = self.driver.current_package
            if current_package != self.app_package:
                if self.app_package == "com.google.android.youtube":
                    import subprocess
                    subprocess.run([
                        "adb", "shell", "am", "start", "-n", 
                        "com.google.android.youtube/com.google.android.youtube.app.honeycomb.Shell\$HomeActivity"
                    ])
                    import time
                    time.sleep(2)
                else:
                    self.driver.activate_app(self.app_package)
            
            self.wait_for_page_to_load()
            return True
        
        except Exception as e:
            print(f"❌ Error occurred while launching the app: {e}")
            return False
    
    def wait_for_page_to_load(self, timeout=20) -> bool:
        start_time = time.time()
        previous_page_source = ""
        stability_counter = 0
        
        while time.time() - start_time < timeout:
            current_page_source = self.driver.page_source
            
            if current_page_source == previous_page_source:
                stability_counter += 1
                if stability_counter >= 5:
                    print(f"✅ Screen loaded successfully (Time taken: {time.time() - start_time:.2f} seconds)")
                    return True
            else:
                stability_counter = 0
                
            previous_page_source = current_page_source
            time.sleep(0.5)
        
        print(f"❌ Screen loading timeout ({timeout} seconds)")
        return False
    
    def go_back_to_initial_screen(self, screen_name=None) -> bool:
        try:
            for _ in range(2):
                try:
                    self.driver.execute_script(
                        'mobile: shell', {
                            'command': 'input keyevent KEYCODE_BACK'
                        }
                    )
                    time.sleep(1)
                except Exception as e:
                    print(f"⚠️ Error occurred while performing back action: {e}")
                    break

            for _ in range(1):
                try:
                    self.driver.execute_script(
                        'mobile: shell', {
                            'command': 'input keyevent KEYCODE_HOME'
                        }
                    )
                    time.sleep(1)
                except Exception as e:
                    print(f"⚠️ Error occurred while pressing the Home button: {e}")
                    break
            
            print(f"Terminating app: {self.app_package}")

            current_package = self.driver.current_package

            if current_package != self.app_package:
                self.driver.terminate_app(current_package)
                time.sleep(2)
            
            self.driver.terminate_app(self.app_package)
            time.sleep(2)

            if current_package == self.app_package or "camera" in current_package.lower():
                print(f"⚠️ Failed to terminate {self.app_package} app. Attempting force stop...")
                
                try:
                    self.driver.execute_script(
                    'mobile: shell', {
                        'command': f'am force-stop {self.app_package}'
                        }
                    )
                    print("✅ Force stop command executed successfully")

                    if "camera" in current_package.lower():
                        self.driver.execute_script(
                            'mobile: shell', {
                                'command': f'am force-stop {current_package}'
                            }
                        )
                        
                except Exception as e:
                    print(f"⚠️ Error occurred during force stop: {e}")

                    try:
                        for _ in range(3):
                            self.driver.execute_script(
                            'mobile: shell', {
                                'command': 'input keyevent KEYCODE_BACK'
                            }
                        )
                        time.sleep(0.5)

                        self.driver.execute_script(
                            'mobile: shell', {
                                'command': 'input keyevent KEYCODE_HOME'
                            }
                        )
                        time.sleep(1)

                    except Exception as back_error:
                        print(f"⚠️ Backup termination method also failed: {back_error}")

            if not self.ensure_app_running():
                return False
            
            if screen_name:
                with open("./config/config.json", "r") as file:
                    config = json.load(file)
                
                current_app = None
                for app in config["apps"]:
                    if app["package"] == self.app_package:
                        current_app = app
                        break
                
                if current_app and screen_name in current_app["screens"]:
                    navigate_actions = current_app["screens"][screen_name]["navigate"]
                    self.navigate_to_screen(navigate_actions)
            
            return True
            
        except Exception as e:
            print(f"⚠️ Error occurred while navigating screen: {e}")
            return False

    def build_path_mapping(self):
        self.element_finder.refresh()
        root = self.element_finder.root
        
        self.element_to_path = {}
        self.path_to_element = {}
        
        def traverse(element, path_parts=None):
            if path_parts is None:
                path_parts = [""]
            
            class_name = element.attrib.get("class", element.tag)
            index = element.attrib.get("index", "0")
            
            element_with_index = f"{class_name}[{index}]"
            current_path_parts = path_parts + [element_with_index]
            full_path = "/".join(current_path_parts)
            
            self.element_to_path[element] = full_path
            self.path_to_element[full_path] = element
            
            for child in element:
                traverse(child, current_path_parts)
        
        traverse(root)

    def get_element_path(self, element):
        if not self.element_to_path:
            self.build_path_mapping()
        
        if element in self.element_to_path:
            path = self.element_to_path[element]
            return path
        
        try:
            class_name = element.attrib.get("class", element.tag)
            index = element.attrib.get("index", "0")
            path = f"hierarchy/{class_name}[{index}]"
            return path
        
        except Exception as e:
            print(f"⚠️ Error occurred while generating path: {e}")
            return f"element/{element.tag}[{index}]"
    
    def get_next_unvisited_element(self, current_screen):
        self.build_path_mapping()
        
        if current_screen not in self.visited_paths_by_screen:
            self.visited_paths_by_screen[current_screen] = set()
        
        visited_paths = self.visited_paths_by_screen[current_screen]

        for action in self.action_list:
            if action in ["tap", "double_tap"]:
                elements = self.element_finder.find_tappable_elements_from_leaves()
            elif action == "long_press":
                elements = self.element_finder.find_long_pressable_elements_from_leaves()
            elif action in ["swipe_left", "swipe_right"]:
                elements = self.element_finder.find_swipeable_elements_from_leaves()
            elif action in ["scroll_up", "scroll_down"]:
                elements = self.element_finder.find_scrollable_elements_from_leaves()
            elif action in ["pinch_zoom_in", "pinch_zoom_out"]:
                elements = self.element_finder.find_zoomable_elements_from_leaves()
            else:
                elements = []
            
            print(f"🔍 Elements targeted by {action} action: {len(elements)}")

            unvisited_elements = []
            for element in elements:
                path = self.get_element_path(element)
                action_path = f"{action}/{path}"
                if action_path not in visited_paths:
                    unvisited_elements.append((element, path))
            
            print(f"🔍 Unvisited elements: {len(unvisited_elements)}")

            if unvisited_elements:
                selected_element, selected_path = unvisited_elements[0]
                return action, selected_element, selected_path
            
        return None, None, None

    def test_single_element(self, current_screen, action, element, path) -> bool:
        bounds = element.attrib.get("bounds")

        if action.startswith("swipe_") or action.startswith("scroll_") or action.startswith("pinch_"):
            start_point = get_center_point(bounds)
        else:
            if child_bounds_list := collect_child_bounds(action, element):
                start_point = get_safe_random_point(element, child_bounds_list=child_bounds_list)
            else:
                start_point = get_safe_random_point(element)
        
        if not start_point:
            print("⚠️ Unable to find coordinates to tap.")
            return False
        
        x, y = start_point

        end_point = None
        if action.startswith("swipe_") or action.startswith("scroll_"):
            if action == "swipe_left":
                end_point = (x - 400, y)
            elif action == "swipe_right":
                end_point = (x + 400, y)
            elif action == "scroll_up":
                end_point = (x, y - 800)
            elif action == "scroll_down":
                end_point = (x, y + 1000)

        before_screenshot_path = self.take_screenshot(current_screen, action, "before", path=path, start_point=start_point, bounds=bounds, end_point=end_point)
        before_view_hierarchy_path = self.data_saver.get_save_path("before", "xml")

        if action == "tap":
            self.gesture_handler.perform_tap(x, y)
        elif action == "double_tap":
            self.gesture_handler.perform_double_tap(x, y)
        elif action == "long_press":
            self.gesture_handler.perform_long_press_with_screenshot(current_screen, x, y)
        elif action == "pinch_zoom_in":
            self.gesture_handler.perform_pinch_zoom(current_screen, x, y, zoom_in=True)
        elif action == "pinch_zoom_out":
            self.gesture_handler.perform_pinch_zoom(current_screen, x, y, zoom_in=False)
        elif action.startswith("swipe_") or action.startswith("scroll_"):
            if end_point:
                self.gesture_handler.perform_swipe_or_scroll(x, y, end_point[0], end_point[1])            
        
        self.wait_for_page_to_load()

        after_screenshot_path = self.take_screenshot(current_screen, action, "after", bounds=bounds)
        after_view_hierarchy_path = self.data_saver.get_save_path("after", "xml")

        if action.startswith("pinch_"):
            during_screenshot_path = self.data_saver.get_save_path("during", "png")
            view_changed = not is_same_screen_img(before_screenshot_path, after_screenshot_path, during_screenshot_path)
        elif action == "long_press":
            during_view_hierarchy_path = self.data_saver.get_save_path("during", "xml")
            view_changed = not is_same_screen(before_view_hierarchy_path, after_view_hierarchy_path, during_view_hierarchy_path)
        else:
            view_changed = not is_same_screen(before_view_hierarchy_path, after_view_hierarchy_path)


        action_path = f"{action}/{path}"
        if current_screen not in self.visited_paths_by_screen:
            self.visited_paths_by_screen[current_screen] = set()

        self.visited_paths_by_screen[current_screen].add(action_path)

        self.save_test_progress(current_screen)

        if view_changed:
            print(f"✅ Change detected after performing {action}!")
            return True
        else:
            print(f"🗑️ No change detected after performing {action} -> Deleting folder")
            self.clear_data()
            return False
        
    def run_test_on_screen(self, current_screen) -> None:
        test_count = 0
        
        if current_screen in self.visited_paths_by_screen:
            print(f"🔍 There are already {len(self.visited_paths_by_screen[current_screen])} tested paths on this screen.")
        else:
            print("🔍 No previous test records for this screen.")
        while True:
            try:
                next_action, element, path = self.get_next_unvisited_element(current_screen)
                if element is None:
                    break
                self.test_single_element(current_screen, next_action, element, path)
                test_count += 1
                self.go_back_to_initial_screen(screen_name=current_screen)
                
            except Exception as e:
                print(f"❌ Error occurred during test execution: {e}")
                self.save_test_progress(current_screen)
                self.go_back_to_initial_screen(screen_name=current_screen)
                
        self.save_test_progress(current_screen)

    def navigate_to_screen(self, actions) -> bool:
        print(f"Navigating to test screen...")

        if actions:
            for action in actions:
                bounds = action.get('bounds')
                start_point = get_center_point(bounds)
                x, y = start_point
                self.gesture_handler.perform_tap(x, y)
                self.wait_for_page_to_load()

        print("Successfully navigated to test screen")
        return True

def test_app_screens(app) -> None:
    desired_caps = {
            "platformName": "Android",
            "automationName": "UiAutomator2",
            "deviceName": "emulator-5556",
            # "deviceName": "RF9XC01AH0B",
            "appPackage": app["package"],
            "language":'en',
            "autoGrantPermissions": True,
            "noReset": True,
            'uiautomator2ServerLaunchTimeout': 60000,
            'uiautomator2ServerInstallTimeout': 60000 ,
            "appWaitActivity": "*"
        }
    
    driver = None
    try:
        driver = webdriver.Remote("http://localhost:4723", options=UiAutomator2Options().load_capabilities(desired_caps))
        tester = UIActionAutomator(driver)
        
        print(f"🚀 Start Testing for app: {app['package']}")

        if not tester.ensure_app_running():
            return

        app_info = tester.data_saver.get_app_info(driver)

        try:
            play_store_info = tester.data_saver.get_app_description_from_play_store(app["package"])
            app_info.update(play_store_info)
        except:
            pass

        tester.data_saver.save_app_metadata(app['package'], app_info)

        screen_items = list(app["screens"].items())
        for i, (screen_name, screen_data) in enumerate(screen_items):
            print(f"\n===== Starting test for screen: {screen_name} =====")

            tester.navigate_to_screen(screen_data["navigate"])
            tester.run_test_on_screen(current_screen=screen_name)
            
            print(f"===== Test complete for screen: {screen_name} =====\n")
            
            if i < len(screen_items) - 1:
                tester.go_back_to_initial_screen()

        driver.terminate_app(app["package"])
        time.sleep(2)        

    except Exception as e:
        print(f"❌ Error occurred during test execution: {e}")


    finally:
        if driver:
            driver.quit()


if __name__ == "__main__":
    with open("./config/config.json", "r") as file:
        config = json.load(file)
    
    for app in config["apps"]:
        test_app_screens(app)