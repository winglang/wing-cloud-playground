bring cloud;
bring ex;

class Probot {  
    extern "./probot.cjs" static inflight handler(appId: str, privateKey: str, request: cloud.ApiRequest): void;
}

let api = new cloud.Api();

let probotAppId =  new cloud.Secret(name: "wing.cloud/probot/app_id") as "probotAppId";
let probotSecretKey = new cloud.Secret(name: "wing.cloud/probot/secret_key") as "probotSecretKey";

let db = new ex.Table(ex.TableProps{
    name: "wing.cloud/probot/db",
    primaryKey: "repositoryId",
    columns: {
        repositoryId: ex.ColumnType.STRING,
        entryPoints: ex.ColumnType.STRING,
    }
});

api.post("/github/webhook", inflight (request: cloud.ApiRequest): cloud.ApiResponse => {
    let body = Json.tryParse(request.body);
    let repoId = "${body?.tryGet("repository")?.tryGet("id")}";
    
    if repoId == "" {
        return cloud.ApiResponse {
            status: 400,
            body: Json.stringify({ ok: false, error: "Invalid request body" })
        };
    }

    Probot.handler(probotAppId.value(), probotSecretKey.value(), request);
    return cloud.ApiResponse {
        status: 200,
        body: Json.stringify({ ok: true })
    };

    return cloud.ApiResponse {
        status: 200,
        body: Json.stringify({ ok: true , data: "No project found"})
    };   
});
