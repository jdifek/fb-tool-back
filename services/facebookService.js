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

async function requestGraph(token, proxy, path, params = {}, method = "get") {
  const cookies = buildCookies(token.cookies);
  const agent = buildAgent(proxy);

  const res = await axios(`${GRAPH_URL}${path}`, {
    method,
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

async function getComments(multiToken, proxy, postId) {
  const token = decodeBase64ToJson(multiToken);
  return requestGraph(token, proxy, `/${postId}/comments`, {
    fields: 'id,from,message,created_time'
  });
}

async function deleteComment(multiToken, proxy, commentId) {
  const token = decodeBase64ToJson(multiToken);

  return requestGraph(token, proxy, `/${commentId}`, null, "delete");
}

async function hideComment(multiToken, proxy, commentId) {
  const token = decodeBase64ToJson(multiToken);

  // PAGE TOKEN
  const pageToken = "EAABsbCS1iHgBPy3bdthCcvcus03CiUuiptdOpWglOqiim4cz8vFvV6MEZClVP4ILLYIV6o81xRaZCwLoh2LP5wl4KqCHsWcgOWjeZCEPVilpIc5sui96EAIXPeLT00HZBeZAYtx3lFeJJs8LIIuPz0hEgNwMqZBz4hWA5zKiiBt2sd6ZBR4vFqUY0uFMtpcKQrZBxvZAhrEXwv7ZCuhoRE1TmI48f9FwZDZD"

  return requestGraph({ ...token, token: pageToken }, proxy, `/${commentId}`, {
    is_hidden: true
  }, "post");
}


module.exports = {
  getMe,
  getAdAccounts,
  getComments,
  deleteComment,
  hideComment
};
