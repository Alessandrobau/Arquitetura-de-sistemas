import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "1m", target: 50 },
    { duration: "1m", target: 100 },
    { duration: "1m", target: 200 },
    { duration: "1m", target: 500 },
    { duration: "1m", target: 800 },
    { duration: "1m", target: 1000 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
  },
};

export default function () {
  const url = "http://192.168.3.102:3002/orders/68db277874b2fffa9e125d8e";
  
  const params = {
    headers: { "Content-Type": "application/json" },
  };

  const res = http.get(url, null, params);

  check(res, {
    "status 200": (r) => r.status === 200,
  });

  sleep(1);
}
