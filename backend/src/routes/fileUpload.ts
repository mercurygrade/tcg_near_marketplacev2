import { Request, Router, Response } from "express";
import multer from "multer";
import path from "path";
import FormData from "form-data";
import fs from "fs";

const router = Router();
export const uploadMiddleware = multer({ dest: "./uploads" });

router.post(
  "/test",
  [uploadMiddleware.single("image")],
  async (req: any, res: Response) => {
    console.log("request received at");
    try {
      // Create a new FormData instance
      const form = new FormData();

      // Append the text fields and files from the incoming request
      req.body &&
        Object.keys(req.body).forEach((key) => {
          form.append(key, req.body[key]);
        });

      console.log("file", req.file);
      console.log("body", req.body);

      res.json({
        success: true,
      });

      // // Forward the request to the external API
      // const response = await axios.post(
      //   "https://example.com/api/endpoint",
      //   form,
      //   {
      //     headers: {
      //       "api-key": "your-api-key-here", // Your custom api-key
      //       ...form.getHeaders(), // Important to include form-data headers
      //     },
      //   }
      // );
      // console.log("Form", form);
      // Send back the response from the forwarded request
      // res.status(response.status).json(response.data);
    } catch (error) {
      console.error("Error forwarding request:", error);
      res.status(500).json({ error: "Failed to forward request" });
    }
  }
);

// Set up storage engine
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req: any, file: any, cb: any) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
// Init upload
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 1000000 }, // Limit file size to 1MB
//   fileFilter: function (req: any, file: any, cb: any) {
//     checkFileType(file, cb);
//   },
// }).single("myImage");

// Check file type
function checkFileType(file: any, cb: any) {
  // Allowed file extensions
  const filetypes = /jpeg|jpg|png|gif/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);
  console.log(mimetype, extname);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

// router.post("/submit-form", (req: any, res) => {
//   upload(req, res, (err: any) => {
//     if (err) {
//       //   res.render("index", { msg: err });
//       console.log(err);
//     } else {
//       if (req.file == undefined) {
//         // res.render("index", { msg: "No file selected!" });
//         console.log("No file");
//       } else {
//         console.log("uploaded", req.file.filename);
//         // res.render("index", {
//         //   msg: "File uploaded!",
//         //   file: `uploads/${req.file.filename}`,
//         // });
//       }
//     }
//   });
// });

// // Route to handle file uploads (if uploading files)
// router.post("/upload-file", upload.single("file"), (req, res) => {
//   console.log("Uploaded file:", req); // Log file details
//   console.log("Form fields:", req.body); // Log other form fields
//   res.send("File uploaded successfully");
// });

router.post("/", (req: Request, res: Response) => {});

export default router;
