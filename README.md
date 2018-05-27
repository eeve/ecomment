# ecomment


[![NPM version][npm-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/ecomment.svg
[npm-url]: https://www.npmjs.com/package/ecomment

ecomment is a comment system based on GitHub Issues,
which can be used in the frontend without any server-side implementation.

[Demo Page](https://imsun.github.io/ecomment/)

[中文简介](https://imsun.net/posts/ecomment-introduction/)

- [Features](#features)
- [Get Started](#get-started)
- [Methods](#methods)
- [Customize](#customize)
- [About Security](#about-security)

## Features

- GitHub Login
- Markdown / GFM support
- Syntax highlighting
- Notifications from GitHub
- Easy to customize
- No server-side implementation

## Get Started

### 1. Install

```html
<link rel="stylesheet" href="https://imsun.github.io/ecomment/style/default.css">
```

```html
<script src="https://imsun.github.io/ecomment/dist/ecomment.browser.js"></script>
```

or via npm:

```sh
$ npm i --save ecomment
```

```javascript
import 'ecomment/style/default.css'
import ecomment from 'ecomment'
```

### 2. Register An OAuth Application

[Click here](https://github.com/settings/applications/new) to register an OAuth application, and you will get a client ID and a client secret.

Make sure the callback URL is right. Generally it's the origin of your site, like [https://imsun.net](https://imsun.net).

### 3. Render ecomment

```javascript
const ecomment = new ecomment({
  id: 'Your page ID', // optional
  owner: 'Your GitHub ID',
  repo: 'The repo to store comments',
  oauth: {
    client_id: 'Your client ID',
    client_secret: 'Your client secret',
  },
  // ...
  // For more available options, check out the documentation below
})

ecomment.render('comments')
// or
// ecomment.render(document.getElementById('comments'))
// or
// document.body.appendChild(ecomment.render())
```

### 4. Initialize Your Comments

After the page is published, you should visit your page, login with your GitHub account(make sure you're repo's owner), and click the initialize button, to create a related issue in your repo.
After that, others can leave their comments.
   
## Methods

### constructor(options)

#### options:

Type: `object` 

- owner: Your GitHub ID. Required.
- repo: The repository to store your comments. Make sure you're repo's owner. Required.
- oauth: An object contains your client ID and client secret. Required.
    - client_id: GitHub client ID. Required.
    - client_secret: GitHub client secret. Required.
- id: An optional string to identify your page. Default `location.href`.
- title: An optional title for your page, used as issue's title. Default `document.title`.
- link: An optional link for your page, used in issue's body. Default `location.href`.
- desc: An optional description for your page, used in issue's body. Default `''`.
- labels: An optional array of labels your want to add when creating the issue. Default `[]`.
- theme: An optional ecomment theme object. Default `ecomment.defaultTheme`.
- perPage: An optional number to which comments will be paginated. Default `20`.
- maxCommentHeight: An optional number to limit comments' max height, over which comments will be folded. Default `250`.

### ecomment.render([element])

#### element

Type: `HTMLElement` or `string`

The DOM element to which comments will be rendered. Can be an HTML element or element's id. When omitted, this function will create a new `div` element.

This function returns the element to which comments be rendered.

### ecomment.renderHeader([element])

Same like `ecomment.render([element])`. But only renders the header.

### ecomment.renderComments([element])

Same like `ecomment.render([element])`. But only renders comments list.


### ecomment.renderEditor([element])

Same like `ecomment.render([element])`. But only renders the editor.


### ecomment.renderFooter([element])

Same like `ecomment.render([element])`. But only renders the footer.

### ecomment.init()

Initialize a new page. Returns a `Promise` and resolves when initialized.

### ecomment.update()

Update data and views. Returns a `Promise` and resolves when data updated. 

### ecomment.post()

Post comment in the editor. Returns a `Promise` and resolves when posted.

### ecomment.markdown(text)

#### text

Type: `string`

Returns a `Promise` and resolves rendered text.

### ecomment.login()

Jump to GitHub OAuth page to login.

### ecomment.logout()

Log out current user.

### goto(page)

#### page

Type: `number`

Jump to the target page of comments. Notice that `page` starts from `1`. Returns a `Promise` and resolves when comments loaded.

### ecomment.like()

Like current page. Returns a `Promise` and resolves when liked.

### ecomment.unlike()

Unlike current page. Returns a `Promise` and resolves when unliked.

### ecomment.likeAComment(commentId)

#### commentId

Type: `string`

Like a comment. Returns a `Promise` and resolves when liked.

### ecomment.unlikeAComment(commentId)

#### commentId

Type: `string`

Unlike a comment. Returns a `Promise` and resolves when unliked.

## Customize

ecomment is easy to customize. You can use your own CSS or write a theme.
(The difference is that customized CSS can't modify DOM structure)

### Use Customized CSS

ecomment does't use any atomic CSS, making it easier and more flexible to customize.
You can inspect the DOM structure in the browser and write your own styles.

### Write A Theme

A ecomment theme is an object contains several render functions.
 
By default ecomment has five render functions: `render`, `renderHeader`, `renderComments`, `renderEditor`, `renderFooter`.
The last four render independent components and `render` functions render them together.
All of them can be used independently.

You can override any render function above or write your own render function.

For example, you can override the `render` function to put an editor before the comment list, and render a new component.

```javascript
const myTheme = {
  render(state, instance) {
    const container = document.createElement('div')
    container.className = 'ecomment-container ecomment-root-container'
    
     // your custom component
    container.appendChild(instance.renderSomething(state, instance))
    
    container.appendChild(instance.renderHeader(state, instance))
    container.appendChild(instance.renderEditor(state, instance))
    container.appendChild(instance.renderComments(state, instance))
    container.appendChild(instance.renderFooter(state, instance))
    return container
  },
  renderSomething(state, instance) {
    const container = document.createElement('div')
    if (state.user.login) {
      container.innerText = `Hello, ${state.user.login}`
    }
    return container
  }
}

const ecomment = new ecomment({
  // ...
  theme: myTheme,
})

ecomment.render(document.body)
// or
// ecomment.renderSomthing(document.body)
```

Each render function should receive a state object and a ecomment instance, and return an HTML element.
It will be wrapped attached to the ecomment instance with the same name.

ecomment uses [MobX](https://github.com/mobxjs/mobx) to detect states used in render functions.
Once used states change, ecomment will call the render function to get a new element and render it.
Unused states' changing won't affect rendered elements.

Available states:

- user: `object`. User info returned from [GitHub Users API](https://developer.github.com/v3/users/#get-the-authenticated-user) with two more keys.
    - isLoggingIn: `bool`. Indicates if user is logging in.
    - fromCache: `bool`. ecomment will cache user's information. Its value indicates if current user info is from cache.
- error: `Error Object`. Will be null if no error occurs.
- meta: `object`. Issue's info returned from [GitHub Issues API](https://developer.github.com/v3/issues/#list-issues).
- comments: `array`. Array of comment returned from [GitHub Issue Comments API](/repos/:owner/:repo/issues/:number/comments). Will be `undefined` when comments not loaded.
- reactions: `array`. Array of reactions added to current page, returned from [GitHub Issues' Reactions API](https://developer.github.com/v3/reactions/#list-reactions-for-an-issue).
- commentReactions: `object`. Object of reactions added to comments, with comment ID as key, returned from [GitHub Issue Comments' Reactions API](/repos/:owner/:repo/issues/comments/:id/reactions).
- currentPage: `number`. Which page of comments is user on. Starts from `1`.

## About Security

### Is it safe to make my client secret public?

Client secret is necessary for OAuth, without which users can't login or comment with their GitHub accounts.
Although GitHub does't recommend to hard code client secret in the frontend, you can still do that because GitHub will verify your callback URL. 
In theory, no one else can use your secret except your site.

If you find a way to hack it, please [open an issue](https://github.com/imsun/ecomment/issues/new).

### Why does ecomment send a request to https://proxy.oauth.eeve.me?

[https://proxy.oauth.eeve.me](https://proxy.oauth.eeve.me) is an simple open-source service to proxy [one request](https://developer.github.com/v3/oauth/#2-github-redirects-back-to-your-site) during users logging in.
Because GitHub doesn't attach a CORS header to it.

This service won't record or store anything. It only attaches a CORS header to that request and provides proxy.
So that users can login in the frontend without any server-side implementation.

For more details, checkout [this project](https://github.com/eeve/proxy.oauth).
