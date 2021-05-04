require('isomorphic-fetch');

const cowinHost = "https://cdn-api.co-vin.in";

async function checkForOpenSlots(districtId) {
  const tomorrow = getTomorrow();
  const response = await fetch(`${cowinHost}/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${districtId}&date=${tomorrow}`);
  if (response.status !== 200) {
      return console.error("API not responding");
  }
  const data = await response.json();
  return getAvailableCenters(data.centers);
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
    const sessions = center.sessions.filter(session => session.available_capacity > 0 && session.min_age_limit == 45);
    return {...center, sessions};
  })
  .filter(center => center.sessions.length > 0);
}
