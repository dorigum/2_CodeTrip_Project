require('dotenv').config();

const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'codetrip_secret_key';
const TRAVEL_API_BASE = 'https://apis.data.go.kr/B551011/KorService2';
const TRAVEL_SERVICE_KEY = decodeURIComponent(process.env.TRAVEL_INFO_API_KEY || '');

module.exports = {
  PORT,
  JWT_SECRET,
  TRAVEL_API_BASE,
  TRAVEL_SERVICE_KEY,
};
