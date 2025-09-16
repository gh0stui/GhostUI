import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import archiver from "archiver";

const app = express();
app.use(cors());
const PORT = 3001;

const basePath = "../ui_probing_tool/dataset";

app.post(
  "/dataset/*",
  express.text(),
  (req: express.Request<{ 0: string }>, res) => {
    const relPath = req.params[0]; // everything after /dataset/
    const filePath = path.join("../ui_probing_tool/dataset", relPath);
    const dir = path.dirname(filePath);

    // Create directories if they don't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    try {
      fs.writeFileSync(filePath, req.body, "utf8");
      res.json({ message: "File written", path: relPath });
    } catch (err) {
      res.status(500).json({ error: "Failed to write file", details: err });
    }
  }
);

// @ts-ignore
app.get(
  "/list-folders",
  async (req: Request, res: Response): Promise<Response> => {
    const basePath = "../ui_probing_tool/dataset";
    const relPath = (req.query.path as string) || "";
    const targetPath = path.join(basePath, relPath);

    if (!targetPath.startsWith(basePath)) {
      return res.status(403).json({ error: "Invalid path." });
    }

    try {
      const folders = fs
        .readdirSync(targetPath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

      return res.json({ path: relPath, folders });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to read folder",
        details: (error as Error).message,
      });
    }
  }
);

// @ts-ignore
app.get("/images", async (req: Request, res: Response): Promise<Response> => {
  const basePath = "../ui_probing_tool/dataset";
  const relPath = (req.query.path as string) || "";
  const targetPath = path.join(basePath, relPath);

  if (!targetPath.startsWith(basePath)) {
    return res.status(403).json({ error: "Invalid path." });
  }

  try {
    const images = fs
      .readdirSync(targetPath, { withFileTypes: true })
      .filter((dirent) => dirent.isFile())
      .filter((dirent) => /\.(jpg|jpeg|png|gif|webp)$/i.test(dirent.name))
      .map((dirent) => path.join(relPath, dirent.name));

    return res.json({ path: relPath, images });
  } catch (e) {
    return res
      .status(500)
      .json({ error: "Failed to fetch images", details: (e as Error).message });
  }
});

// @ts-ignore
app.get("/paths", async (req: Request, res: Response): Promise<Response> => {
  const basePath = "../ui_probing_tool/dataset";
  const relPath = (req.query.path as string) || "";
  const targetPath = path.join(basePath, relPath);

  if (!targetPath.startsWith(basePath)) {
    return res.status(403).json({ error: "Invalid path." });
  }

  try {
    const resultPaths: { filePath: string; content: string }[] = [];

    const walk = (dir: string, rel: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const absPath = path.join(dir, entry.name);
        const subRelPath = path.join(rel, entry.name);

        if (entry.isDirectory()) {
          walk(absPath, subRelPath);
        } else if (entry.isFile() && entry.name === "path.txt") {
          const content = fs.readFileSync(absPath, "utf-8");
          resultPaths.push({
            filePath: subRelPath,
            content,
          });
        }
      }
    };

    walk(targetPath, relPath);

    return res.json({ filePath: relPath, files: resultPaths });
  } catch (e) {
    return res.status(500).json({
      error: "Failed to find path.txt files",
      details: (e as Error).message,
    });
  }
});

// @ts-ignore
app.get(
  "/decisions",
  async (req: Request, res: Response): Promise<Response> => {
    const basePath = "../ui_probing_tool/dataset";
    const relPath = (req.query.path as string) || "";
    const targetPath = path.join(basePath, relPath);

    if (!targetPath.startsWith(basePath)) {
      return res.status(403).json({ error: "Invalid path." });
    }

    try {
      const resultPaths: { filePath: string; content: string }[] = [];

      const walk = (dir: string, rel: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const absPath = path.join(dir, entry.name);
          const subRelPath = path.join(rel, entry.name);

          if (entry.isDirectory()) {
            walk(absPath, subRelPath);
          } else if (entry.isFile() && entry.name === "decision.txt") {
            const content = fs.readFileSync(absPath, "utf-8");
            resultPaths.push({
              filePath: subRelPath,
              content,
            });
          }
        }
      };

      walk(targetPath, relPath);

      return res.json({ filePath: relPath, files: resultPaths });
    } catch (e) {
      return res.status(500).json({
        error: "Failed to find decision.txt files",
        details: (e as Error).message,
      });
    }
  }
);

