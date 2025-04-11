# UI Probing Tool

### Prerequisites

- [Android Studio with Emulator](https://developer.android.com/studio?hl=ko)   
- [Appium](https://appium.io/docs/en/latest/)

### Setup
```
git clone https://github.com/gh0stui/GhostUI.git
cd GhostUI
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
      "package": "com.google.android.youtube",
      "activity": "com.google.android.youtube.app.honeycomb.Shell$HomeActivity",
      "screens": {
        "feed": {
          "navigate": []
        },
        "search": {
          "navigate": [
              {"action": "tap", "bounds": "[0,0][1440,420]"}
            ]
        },
        "shorts": {
          "navigate": [
              {"action": "tap", "bounds": "[390,2886][474,2970]"}
            ]
        },
        "video": {
          "navigate": [
              {"action": "tap", "bounds": "[966,2886][1050,2970]"},
              {"action": "tap", "bounds": "[0,784][1440,1594]"}
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
