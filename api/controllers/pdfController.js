'use strict';


var mongoose = require('mongoose'),
  Task = mongoose.model('Tasks');

exports.list_all_tasks = function(req, res) {
  Task.find({}, function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};

exports.create_a_task = function(req, res) {
  var new_task = new Task(req.body);
  new_task.save(function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};


exports.read_a_task = function(req, res) {
  Task.findById(req.params.taskId, function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};


exports.update_a_task = function(req, res) {
  Task.findOneAndUpdate({_id: req.params.taskId}, req.body, {new: true}, function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};


exports.delete_a_task = function(req, res) {


  Task.remove({
    _id: req.params.taskId
  }, function(err, task) {
    if (err)
      res.send(err);
    res.json({ message: 'Task successfully deleted' });
  });
};


// For PDF
exports.createPDF = function(req, res){
  
  console.log("MASON IT IS HERE", req)
  console.log("MASON IT IS HERE2", req.body)
  console.log("MASON IT IS HERE3", req.body['url'])
  console.log("MASON IT IS HERE4", req.body['url'].split('.'))
  var objPath = req.body['url'].split('.')
  console.log("Mason5", objPath.join(''))
  var pdfPath = objPath.join('')


  let url = 'https://' +  req.body['url'].toString()
  //CREATING A PDF
  const puppeteer = require('puppeteer');
  // Scrape Method
    let scrape = async () => {

      const browser = await puppeteer.launch({headless: true});
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
      console.log("What is my", url.toString())
      await page.goto( url , {waitUntil: "networkidle2" });

      //await page.pdf({
      const result = await page.pdf({  
       path: pdfPath + '.pdf',
       pageRanges: "1",
       format: "A4",
       printBackground: true
      });
     await browser.close();

     uploadFile(result);
  }
  // RESPOND PDF
  scrape()

  // // //
const fs = require('fs');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: "",
    secretAccessKey: ""
});

const fileName =  pdfPath + '.pdf';

const uploadFile = (dataPDF) => {
  fs.readFile(fileName, (err, data) => {
     if (err) throw err;
     const params = {
         Bucket: '', // pass your bucket name
         Key: 'testThree.pdf', // file will be saved as testBucket/contacts.csv
         Body: dataPDF,
         contentType : 'application/pdf'
     };
     s3.upload(params, function(s3Err, data) {
         if (s3Err) throw s3Err
         console.log(`File uploaded successfully at ${data.Location}`)
     });
  });
};




}; //end function

exports.getPDF = function(req, res){
	
}