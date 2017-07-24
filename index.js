const util = require('util');
const language = require('@google-cloud/language')({
    projectId: 'gocloud-pl-internal',
    keyFilename: 'GoCloud-PL-Internal-1eb978b74aaf.json'
});
const bigquery = require('@google-cloud/bigquery')();
const datasetName = 'Messages';
const tableName = 'Messages';

exports.sms = function (req, res) {
  console.log('Message received from Twilio; payload: ' + req.body.Body);
  var document = language.document(req.body.Body);
  document.detectSentiment(function(err, sentiment) {
    if (err) {
      result = 'Error in language processing';
      console.log(result + ": " + JSON.stringify(err, null, 2));
      res.status(200).send('<Response><Message>' + result + '</Message></Response>');
    } else {
      var row = {
        message_text: req.body.Body,
        sentiment: sentiment
      };
      const table = bigquery.dataset(datasetName).table(tableName);
      result = (sentiment >= 50) ? 'Positive' : 'Negative';
      try {
        table.insert(row, function(err, apiResponse) {
        if (err) {
          result = 'Error inserting data to bigquery';
          console.log(result + ": " + JSON.stringify(err, null, 2));
        } else {
          console.log("Sentiment: " + sentiment);
        }
        res.status(200).send('<Response><Message>' + result + '</Message></Response>');
      });
      } catch (ex) {
        console.log("Exception: : " + ex);
      }
    }
  });
}
