const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');


const app = express();

//Middleware
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

//Mongo URI
const mongoURI = 'mongodb+srv://admin:test@finalcluster-lt6js.mongodb.net/test?retryWrites=true&w=majority';


//Create mongo connection
//const conn = mongoose.createConnection(mongoURI);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);
//const conn = mongoose.createConnection(mongoURI, { useUnifiedTopology: true, useNewUrlParser: true, }) .then(() => console.log('MongoDB Connected!')) .catch(err => { err => console.log(err) });
const conn = mongoose.createConnection(mongoURI, { useUnifiedTopology: true, useNewUrlParser: true, });
//Init gfs
let gfs;

//Init stream
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});



//Create storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
});
const upload = multer({ storage });

// @route GET /
// @desc Loads form
app.get('/', (req, res) => {
    res.render('index');
});

// @route POST /
// @desc Uploads file to DB
app.post('/upload', upload.single('file'),(req, res) => {
    res.json({file: req.file});
});
const port = 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));