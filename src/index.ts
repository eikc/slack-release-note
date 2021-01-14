import {getInput, setFailed} from '@actions/core';
import {getOctokit, context} from '@actions/github';
import {WebClient} from '@slack/web-api'

const run = async () => {
    const token = getInput('github-token', {required: true});
    const slackToken = getInput('slack_token', {required: true});
    const channel = getInput('slack_channel', {required: true});

    const github = getOctokit(token);
    const slack = new WebClient(slackToken);

    if (context.payload.pull_request && context.payload.pull_request.number) {
        const currentPR = await github.pulls.get({
            owner: context.repo.owner,
            repo: context.repo.repo,
            pull_number: context.payload.pull_request?.number!
        })

        console.log(JSON.stringify(currentPR, null, 2))
        await slack.chat.postMessage({
            text: 'new release ',
            attachments: [
                {
                    title: currentPR.data.title,
                    text: currentPR.data.body!,
                    footer: `developed by ${currentPR.data.user?.login!}`
                }
            ],
            channel: channel,
        })
    } else {
        console.log('no pull request found');
    }

}

run().catch(setFailed)
