const axios = require('axios');
const { SocksProxyAgent } = require('socks-proxy-agent');
const { decodeBase64ToJson } = require("../utils/decodeToken");

const GRAPH_URL = 'https://graph.facebook.com/v19.0';

function buildCookies(cookieArray) {
  return cookieArray.map(c => `${c.name}=${c.value}`).join('; ');
}

function buildAgent(proxy) {
  const proxyUrl = `socks5://${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`;
  return new SocksProxyAgent(proxyUrl);
}

async function requestGraph(token, proxy, path, params = {}) {
  const cookies = buildCookies(token.cookies);
  const agent = buildAgent(proxy);

  const res = await axios.get(`${GRAPH_URL}${path}`, {
    httpAgent: agent,
    httpsAgent: agent,
    proxy: false,
    params,
    headers: {
      Authorization: `Bearer ${token.token}`,
      'User-Agent': token.ua,
      Cookie: cookies,
      Accept: 'application/json'
    }
  });

  return res.data;
}

async function getMe(multiToken, proxy) {
  const token = decodeBase64ToJson(multiToken);
  return requestGraph(token, proxy, '/me');
}

async function getAdAccounts(multiToken, proxy) {
  const token = decodeBase64ToJson(multiToken);
  return requestGraph(token, proxy, '/me/adaccounts', {
    fields: 'id,name,account_status,business,currency,timezone_name'
  });
}

module.exports = {
  getMe,
  getAdAccounts
};
