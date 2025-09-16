# UI Probing Tool
### Overview
![Image](https://github.com/user-attachments/assets/3e338c97-d1b5-4fe2-ac18-706ca6081a8e)
### Prerequisites

- [Android Studio with Emulator](https://developer.android.com/studio?hl=ko)   
- [Appium](https://appium.io/docs/en/latest/)

### Setup
```
cd ui_probing_tool
pip install -r requirements.txt
```
### Configuration
Before running the tool, you need to:

1. Launch Android Emulator from [Android Studio](https://developer.android.com/studio?hl=ko)   
2. Install the target app from Google Play Store on the emulator
3. Install and start [Appium](https://appium.io/docs/en/latest/) server
4. Configure your app settings in config/config.json

### Sample Configuration
```
{
  "apps": [
        {
      "package": "com.instagram.android",
      "activity": "com.instagram.android.activity.MainTabActivity",
      "screens": {
        "home": {
          "navigate": []
        },
        "search": {
          "navigate": [
            {
              "action": "tap",
              "bounds": "[288,2828][432,2972]"
            }
          ]
        },
        "create": {
          "navigate": [
            {
              "action": "tap",
              "bounds": "[648,2828][792,2972]"
            }
          ]
        },
        "reels": {
          "navigate": [
            {
              "action": "tap",
              "bounds": "[1008,2828][1152,2972]"
            }
          ]
        },
        "profile": {
          "navigate": [
            {
              "action": "tap",
              "bounds": "[1296,2828][1440,2972]"
            }
          ]
        }
      }
    }
  ]
}
```

### Quick Start
```
python ui_action_automator.py
```

### Support
For issues, questions, or feature requests, please create an issue in the GitHub repository.
