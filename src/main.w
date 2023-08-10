bring cloud;

class Probot {  
    extern "./probot.cjs" static inflight handler(appId: str, privateKey: str, request: cloud.ApiRequest): void;
}

let api = new cloud.Api();

let probotAppId = "372675";
let probotSecretKey = new cloud.Secret(name: "wing.cloud/probot/secret_key");
api.post("/", inflight (request: cloud.ApiRequest): cloud.ApiResponse => {
    Probot.handler(probotAppId, probotSecretKey.value(), request);

    return cloud.ApiResponse {
        status: 200,
        body: Json.stringify({ ok: true })
    };
});
