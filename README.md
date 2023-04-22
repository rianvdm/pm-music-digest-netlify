# Music mini-site using Netlify + Last.fm + Discogs + YouTube
This site shows what you're listening to on [Last.fm](https://last.fm), as well as some collection information from [Discogs](https://discogs.com). It makes use of Netlify’s [serverless functions](https://docs.netlify.com/functions/overview/). It also searches YouTube and embeds a video of the latest track. You'll need API keys from Last.fm, Discogs, and YouTube to make it work.

The front-end HTML, CSS, and javascript inside of the `public` directory are all vanilla. No fancy frameworks here, so feel free to integrate this into whatever frameworks you’re comfortable with.

## Instructions

Follow these steps to deploy your site to Netlify and get this up and running on your local dev environment.

### Requirements
- [Node.js 16+](https://nodejs.org/en/download)
- [Netlify account](https://netlify.com) - Ensure that you've installed the [Netlify CLI](https://docs.netlify.com/cli/get-started/)
- [Last.fm account](https://last.fm) - Ensure that you’ve been listening to some sweet tunes 🎶. [Phil Collins - In the air tonight](https://www.last.fm/music/Phil+Collins/_/In+The+Air+Tonight+-+2015+Remastered) is highly recommended cause it'll give you the strength to get through your day.
- [Discogs account](https://discogs.com)


### Deploy site
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/rianvdm/pm-music-digest-netlify)

1. Deploy your site to Netlify using the big 🔵blue button above
1. Go to `Site settings` from the top menu
1. Go to `Environment variables` from the menu on the left
1. Add a single environment variable with these key names. Ensure that `All scopes` and `Same value for all deploy contexts` are selected.
    1.  `LAST_FM_API_TOKEN` - Enter your Last.fm API token as the value
    1.  `YOUTUBE_API_TOKEN` - Enter your YouTube API token as the value
    1.  `DISCOGS_API_TOKEN` - Enter your Discogs API token as the value (if you don't want to use Discogs, just delete the `Recent purchases` section from `index.html`)
1. Make sure you change `lastFMUser` in the all the functions to your username
1. Oh, also change the footer text in `index.html`
1. Now let's trigger a deploy so that your site will load the new environment variables. Go to `Deploys` from the top menu
1. Then `Trigger deploy` -> `Deploy site`
1. Once the deployment is finished, select the `Preview` button. You should see that all of the recent tracks are loaded.

### Set up your local dev environment

1. When you deployed your site to Netlify, it should have created a repository on your Github account. From Netlify, navigate to the `Site overview` page and then it should say `Deploys from Github`. Select that link to view the repo.
1. Clone the git repository on your local system. Select the big 🟢green `Code` button to see how.
1. Open the terminal and navigate to your website: `cd ~/your-site`
1. `npm install`
1. `netlify link` and select `Use current git remote origin` - Links this folder to your Netlify website so that it loads your environment variables locally and you can deploy. Once finished it should show you the admin and site URL.
1. `netlify dev` - This will start your local dev server and your site will be accessible at [localhost:8888](http://localhost:8888)
 
You're all set! You can now make edits to the site. Run `netlify deploy --prod` to deploy your site from this folder.

## Helpful thingys
- `netlify build` - Build your site locally to make sure that you don’t run into any snags during deployment
- `netlify deploy` - Deploys a private staging instance of the site so that you can preview your changes. Add the `--prod` flag to deploy to production.
- By default Netlify uses your environment variables for Last.fm and Discogs from your Netlify config. If you'd prefer to override these locally, rename `.env.example` to `.env` and update your tokens. Be sure not to commit the `.env` file to your repo.


