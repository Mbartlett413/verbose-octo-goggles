'use strict';


var mongoose = require('mongoose'),
  Pdf = mongoose.model('Pdf'),
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
  //stripURLDownToName
  console.log("Recieving::", req.body)
  var objPath = req.body['secondaryURL'].split('.')
  var secPath = objPath.join('')
  var thrPath = secPath.split('/')
  var pdfPath = thrPath.join('')
  console.log("pdf Value is:::", pdfPath)


  //Set the URL
  if ( req.body['secondaryURL'].toString().includes('http') == true ){
    var url = req.body['secondaryURL'].toString()
    
  } else {
    var url = 'http://' + req.body['secondaryURL'].toString()

  }
 console.log("What is my!!!", url.toString())


  //CREATING A PDF
  const puppeteer = require('puppeteer');
  // Scrape Method
    let scrape = async () => {

      const browser = await puppeteer.launch({headless: true});
      const page = await browser.newPage();
      //await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
      console.log("What is my", url.toString())
      await page.goto( url , {waitUntil: "networkidle2" });

      //await page.pdf({
      const result = await page.pdf({  
       path: pdfPath + '.pdf',
       //pageRanges: "1",
       
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
      accessKeyId: "AKIAIBMSH5IQ6F4M5ZPA",
      secretAccessKey: "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"
  });

  const fileName =  pdfPath + '.pdf';

  const uploadFile = (dataPDF) => {

    var base64data = new Buffer(dataPDF, 'binary');
    fs.readFile(fileName, (err, data) => {
       if (err) throw err;
       const params = {
           Bucket: 'masonbartlettbucket', // pass your bucket name
           Key: fileName, // file will be saved as testBucket/contacts.csv
           Body: dataPDF,
           contentType : 'application/pdf'
       };
       s3.upload(params, function(s3Err, data) {
           if (s3Err) throw s3Err
           console.log(`File uploaded successfully at ${data.Location}`)
           var pdfLocation = data.Location;

           var pdfConstruct = { 
             url: req.body['secondaryURL'], 
             catalog_Url: req.body['dynamoURL'],
             pdf_s3_link: data.Location,
            }
           //res.json({ pdfLocation: pdfLocation });
          //First chc will do a GET, if GET returns NULL, CREATE
            var new_pdf = new Pdf(pdfConstruct);
            new_pdf.save(function(err, pdfConstruct){
              if (err)
                res.send(err);
              //res.json(pdfConstruct);

              //we want to see if there are any other entries before responding
              findandRespond(req.body['dynamoURL']);
            }); 
          //

       });
    });
  };

// find and respond
  function findandRespond(catalogURL){
    var beauPDF = catalogURL;
    Pdf.find({catalog_Url: beauPDF }, function( err, pdf) { 
      if (err)
        res.send(err)
      res.json({status: "ok", pdf: pdf})

      
    });
  }


}; //end function

//

exports.getPDF = function(req, res){
  console.log("What am i recieving", req.body['dynamoURL'])
  console.log("What am i recieving", req.body['secondaryURL'])
  //var beauPDF = req.body['dynamoURL']
  var beauPDF = req.body['secondaryURL']
  console.log("What am i recieving2", req.params)


  // find multiple
  Pdf.find({url: beauPDF }, function( err, pdf) { 
  //Pdf.find({catalog_Url: beauPDF }, function( err, pdf) { 
    if (err)
      res.send(err)
    console.log("PDF length", pdf.length)
    if (pdf.length == 0){
      res.json({ message: "No Existing Entries", status: "none"})
    } else {
      Pdf.find({catalog_Url: req.body['dynamoURL'] }, function( err, pdf) { 
        res.json({status: "ok", pdf: pdf})
      })
      //res.json({status: "ok", pdf: pdf})
    }
    
  });

}

exports.delete_a_pdf = function(req, res) {
  console.log("in the delete",req.body)
  console.log("req.params._id", req.body['_id']) 

  Pdf.remove({
    _id: req.body['_id']
  }, function(err, task) {
    if (err)
      res.send(err);
    res.json({ message: 'PDF successfully deleted' });
  });
};

