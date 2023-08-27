bring cloud;
bring util;
bring ex;

class Utils {
    extern "./probot.cjs" static inflight insert(email: str, githubId: str, tableName: str): void;
    extern "./probot.cjs" static inflight get(email: str, tableName: str): void;
}

class Users {
    table: ex.Table;

    init() {
        this.table = new ex.Table(name: "users", primaryKey: "userId", columns: {
            pk: ex.ColumnType.STRING,
            userId: ex.ColumnType.STRING,
            email: ex.ColumnType.STRING,
            githubId: ex.ColumnType.STRING,
        });
    }
}

let users = new Users();

test "CreateUser" {
    // for permissions
    users.table.insert;
    users.table.get;

    Utils.insert("a@a.a", "12", users.table.name);
    Utils.get("a@a.a", users.table.name);
}
