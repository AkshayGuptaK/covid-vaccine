'use strict';

require('isomorphic-fetch');
const nodemailer = require('nodemailer');
const fs = require('fs');

const cowinHost = "https://cdn-api.co-vin.in";

const config = JSON.parse(fs.readFileSync('src/config.json'));

const emailer = nodemailer.createTransport({
  service: config.email.service,
  auth: {
    user: config.email.user,
    pass: config.email.password
  }
});

async function main() {
  const centers = await getCenters(config.districtId);
  if (centers && centers.length > 0) {
    sendNotificationEmail(JSON.stringify(centers));
  }
}

async function getCenters(districtId) {
  const tomorrow = getTomorrow();
  const response = await fetch(`${cowinHost}/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${districtId}&date=${tomorrow}`);
  if (response.status !== 200) {
      return console.error("API not responding");
  }
  const data = await response.json();
  return getAvailableCenters(data.centers);
}

function sendNotificationEmail(emailContent) {
  const mailOptions = {
    from: config.email.user,
    to: config.email.recipients,
    subject: 'Covid Vaccination Center Available',
    text: emailContent
  };
        
  emailer.sendMail(mailOptions, function(error, info){
    if (error) {
      console.error(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}
  
function getTomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function getAvailableCenters(centers) {
  return centers.map(center => {
    const sessions = center.sessions.filter(session => session.available_capacity > 0 && session.min_age_limit <= config.age);
    return {...center, sessions};
  })
  .filter(center => center.sessions.length > 0);
}

main();
