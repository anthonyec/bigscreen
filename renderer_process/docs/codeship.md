1. Log-in to codeship. You log-in with bibucket.
2. Create new project. Make sure that you're creating new project within signalnoise team. Cause you might be logged-in with your personal account by default.
3. Connect your repository (e.g. https://bitbucket.org/signalnoise/16058_drax_quarterly_client)
4. In Configure Your Tests, select node.js, change node version

```
nvm install 6.7.0
npm install
```

5. In Configure Test Pipelines, enter:

```
npm test
npm run lint
```

6. Go to project settings and click Notifications

7. In the Slack section, click the Codeship integration link to get url you can
paste into the Webhook URL input. (e.g. https://hooks.slack.com/services/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)

7. Add text from Copy Markdown syntax into project readme
