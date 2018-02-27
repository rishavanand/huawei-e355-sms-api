const sms = require('./sms.js');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/',function(req,res){
	res.send('Huawei E35 unofficial API');
});

app.get('/getsms/:pageNo',function(req,res){
	sms.checkAvailability()
	.then(function(){
		return sms.checkLogin();
	})
	.then(function(data){
		return sms.readSMS(req.params.pageNo);
	})
	.then(function(data){
		data.response.Messages[0].success = true;
		res.json(data.response.Messages[0]);
	})
	.catch(function(err){
		res.json({
			success: false,
			message: err
		})
	})
});

app.listen(3000, function(){
	console.log('Server started on port 3000');
});