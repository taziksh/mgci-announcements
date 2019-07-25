
/* 
*/
var slidesId = "13PLtgiqNN4hqjYIzrPrVP_J14EzY_2JerRsciH-O-oo";
var studentSheetId = "18JxvG6M8cuuHDjTPkSXewtC94p953unGxi0uLmCdzbo";
var acceptedSheetId = "1fWBfUv526X8OxUeo1oQ4mRfckz7mCE7501R5XnP0S4w";
var teacherSheetId = "1c_QK1f25aZUUqrDF8fQ-WdiznLlXZfjI94lgf7_jneQ";
var clubSheetId = "1fOKQmXDhLjEDf3LzPCMiRU5KrUWeuD4i_1e1mkXRzrA";
//var clubSheetId = "1KtI_XfHENCIka7RxGC7QqzaT_9esmThix3rhA1_gcQQ";

var presentation = SlidesApp.openById(slidesId);
var studentResponses = SpreadsheetApp.openById(studentSheetId).getActiveSheet();
var acceptedResponses = SpreadsheetApp.openById(acceptedSheetId).getSheets()[0];
var teacherResponses = SpreadsheetApp.openById(teacherSheetId).getSheets()[0];
var clubResponses = SpreadsheetApp.openById(clubSheetId).getSheets()[0];

var altImage = "1r7jhRJw8e8JtyIkLeJqCWmiQkQK6qeYc";

function clearSlides(){
  var slideArray = presentation.getSlides();  
  for (i = 0; i < slideArray.length; i++)
  {
    slideArray[i].remove();
  }
}

insertLogo = function(clubData, slide, row) {
  var image, fileId, blob, imageInSlide;
  
  if (row === -1)
    id = altImage;
  else
    id = clubData[row + 2][1];
 
  image = "http://drive.google.com/uc?export=view&id=" + id;  
  Logger.log("Row of club: " + row);
  Logger.log("Image url: " + image);
  
  fileId = image.match(/[\w\_\-]{25,}/).toString();
  blob = DriveApp.getFileById(fileId).getBlob();

  imageInSlide = slide.insertImage(blob, 100, 50, 500, 20);
  imageInSlide.scaleHeight(5).scaleWidth(5);
  imageInSlide.alignOnPage(SlidesApp.AlignmentPosition.CENTER);
  imageInSlide.setTop(10);
}

binarySearch = function(arr, l, r, x)
{
    if (r >= l) { 
        var mid = parseInt(l + (r - l) / 2);
      
        if (arr[mid].indexOf(x) !== -1)
            return mid;                              
        if (arr[mid] > x) 
            return binarySearch(arr, l, mid - 1, x);  
        else
            return binarySearch(arr, mid + 1, r, x); 
    }   
    return -1; 
}

format = function(str)
{
  // lowercase -> remove spaces, dashes
  return str.toLowerCase().replace(/\s|-|mgci/g, ""); // remove apostrophes, dots
  //!!!!!!!!!
}

createSlides = function(club, message){
  /*
  */  
  var firstRow = 2;

  var clubData = clubResponses.getDataRange().getValues();
  var slide = presentation.appendSlide();
  var clubList = [];
  
  for (i = 0; i < clubResponses.getLastRow()-2; i++)
  {
      clubList.push((clubData[i+2][9]).toString());
    Logger.log("This is the " + i + "th index of clubList: " + clubList[i]);
  }   
  
  var row = binarySearch(clubList, 0, clubList.length-1, format(club)); 
  Logger.log("Formatted club name (what we're looking for): " + format(club));
  Logger.log("Length of array: " + clubList.length);
  Logger.log("Row where club is located in sheet: " + row);
  
  insertLogo(clubData, slide, row);

  var titleBox = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, 100, 160, 500, 20);
  var title = titleBox.getText();
  
  title.setText((club));
  title.getTextStyle().setFontFamily('Times New Roman').setFontSize(27);
  title.getParagraphs()[0].getRange().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);  
  
  var announcementBox = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, 100, 200, 500, 100);
  var announcement = announcementBox.getText();  
  var paragraphs = announcement.getParagraphs();

  announcement.setText(message);
  announcement.getTextStyle().setFontFamily('Times New Roman');
  announcement.getTextStyle().setFontSize(22);
  
  for (var i = 0; i < paragraphs.length; i++)
    paragraphs[i].getRange().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);  
}


// POST handler for responses; 
doGet = function(e) { 
  
  // Build a row of data with timestamp + posted response
  var row = [ new Date(), e.parameters.club[0], e.parameters.message[0], e.parameters.response[0] ];
  
    if (e.parameters.response[0] === "Yes")
    createSlides((e.parameters.club[0]).toString(),(e.parameters.message[0]).toString());
  
  var lock = LockService.getPublicLock();
  var unlocked = lock.tryLock(5 * 1000);    // Prevent others from accessing -> wait for 30 secs for other stuff
  if (unlocked) 
  {
    var rowNum = acceptedResponses.getLastRow()+1;                            // Save response to spreadsheet
    acceptedResponses.getRange(rowNum, 1, 1, row.length).setValues([row]);
    lock.releaseLock();                                           // Release the lock so that other processes can continue.
    var result = "Response Recorded: \n  "+row.join('\n  ');
  } 
  else 
    result = "System busy, please try again.";                    // Failed to get lock
 
  // POST -> plain text
  return ContentService.createTextOutput(result)
                       .setMimeType(ContentService.MimeType.TEXT);
}

