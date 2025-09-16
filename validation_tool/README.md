# Web-based Validation Tool Interface

A Next.js web application for annotating, validating, and analyzing mobile UI interaction datasets collected by the ***GhostUI*** project.

## Overview
![Image](https://github.com/user-attachments/assets/72fc6699-17ff-4485-a3f3-ec631ecfd639)

This web interface provides a comprehensive platform for researchers to:
- Browse and filter interaction datasets
- Annotate UI interactions following structured guidelines
- Validate hidden interaction discoveries

## Features

- **Interactive Dataset Browser**: Navigate through collected interaction data by app, screen, and gesture type
- **Annotation Guidelines**: Built-in guidelines page with validation criteria and examples
- **Real-time Decision Recording**: Save annotation decisions with immediate persistence
- **Keyboard Navigation**: Efficient annotation workflow with arrow key navigation

## Architecture

The application consists of two servers:

1. **Next.js App Server** (Port 3000): Main web interface
2. **Express Data Server** (Port 3001): Dataset access and management

### Key Components

- `/guidelines` - Annotation guidelines and validation criteria
- `/results` - Main annotation interface
- `/[appName]` - App-specific dataset views

## Prerequisites

- Node.js 16+ 
- npm or yarn
- Dataset files (if available)

## Installation

1. **Clone the repository**
   ```bash
   cd validation_tool
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

## Usage

### Development Mode

1. **Start the Express data server**
   ```bash
   npx ts-node upload-server.ts
   ```
   This starts the data server at `http://localhost:3001`

2. **Start the Next.js development server** (in a separate terminal)
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   This starts the web interface at `http://localhost:3000`

3. **Access the application**
   - Main interface: http://localhost:3000
   - Annotation guidelines: http://localhost:3000/guidelines
   - Results page: http://localhost:3000/results

### Production Mode

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

3. **Start the data server**
   ```bash
   npx ts-node upload-server.ts
   ```

## Configuration

The application uses localhost configuration for open-source deployment:

- **API Base URL**: `http://localhost:3001`
- **Image Domains**: `localhost` (configured in `next.config.ts`)
- **Dataset Path**: `../ui_probing_tool/dataset` (relative to upload-server.ts)

## Dataset Structure

The interface expects datasets in the following structure:

```
dataset/
├── {AppName}/
│   ├── {ScreenType}/
│   │   ├── {Gesture}/
│   │   │   ├── {Instance}/
│   │   │   │   ├── before.png
│   │   │   │   ├── after.png
│   │   │   │   ├── before_annotated.png
│   │   │   │   ├── before_annotated_with_children.png
│   │   │   │   ├── action.json
│   │   │   │   ├── decision.txt
│   │   │   │   └── path.txt
```

## Annotation Workflow

1. **Browse Datasets**: Navigate through apps and interaction instances
2. **Review Guidelines**: Understand validation criteria at `/guidelines`
3. **Annotate Interactions**: Use the results interface to:
   - Evaluate interaction validity
   - Label visual elements (border, text, icon, media, whitespace)
   - Assess hidden nature of interactions

## API Endpoints

The Express server provides the following endpoints:

- `GET /list-folders` - List dataset folders
- `GET /images` - Get images for a path
- `GET /decisions` - Get all decision files
- `GET /paths` - Get all path files  
- `POST /dataset/*` - Save annotation data
- `GET /filtered-dataset` - Export filtered datasets


## File Structure

```
validation_tool/
├── app/                      # Next.js App Router pages
│   ├── [appName]/           # Dynamic app pages
│   ├── guidelines/          # Annotation guidelines
│   └── results/             # Main annotation interface
├── api/                     # API utility functions
├── types/                   # TypeScript definitions
├── ui/                      # React components
│   ├── components/          # Reusable UI components
│   └── feature/             # Feature-specific containers
├── upload-server.ts         # Express data server
└── public/                  # Static assets
```
---

This interface is part of the GhostUI research project for studying hidden UI interactions in mobile applications.