const axios = require("axios");

async function checkProxy({ ip, port, username, password }) {
  try {
    const res = await axios.get("https://httpbin.org/ip", {
      proxy: {
        host: ip,
        port: Number(port),
        auth: { username, password }
      }
    });

    console.log(res);

    return res.status === 200 ? "ALIVE" : "DEAD";
  } catch (err) {
    return "DEAD";
  }
}

exports.checkProxy = checkProxy