sendEmail = function(studentEmail, teacherEmail, club, message, subject, html) {
  MailApp.sendEmail(teacherEmail, club + ': ' + message, subject, {htmlBody: html, name: studentEmail + ' '});
}

 /* Build & Send Survey, an HTML form in email.*/
createMessage = function(studentEmail, teacherEmail, club, message) {
  var subject = 'Morning Announcement';
  
  var scriptUrl = ScriptApp.getService().getUrl();   // Get the URL of the published Web App, to include in email for POST of response
  if (!scriptUrl) 
        throw new Error( 'You must Deploy as Web App first.' ); 
  
  // Build email body
  var template = HtmlService.createTemplateFromFile('emailTemplate');
  template.scriptUrl = scriptUrl;
  template.teacherEmail = teacherEmail;
  template.club = club;
  template.message = message;
  
  var html = template.evaluate().getContent();
  //   html += '<p>Alternatively, you may <A href="' + scriptUrl + '"> complete this survey online.</A>';
  
  sendEmail(studentEmail, teacherEmail, club, message, subject, html);    // Send email form
}

function caller()
{
  var firstRow = 2;

  var count = 0;
  var studentEmails = [], teacherEmails = [], clubs = [], messages = [];   
  
  var today = new Date();
  today.setHours(0,0,0,0);
  today = today.toString();
  
  studentResponses.autoResizeColumn(3);
  var studentData = studentResponses.getDataRange().getValues();
  
  for (i = firstRow; i < studentResponses.getLastRow() + 1; i++) 
  {
      var yesterDayOne = new Date(studentData[i-1][5] - 1);
      var yesterDayTwo = new Date(studentData[i-1][6] - 1);
      var yesterDayThree = new Date(studentData[i-1][7] - 1);

      yesterDayTwo.setHours(0,0,0,0);
      yesterDayOne.setHours(0,0,0,0);
      yesterDayThree.setHours(0, 0, 0, 0);

      yesterDayTwo = yesterDayTwo.toString();
      yesterDayOne = yesterDayOne.toString();
      yesterDayThree = yesterDayThree.toString();  
    if (today === yesterDayOne || today === yesterDayTwo || today === yesterDayThree)
    { 
      //messages.push(studentData[i-1][4]);
      studentEmails.push(studentResponses.getRange(i, 1+1, 1, 1).getValues());     
      teacherEmails.push(studentResponses.getRange(i, 2+1, 1, 1).getValues());     
      clubs.push(studentResponses.getRange(i, 3+1, 1, 1).getValues());     
      messages.push(studentResponses.getRange(i, 4+1, 1, 1).getValues());    
      createMessage(studentEmails[count][0], teacherEmails[count][0], clubs[count][0], messages[count][0]);
      count++;
    }
  }
}

function addTeacherSlides()
{
  var teacherData = teacherResponses.getDataRange().getValues();
  var firstRow = 2;

  var today = new Date();
  today.setHours(0,0,0,0);
  today = today.toString();
  
  for (i = firstRow; i < teacherResponses.getLastRow() + 1; i++)
  {
    var dayOne = new Date(teacherData[i-1][5-1]);
    var dayTwo = new Date(teacherData[i-1][6-1]);
    var dayThree = new Date(teacherData[i-1][7-1]);


    dayOne.setHours(0,0,0,0);
    dayTwo.setHours(0,0,0,0);
    dayThree.setHours(0, 0, 0, 0);
    
    dayOne = dayOne.toString();
    dayTwo = dayTwo.toString();
    dayThree = dayThree.toString();
      
    if (today === dayOne || today === dayTwo || today === dayThree)
        createSlides((teacherData[i-1][2]), (teacherData[i-1][3]));
  }
}

function nightTrigger()
{
 caller(); 
}

function afternoonTrigger() // this is the 3:30PM trigger.
{
  clearSlides();
  //caller();
}

function morningTrigger() // this is the 8:00AM trigger.
{
   addTeacherSlides();
}

function trigger()
{
ScriptApp.newTrigger('afternoonTrigger')
      .timeBased()
      .everyDays(1)
      .atHour(15)
      .nearMinute(31)
      .create();
ScriptApp.newTrigger('morningTrigger')
      .timeBased()
      .everyDays(1)
      .atHour(8)
      .nearMinute(00)
      .create();
}

function createNightTrigger()
{
ScriptApp.newTrigger('nightTrigger')
      .timeBased()
      .everyDays(1)
      .atHour(21)
      .nearMinute(00)
      .create();
}
