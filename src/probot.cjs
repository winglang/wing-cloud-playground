/**
 * @param {import("probot").Probot} app
 */

const APP_USER = "wingcloudtest[bot]";

const removeExistingComment = async (context) => {
	const comments = await context.octokit.issues.listComments(context.issue());
	for (const comment of comments.data) {
		if (comment.user.login === APP_USER) {
			await context.octokit.issues.deleteComment({
				owner: context.repo().owner,
				repo: context.repo().repo,
				comment_id: comment.id,
			});
		}
	}
};

const createPullRequestComment = async (context) => {
	const repo = context.payload.repository.name;
	const branch = context.payload.pull_request.head.ref;
	const previewLink = `https://wing.cloud/org/${repo}/${branch}`;

	const entryPoint = "main.w";
	const status = "✅ Ready";
	const tests = [
		"✅ [sanity](https://wing.cloud/org/repo/branch/logs/tests/sanity)",
		"✅ [E2E](https://wing.cloud/org/repo/branch/logs/tests/E2E)",
	];

	const entryPoints = [
		{
			name: entryPoint,
			status: status,
			previewLink: previewLink,
			tests: tests,
			updated: new Date().toUTCString(),
		},
	];

	const tableRows = entryPoints.map((entry) => {
		return `| ${entry.name} | ${
			entry.status
		} ([logs](${previewLink}/logs/build/)) | [Visit Preview](${
			entry.previewLink
		}) | ${entry.tests.join("<br>")} | ${entry.updated} |`;
	});

	const commentBody = `
| Entry Point     | Status | Preview | Tests | Updated (UTC) |
| --------------- | ------ | ------- | ----- | -------------- |
${tableRows.join("\n")}
`;

	const params = context.issue({ body: commentBody });
	await removeExistingComment(context);
	await context.octokit.issues.createComment(params);
};

const appFn = async (app) => {
	app.on("issues.opened", async (context) => {
		const issueComment = context.issue({
			body: "Thanks for opening this issue!",
		});
		return context.octokit.issues.createComment(issueComment);
	});

	app.on("pull_request.opened", async (context) => {
		return createPullRequestComment(context);
	});

	app.on("pull_request.edited", async (context) => {
		return createPullRequestComment(context);
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
