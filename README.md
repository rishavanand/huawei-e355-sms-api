# Huawei E355 SMS API
This is an unofficial api for huawei that lets you read and send sms through your e355 modem. 

### Getting Started
1. Clone this repo
2. Connect your e355 modem
3. Note the ip address of your modem
4. Note the admin login detials
5. Add values for `MODEM_USER` and `MODEM_PASS` in `config.js`

### Reading SMS
* **Request Method :** GET
* **URL :** htp://localhost:3000/getsms/[pageNo]
* **[pageNo] :** is for getting the sms from a particular page. (a single page contains 50 sms). So for first 50 sms pageNo = 1, from next 50 pageNo = 2 and so on.

### Sending SMS
* **Request Method :** POST
* **URL :** htp://localhost:3000/sendsms
* **Form data :** mob=+91xxxxxxxxxx&message=Hello,World!

### Built With

* [NodeJS](https://nodejs.org/en/docs/)
