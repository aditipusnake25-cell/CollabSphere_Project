import multer from "multer"
import path from 'path'
import fs from 'fs'

const uploadDir = path.resolve('uploads')
fs.mkdirSync(uploadDir , {recursive:true})

const storage = multer.diskStorage({
    destination:(_req,_file , cb)=>{
        cb(null,uploadDir)
    },
  filename: (req, file, cb) => {
  cb(null, Date.now() + "-" + file.originalname);
}
})

const allowedExtensions=[".js",".jsx",".py",".java",".html",".css",".json",".md",".txt",".pdf",".png",".jpg",".jpeg",".gif",".webp",".zip"]
const upload = multer({
    storage,limits:{
        fileSize:5*1024*1024
    },
    fileFilter:(_req,file,cb)=>{
        const ext =path.extname(file.originalname).toLowerCase()
        if(allowedExtensions.includes(ext)){
            return cb(null,true)
        }
        cb(new Error("This file type is not supported!"))
    }
})
export default upload