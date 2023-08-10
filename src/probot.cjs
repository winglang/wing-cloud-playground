/**
 * @param {import("probot").Probot} app
 */
const appFn = async (app) => {
	app.on("issues.opened", async (context) => {
		const issueComment = context.issue({
			body: "Thanks for opening this issue!",
		});
		await context.github.issues.createComment(issueComment);
	});
};

const {
	createLambdaFunction,
	createProbot,
} = require("@probot/adapter-aws-lambda-serverless");

let webhooks;
module.exports.handler = async (appId, privateKey, event) => {
	webhooks ??= createLambdaFunction(appFn, {
		probot: createProbot({
			overrides: {
				appId,
				privateKey,
			},
		}),
	});

	return webhooks(event);
};
