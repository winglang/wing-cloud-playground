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
    table: ex.Table;

    init() {
        this.table = new ex.Table(name: "table", primaryKey: "userId", columns: {
            pk: ex.ColumnType.STRING,
            userId: ex.ColumnType.STRING,
            email: ex.ColumnType.STRING,
            githubId: ex.ColumnType.STRING,
        });
    }

    inflight createUser(email: Email, githubId: GithubId): Json {
        let userId = createUserId();
        let userIdPk = "userId#${userId.id}";
        let emailPk = "email#${email.address}";
        let githubIdPk = "githubId#${githubId.id}";
        this.table.insert(emailPk, {
            pk: emailPk,
            userId: userId.id,
        });
        try {
            this.table.insert(githubIdPk, {
                pk: githubIdPk,
                userId: userId.id,
            });
            try {
                this.table.insert(userIdPk, {
                    pk: userIdPk,
                    email: email.address,
                    githubId: githubId.id,
                });
            } catch error {
                this.table.delete(emailPk);
                throw(error);
            }
        } catch error {
            this.table.delete(emailPk);
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
