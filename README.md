# *GhostUI*: Unveiling Hidden Interactions in Mobile UI

[![Dataset](https://img.shields.io/badge/Dataset-Hugging%20Face-yellow)](https://huggingface.co/datasets/ghostui/ghostui)

***GhostUI*** is the first comprehensive dataset specifically designed to capture and analyze hidden interactions in mobile applications—interactions that lack visible cues but are triggered by gestures such as swipe, long press, or double tap.

![Image](https://github.com/user-attachments/assets/b85a7df8-14d9-493a-a091-49310331acef)

## Overview

This repository contains the complete implementation of the *GhostUI* research project, including:

- **UI Probing Tool**: Automated tool for discovering interactions in mobile apps
- **Dataset Annotation Interface**: Web-based tool for annotating and validating hidden interactions
- **Validation Guidelines**: Structured framework for evaluating hidden interactions

## Dataset
The complete ***GhostUI*** dataset is available on Hugging Face:
**[🔗 GhostUI Dataset](https://huggingface.co/datasets/ghostui/ghostui)**

*The dataset contains *1,970* hidden interactions across *81* mobile applications.*

## Project Structure

```
GhostUI/
├── ui_probing_tool/       # Automated gesture testing framework
├── validation_tool/       # Web-basd annotation interface for dataset validation
├── README.md              # This file
```

## Components

### 1. UI Probing Tool (`ui_probing_tool/`)

An automated python tool that systematically explores mobile application interfaces to discover *hidden interactions*.

**Key Features:**
- Automated gesture execution (tap, swipe, long press, etc.)
- Screenshot capture and UI hierarchy analysis
- Interactive element detection and annotation

See [`ui_probing_tool/README.md`](ui_probing_tool/README.md) for detailed setup and usage instructions.

### 2. Dataset Annotation Interface (`validation_tool/`)

A Next.js web application for annotating, validating, and analyzing collected interaction datasets.

**Key Features:**
- Interactive dataset browsing and filtering
- Annotation guidelines and validation criteria
- Real-time decision recording and export
- Keyboard navigation for efficient annotation

See [`validation_tool/README.md`](validation_tool/README.md) for setup and usage instructions.

## Getting Started

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/gh0stui/GhostUI.git
   cd GhostUI
   ```

2. **Set up UI Probing Tool**
   ```bash
   cd ui_probing_tool
   pip install -r requirements.txt
   # See ui_probing_tool/README.md for detailed setup
   ```

3. **Set up Web Interface**
   ```bash
   cd validation_tool
   yarn install
   npx ts-node upload-server.ts     # backend
   yarn dev                         # frontend
   # See validation_tool/README.md for detailed setup
   ```

---

**Note**: This is a research project. The tools are designed for academic research and should be used responsibly and in accordance with app terms of service and applicable laws.
