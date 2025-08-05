const axios = require('axios');

const GRAPH_URL = 'https://graph.facebook.com/v19.0';

async function getMe(accessToken) {
  const res = await axios.get(`${GRAPH_URL}/me`, {
    params: { access_token: accessToken }
  });
  return res.data;
}

async function getAdAccounts(accessToken) {
  const res = await axios.get(`${GRAPH_URL}/me/adaccounts`, {
    params: {
      access_token: accessToken,
      fields: 'id,name,account_status,business,currency,timezone_name'
    }
  });
  return res.data.data;
}

module.exports = {
  getMe,
  getAdAccounts
};