// @ts-ignore
app.get("/filtered-dataset", (req: Request, res: Response) => {
  const relPath = (req.query.path as string) || "";
  const fullPath = path.join(basePath, relPath);

  if (!fullPath.startsWith(basePath) || !fs.existsSync(fullPath)) {
    return res.status(400).json({ error: "Invalid or non-existent path." });
  }

  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=filtered-dataset.zip`
  );

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.on("error", (err) => res.status(500).send({ error: err.message }));
  archive.pipe(res);

  // filter
  const includeIfDecisionMatches = (dir: string, relative = "") => {
    const appNames = fs.readdirSync(dir, { withFileTypes: true });

    for (const app of appNames) {
      if (!app.isDirectory()) continue;
      const appPath = path.join(dir, app.name);
      const screenNames = fs.readdirSync(appPath, { withFileTypes: true });

      for (const screen of screenNames) {
        if (!screen.isDirectory()) continue;
        const screenPath = path.join(appPath, screen.name);
        const gestures = fs.readdirSync(screenPath, { withFileTypes: true });

        for (const gesture of gestures) {
          if (!gesture.isDirectory()) continue;
          const gesturePath = path.join(screenPath, gesture.name);
          const numbers = fs.readdirSync(gesturePath, { withFileTypes: true });

          for (const number of numbers) {
            if (!number.isDirectory()) continue;
            const numberPath = path.join(gesturePath, number.name);
            const decisionFilePath = path.join(numberPath, "decision.txt");

            if (fs.existsSync(decisionFilePath)) {
              const content = fs.readFileSync(decisionFilePath, "utf-8");
              const decision = JSON.parse(content);

              // check condition (meets all conditions - AND)
              // TODO: fix filter logic
              const temp = getDecisionResultByGesture(gesture.name, decision);
              console.log(temp);

              // @ts-ignore
              if (
                decision.every(
                  (decisionData: any) => decisionData.decision === "o"
                )
              ) {
                const relZipPath = path.join(
                  relative,
                  app.name,
                  screen.name,
                  gesture.name,
                  number.name
                );
                archive.directory(numberPath, relZipPath);
              }
            }
          }
        }
      }
    }
  };

  includeIfDecisionMatches(fullPath, relPath);
  archive.finalize();
});

console.log("Serving dataset from:", basePath);
app.use("/dataset", express.static(basePath));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

const getDecisionResultByGesture = (gesture: string, decisions: Array<any>) => {
  switch (gesture) {
    case "tap":
      return (
        decisions.find((d) => d.type === "isCorrect")?.decision === "o" &&
        (() => {
          const elementDecision = decisions.find(
            (d) => d.type === "elementType"
          )?.decision;
          return (
            elementDecision &&
            typeof elementDecision === "object" &&
            "selectedOptions" in elementDecision &&
            elementDecision.selectedOptions.length === 1 &&
            (elementDecision.selectedOptions[0] === "imageOrVideo" ||
              elementDecision.selectedOptions[0] === "emptySpace")
          );
        })()
      );

    case "double_tap":
    case "long_press":
      return decisions.find((d) => d.type === "isCorrect")?.decision === "o";

    default:
      return (
        decisions.find((d) => d.type === "isCorrect")?.decision === "o" &&
        decisions.find((d) => d.type === "isHidden")?.decision === "o"
      );
  }
};
