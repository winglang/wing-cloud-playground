bring cloud;

struct GithubId {
    id: str;
}
let githubIdFromStr = inflight (id: str): GithubId => {
    return GithubId {
        id: id
    };
};

struct UserId {
    id: str;
}

bring util;
let userIdFromStr = inflight (id: str): UserId => {
    return UserId {
        id: id
    };
};
let createUserId = inflight (): UserId => {
    return UserId {
        id: util.nanoid()
    };
};

struct Email {
    address: str;
}
let emailFromStr = inflight (address: str): Email => {
    return Email {
        address: address
    };
};

// struct User {
//     userId: UserId;
//     email: Email;
//     githubId: GithubId;
// }

bring ex;

class Users {
    userInfo: ex.Table;
    byEmail: ex.Table;
    byGithubId: ex.Table;

    init() {
        this.userInfo = new ex.Table(name: "userInfo", primaryKey: "userId", columns: {
            userId: ex.ColumnType.STRING,
            email: ex.ColumnType.STRING,
            githubId: ex.ColumnType.STRING,
        }) as "userInfo";
        this.byEmail = new ex.Table(name: "byEmail", primaryKey: "email", columns: {
            email: ex.ColumnType.STRING,
            userId: ex.ColumnType.STRING,
        }) as "byEmail";
        this.byGithubId = new ex.Table(name: "byGithubId", primaryKey: "githubId", columns: {
            githubId: ex.ColumnType.STRING,
            userId: ex.ColumnType.STRING,
        }) as "byGithubId";
    }

    inflight createUser(email: Email, githubId: GithubId): Json {
        let userId = createUserId();
        this.byEmail.insert(email.address, {
            email: email.address,
            userId: userId.id,
        });
        try {
            this.byGithubId.insert(githubId.id, {
                githubId: githubId.id,
                userId: userId.id,
            });
            try {
                this.userInfo.insert(userId.id, {
                    userId: userId.id,
                    email: email.address,
                    githubId: githubId.id,
                });
            } catch error {
                this.byGithubId.delete(githubId.id);
                throw(error);
            }
        } catch error {
            this.byEmail.delete(email.address);
            throw(error);
        }
        return Json {
            userId: userId,
            email: email,
            githubId: githubId,
        };
    }
}

let users = new Users();

new cloud.Function(inflight (): Json => {
    let email = emailFromStr("a@a.a");
    let githubId = githubIdFromStr("12");
    return users.createUser(email, githubId);
}) as "CreateUser";
