//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const mongoose = require("mongoose");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//connect to mongodb
// const url = "mongodb+srv://admin-leeyee:howtocountfish2020@cluster0.wa6hq.mongodb.net/fishMonitoringDB?retryWrites=true&w=majority";
const url = "mongodb://localhost:27017/fishMonitoringDB";
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//top collection
const imageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name required"]
  },
  content: {
    type: String,
    required: [true, "content required"]
  },
  fishCenters: Array,
  fishMedian: Array,
  liveFishCount: {
    type: Number,
    required: [true, "liveFishCount required"]
  },
  deadFishCount: {
    type: Number,
    required: [true, "deadFishCount required"]
  },
  frameSize: {
    type: Array,
    required: [true, "frameSize required"]
  },
  status: {
    type: String,
    required: [true, "status required"]
  },
  time: Date
})

const Image = mongoose.model("Image", imageSchema);

//hour collection
const hourSchema = new mongoose.Schema({
  date: {
    type: String,
    required: [true, "date required"]
  },
  hours: {
    type: Array,
    required: [true, "hour required"]
  },
  numOfLiveFish: {
    type: Array,
    required: [true, "numOfLiveFish required"]
  },
  numOfDeadFish: {
    type: Array,
    required: [true, "numOfDeadFish required"]
  },

});

const Hour = mongoose.model("Hour", hourSchema);

//event collection
const eventSchema = new mongoose.Schema({
  date: {
    type: String,
    required: [true, "date required"]
  },
  startTime: {
    type: String,
    required: [true, "startTime required"]
  },
  endTime: {
    type: String,
    required: [true, "endTime required"]
  },
  status: {
    type: String,
    required: [true, "status required"]
  },
  numOfLiveFish: {
    type: Number,
    required: [true, "numOfLiveFish required"]
  },
  numOfDeadFish: {
    type: Number,
    required: [true, "numOfDeadFish required"]
  },
  camera:{
    type: String,
    required: [true, "camera required"]
  }
});

const Event = mongoose.model("Event", eventSchema);

let screenshot = '';

app.get('/send/top', (req, res) => {
  //res.sendFile(__dirname +"/views/test.html",);
  Image.findOne({'name':'top'}, function(err, image) {
      if (!err && image) {
        res.json({
          name: image.name,
          screenshotBuffer: image.content,
          fishCenters: image.fishCenters,
          fishMedian: image.fishMedian,
          liveFishCount: image.liveFishCount,
          deadFishCount: image.deadFishCount,
          frameWidth: image.frameSize[1],
          frameHeight: image.frameSize[0],
          status: image.status,
          time:image.time,
        });
    }
  });
})

app.get('/send/front', (req, res) => {
  //res.sendFile(__dirname +"/views/test.html",);
  Image.findOne({'name':'front'}, function(err, image) {
      if (!err && image) {
        res.json({
          name: image.name,
          screenshotBuffer: image.content,
          fishCenters: image.fishCenters,
          fishMedian: image.fishMedian,
          liveFishCount: image.liveFishCount,
          deadFishCount: image.deadFishCount,
          frameWidth: image.frameSize[1],
          frameHeight: image.frameSize[0],
          status: image.status,
          time:image.time,
        });
    }
  });
})

//render index.ejs
app.get('/', (req, res) => {
  res.render("index", {
    url: "http://localhost:2020/send/top",
  });

});

//render index.ejs top view
app.get('/top', (req, res) => {
  res.render("index", {
    url: "http://localhost:2020/send/top",
  });
});

//render index.ejs front view
app.get('/front', (req, res) => {
  res.render("index", {
    url: "http://localhost:2020/send/front",
  });
});

//render download.ejs
app.get("/report", function(req, res) {
  res.render("download");
});

app.get("/report/:date", function(req, res) {
  const requestedDate = req.params.date;
  //find number of fish per hour on selected date
  Hour.findOne({
    'date': requestedDate
  }).populate('events').exec(function(err, hour) {
    if (!err && hour) {
      //find status of fish to generate table
      Event.find({
        'date': requestedDate
      }, function(err, events) {
        if (events.length !== 0) { //if have status to show
          res.render("report", {
            title: requestedDate,
            hourArray: hour.hours,
            fishArray: hour.numOfLiveFish,
            statusArray: events,
            emptyBar: false,
            emptyTable: false
          })
        } else { //if no status to show
          res.render("report", {
            title: requestedDate,
            hourArray: hour.hours,
            fishArray: hour.numOfLiveFish,
            statusArray: [],
            emptyBar: false,
            emptyTable: true
          })
        }
      })
    } else { //if no hourly record to show
      //check if have status to show
      Event.find({
        'date': requestedDate
      }, function(err, events) {
        if (events.length !== 0) { //if have status to show
          res.render("report", {
            title: requestedDate,
            hourArray: [],
            fishArray: [],
            statusArray: events,
            emptyBar: true,
            emptyTable: false
          })
        } else { //if no status to show
          res.render("report", {
            title: requestedDate,
            hourArray: [],
            fishArray: [],
            statusArray: [],
            emptyBar: true,
            emptyTable: true
          })
        }
      })

    }
  })
});

app.post("/delete", function(req, res) {
  const selectedDate = req.body.selectedDate;

  Hour.deleteOne({'date':selectedDate}, function(err) {
    if (!err) {
      console.log('Successfully deleted record on ' + selectedDate);
      // res.redirect("/report/" + selectedDate);
    }
  });
  Event.deleteMany({'date':selectedDate}, function(err) {
    if (!err) {
      console.log('Successfully deleted record on ' + selectedDate);
    }
  });
  res.redirect("/report/" + selectedDate);

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 2020;
}

app.listen(port, () => {
  console.log('server has started!')
});
