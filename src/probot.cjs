const { TableClient } = require("@winglang/sdk/lib/shared-aws/table.inflight.js");

const getTableDetails = (name) => {
	let tableName;
	let columns;
	let pk;
	for (const env in process.env) {
		if (process.env[env].startsWith(name)) {
			tableName = process.env[env];
			columns = process.env[Object.keys(process.env).find(e => e.startsWith(env) && e.endsWith("COLUMNS"))];
			pk = process.env[Object.keys(process.env).find(e => e.startsWith(env) && e.endsWith("PRIMARY_KEY"))];
		}
	}
	return { tableName, columns, pk }
};

module.exports.insert = async (email, githubId, tableName) => {
	const table = getTableDetails(tableName);
	client = new TableClient(table.tableName, table.pk, table.columns);
	await client.insert(email, {
			pk: githubId,
			userId: email,
			githubId
	})
	console.log('row inserted');
};

module.exports.get = async (email, tableName) => {
	const table = getTableDetails(tableName);
	client = new TableClient(table.tableName, table.pk, table.columns);
	const row = await client.get(email);
	console.log('row fetched', row);
};
