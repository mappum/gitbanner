gitbanner
=========

Generates a git repo to show a cool banner on your Github profile.
[![Hello, world](http://i.imgur.com/c7GmAJf.png)](https://github.com/mappum)

Gitbanner works by creating a new git repository and filling it with dummy commits, with dates set to correspond to the pixels on your Github "Contributions" graph.

You can see an example on my profile: [https://github.com/mappum](https://github.com/mappum)

## Installing

First, you might need to install some dependencies:

* [node-canvas](https://github.com/LearnBoost/node-canvas/wiki) - (Cairo)
* [nodegit](https://github.com/nodegit/nodegit)

Once those are set up, just do

`npm install -g gitbanner`

## Usage

**1.** Generate your repo:

`gitbanner <Github email> <text>`

**NOTICE:** Gitbanner needs the email associated with your Github account, otherwise Github won't think you made the commits.

You will see a preview of your banner. If it doesn't look too great, try using a different font:

`gitbanner -f "7pt Arial" <email> <text>`

**2.** Create a repo on Github.

**3.** Push the repo to Github:

```bash
cd banner
git push -f git@github.com:USERNAME/REPO_NAME.git master
```

## Notes

If you ever feel like removing the banner from your profile, you can simply delete the repository. Github will instantly update your Contributions graph.

If you want, you can specify a longer banner width (`gitbanner -w X ...`). Any width longer than 52 will be cut off on Github, but the banner will be slowly revealed as the weeks go by.