exports.validateCatalog = function(req, res){
  var ruleCollection = [];
  //console.log("key0", req.body['OrganizationName'])
  var orgNameDetails = req.body['OrganizationName']
  for (const [key, value] of Object.entries(orgNameDetails)) {
    //console.log(key, value);
    if (key == 'OrganizationName') {
      console.log("OrganizationName", value)
      validateCatalogField(value)
    } else if (key == 'OrgDescription'){
      console.log("OrgDescription", value)
      validateCatalogField(value)
    } else if (key == 'HomePageURL'){
      console.log("HomePageURL", value)
    }
  }

    //console.log("key1", req.body['Programs'])
  var programDetails = req.body['Programs']
    for (var i = 0; i< programDetails.length; i++){
      //console.log("grab detail", programDetails[i])
      console.log("PopulationDescription", programDetails[i]['PopulationDescription'])
      if( programDetails[i]['PopulationDescription'] != undefined){
          validateCatalogField(programDetails[i]['PopulationDescription'])
      }

      console.log("ProgramDescription", programDetails[i]['ProgramDescription'])
      if( programDetails[i]['ProgramDescription'] != undefined){
          validateCatalogField(programDetails[i]['ProgramDescription'])
      }

      console.log("ServiceAreaDescription", programDetails[i]['ServiceAreaDescription'])
      if( programDetails[i]['ServiceAreaDescription'] != undefined){
          validateCatalogField(programDetails[i]['ServiceAreaDescription'])
      }

      console.log("ProgramReferences", programDetails[i]['ProgramReferences'])
      if( programDetails[i]['ProgramReferences'] != undefined){
          validateCatalogField(programDetails[i]['ProgramReferences'])
      }
    }

    //console.log("key2", req.body['OrgSites'])
  var siteDetails = req.body['OrgSites']
    for (var i = 0; i< siteDetails.length; i++){
      //console.log("grab detail", siteDetails[i])
      console.log("add", siteDetails[i]['Addr1'])
      if( siteDetails[i]['Addr1'] != undefined){
        validateCatalogField(siteDetails[i]['Addr1'])
      }

      console.log("SiteReference", siteDetails[i]['SiteReference'])
      if( siteDetails[i]['SiteReference'] != undefined){
        validateCatalogField(siteDetails[i]['SiteReference'])
      }
    }

  function validateCatalogField(entry){
    var data = entry 
      console.log("Collection were working on", data)
        function seleniumRule(data){
                  //console.log("second", data);
                  //console.log("second", data.length);
                  require('chromedriver');
                  const {Builder, By, Key, until} = require('selenium-webdriver');
                  let driver = new Builder().forBrowser('chrome').build();
                  (async function () {
                      console.log("data is ", data)
                      var domain = 'http://www.example.com/'
                      var my_xpath = '//p' //' + data[0]['Xpath'];
                      //var my_text = data[0]['Text'];

                      await driver.get(domain)
                      //let links = await driver.findElements({css:'nav > ul > li > a'});
                      let links = await driver.findElements({xpath: '//p'});
                      let stringFoundArray = {};
                      let ruleCollection = [];
                      for(let link of links) {
                          var text = await link.getText();
                          console.log(text);
                          if (text.includes('domain')){
                            console.log("FOUND HER!!!!")
                            stringFoundArray = {};
                            stringFoundArray.status = true
                            ruleCollection.push(stringFoundArray)
                            return driver.quit();
                          } else {
                            stringFoundArray = {};
                            stringFoundArray.status = false
                            ruleCollection.push(stringFoundArray)
                            return driver.quit();
                          }
                      } 
                      
                  })()
        }//end seleniumRuleFx

    if (data.length == 1) { //@*@*@*@*@*@*@*@*@*@*@*@*@*@*@*//
        console.log("First 1",data)
        seleniumRule(data)
                if( data[0]['Domain'] == 'n/a' && data[0]['Xpath'] == 'n/a' || data[0]['Domain'] == '' && data[0]['Xpath'] == ''){
                  console.log("Skip from fx")
                } else if (data[0]['Domain'] != 'n/a' && data[0]['Xpath'] == 'n/a' || data[0]['Domain'] != '' && data[0]['Xpath'] == ''){
                  console.log("Search & Rescue from ChcPortal")
                  //This catch is for information that is entered from chc Portal and needs to be validated. The Domain should be passed
                } else if (data[0]['Domain'] != 'n/a' && data[0]['Xpath'] != 'n/a' || data[0]['Domain'] != '' && data[0]['Xpath'] != ''){
                    seleniumRule(data)
                } else {
                  console.log("This is an error")
                }
    } else { // data.length >1/ //@*@*@*@*@*@*@*@*@*@*@*@*@*@*@*//
        console.log("First First bigger than 1")
        for( var i =0; i < data.length; i++){
          console.log("DaTa By Data", data[i])
                  if( data[i]['Domain'] == 'n/a' && data[i]['Xpath'] == 'n/a' || data[i]['Domain'] == '' && data[i]['Xpath'] == ''){
                    console.log("Skip from multiple")
                    //
                    //
                  } else if (data[i]['Domain'] != 'n/a' && data[i]['Xpath'] == 'n/a' || data[i]['Domain'] != '' && data[i]['Xpath'] == ''){
                    console.log("Search & Rescue from ChcPortal")
                    //This catch is for information that is entered from chc Portal and needs to be validated. The Domain should be passed
                  } else if (data[i]['Domain'] != 'n/a' && data[i]['Xpath'] != 'n/a' || data[i]['Domain'] != '' && data[i]['Xpath'] != ''){
                    console.log("Do a search")
                      seleniumRule(data[i])

                  } else {
                    console.log("This is an error")
                  }
        }
      } //@*@*@*@*@*@*@*@*@*@*@*@*@*@*@*//
  }  
   res.json({status: "ok"})
}

