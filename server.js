const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "data", "img"));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${file.originalname}-${Date.now()}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

app.use(express.json());
app.use(cors());
app.use("/data/img", express.static(path.join(__dirname, "data", "img")));
app.use("/client", express.static(path.join(__dirname, "client")));


app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

//get request for specific image file
app.get("/data/json/:filename", (req, res) => {
    const jsonFilePath = path.join(__dirname, "data", "json", req.params.filename+".json");
    if (!fs.existsSync(jsonFilePath)) {
        return res.status(404).send("Image data not found");
    }

    const imgData = JSON.parse(
        fs.readFileSync(jsonFilePath, "utf8")
    );

    res.json({
        paths: imgData
    });
});

//get request sends all the image files on the server to client
app.get("/data/img/", (req, res) => {
    const imgDir = path.join(__dirname, "data", "img");

    fs.readdir(imgDir, (err, files) => {
        if (err) {
            return res.status(500).send("Could not read image folder");
        }

        const images = files.map(filename => ({
            filename: filename,
            url: `/data/img/${filename}`
        }));

        res.json({ images });
    });
});

app.post("/data/img", upload.single("img-file"), (req, res) => {
    const imgData = JSON.parse(req.body.jsondata);
    fs.writeFileSync(
        "data/json/" + req.file.filename + ".json",
        JSON.stringify(imgData, null, 2)
    );
    res.json({
        message: req.file.originalname + " was uploaded successfully",
        file: req.file,
        name: req.file.filename,
        originalname: req.file.originalname
    });

});

const PORT = 8000;

app.listen(PORT, () => {
    console.log(`CanvasApp available at http://localhost:${PORT}/client/index.html`);
});
