import { github as githubIcon, heart as heartIcon, spinner as spinnerIcon } from '../icons'
import { NOT_INITIALIZED_ERROR } from '../constants'
import timeago from 'timeago.js'

const tai = timeago()

function renderHeader({ meta, user, reactions }, instance) {
  const container = document.createElement('div')
  container.className = 'ecomment-container ecomment-header-container'

  const likeButton = document.createElement('span')
  const likedReaction = reactions.find(reaction => (
    reaction.content === 'heart' && reaction.user.login === user.login
  ))
  likeButton.className = 'ecomment-header-like-btn'
  likeButton.innerHTML = `
    ${ heartIcon }
    ${ likedReaction ? '取消' : '喜欢' }
  `

  if (likedReaction) {
    likeButton.classList.add('liked')
    likeButton.onclick = () => instance.unlike()
  } else {
    likeButton.classList.remove('liked')
    likeButton.onclick = () => instance.like()
  }
  container.appendChild(likeButton)

  const commentsCount = document.createElement('span')
  commentsCount.innerHTML = `${ meta.reactions && meta.reactions.heart
    ? ` • <strong>${meta.reactions.heart}</strong> 人喜欢`
    : ''
  }`
  container.appendChild(commentsCount)

  if (instance.state.error === null) {
    const issueLink = document.createElement('a')
    issueLink.className = 'ecomment-header-issue-link'
    issueLink.href = meta.html_url
    issueLink.target = '_blank'
    // issueLink.innerText = 'Issue 页面'
    issueLink.innerHTML = `${ meta.comments
      ? `共 <strong>${meta.comments}</strong> 条评论`
      : ''
    }`
    container.appendChild(issueLink)
  }

  return container
}

function renderComments({ meta, comments, commentReactions, currentPage, user, error }, instance) {
  const container = document.createElement('div')
  container.className = 'ecomment-container ecomment-comments-container'

  if (error) {
    const errorBlock = document.createElement('div')
    errorBlock.className = 'ecomment-comments-error'

    if (error === NOT_INITIALIZED_ERROR
      && user.login
      && user.login.toLowerCase() === instance.owner.toLowerCase()) {
      const initHint = document.createElement('div')
      const initButton = document.createElement('button')
      initButton.className = 'ecomment-comments-init-btn'
      initButton.onclick = () => {
        initButton.setAttribute('disabled', true)
        instance.init()
          .catch(e => {
            initButton.removeAttribute('disabled')
            alert(e)
          })
      }
      initButton.innerText = '初始化评论系统'
      initHint.appendChild(initButton)
      errorBlock.appendChild(initHint)
    } else {
      errorBlock.innerText = error
    }
    container.appendChild(errorBlock)
    return container
  } else if (comments === undefined) {
    const loading = document.createElement('div')
    loading.innerText = '加载评论...'
    loading.className = 'ecomment-comments-loading'
    container.appendChild(loading)
    return container
  } else if (!comments.length) {
    const emptyBlock = document.createElement('div')
    emptyBlock.className = 'ecomment-comments-empty'
    emptyBlock.innerText = '尚无评论'
    container.appendChild(emptyBlock)
    return container
  }

  const commentsList = document.createElement('ul')
  commentsList.className = 'ecomment-comments-list'

  comments.forEach(comment => {
    const createDate = new Date(comment.created_at)
    const updateDate = new Date(comment.updated_at)
    const commentItem = document.createElement('li')
    commentItem.className = 'ecomment-comment'
    commentItem.innerHTML = `
      <a class="ecomment-comment-avatar" href="${comment.user.html_url}" target="_blank">
        <img class="ecomment-comment-avatar-img" src="${comment.user.avatar_url}"/>
      </a>
      <div class="ecomment-comment-main">
        <div class="ecomment-comment-header">
          <a class="ecomment-comment-name" href="${comment.user.html_url}" target="_blank">
            ${comment.user.login}
          </a>
          评论于
          <span title="${createDate}">${tai.format(createDate, 'zh_CN')}</span>
          ${ createDate.toString() !== updateDate.toString()
            ? ` • <span title="评论于 ${tai.format(updateDate, 'zh_CN')} 编辑过">编辑过</span>`
            : ''
          }
          <div class="ecomment-comment-like-btn">${heartIcon} ${comment.reactions.heart || ''}</div>
        </div>
        <div class="ecomment-comment-body ecomment-markdown">${comment.body_html}</div>
      </div>
    `
    const likeButton = commentItem.querySelector('.ecomment-comment-like-btn')
    const likedReaction = commentReactions[comment.id]
      && commentReactions[comment.id].find(reaction => (
        reaction.content === 'heart' && reaction.user.login === user.login
      ))
    if (likedReaction) {
      likeButton.classList.add('liked')
      likeButton.onclick = () => instance.unlikeAComment(comment.id)
    } else {
      likeButton.classList.remove('liked')
      likeButton.onclick = () => instance.likeAComment(comment.id)
    }

    // dirty
    // use a blank image to trigger height calculating when element rendered
    const imgTrigger = document.createElement('img')
    const markdownBody = commentItem.querySelector('.ecomment-comment-body')
    imgTrigger.className = 'ecomment-hidden'
    imgTrigger.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
    imgTrigger.onload = () => {
      if (markdownBody.clientHeight > instance.maxCommentHeight) {
        markdownBody.classList.add('ecomment-comment-body-folded')
        markdownBody.style.maxHeight = instance.maxCommentHeight + 'px'
        markdownBody.title = 'Click to Expand'
        markdownBody.onclick = () => {
          markdownBody.classList.remove('ecomment-comment-body-folded')
          markdownBody.style.maxHeight = ''
          markdownBody.title = ''
          markdownBody.onclick = null
        }
      }
    }
    commentItem.appendChild(imgTrigger)

    commentsList.appendChild(commentItem)
  })

  container.appendChild(commentsList)

  if (meta) {
    const pageCount = Math.ceil(meta.comments / instance.perPage)
    if (pageCount > 1) {
      const pagination = document.createElement('ul')
      pagination.className = 'ecomment-comments-pagination'

      if (currentPage > 1) {
        const previousButton = document.createElement('li')
        previousButton.className = 'ecomment-comments-page-item'
        previousButton.innerText = 'Previous'
        previousButton.onclick = () => instance.goto(currentPage - 1)
        pagination.appendChild(previousButton)
      }

      for (let i = 1; i <= pageCount; i++) {
        const pageItem = document.createElement('li')
        pageItem.className = 'ecomment-comments-page-item'
        pageItem.innerText = i
        pageItem.onclick = () => instance.goto(i)
        if (currentPage === i) pageItem.classList.add('ecomment-selected')
        pagination.appendChild(pageItem)
      }

      if (currentPage < pageCount) {
        const nextButton = document.createElement('li')
        nextButton.className = 'ecomment-comments-page-item'
        nextButton.innerText = 'Next'
        nextButton.onclick = () => instance.goto(currentPage + 1)
        pagination.appendChild(nextButton)
      }

      container.appendChild(pagination)
    }
  }

  return container
}

function renderEditor({ user, error }, instance) {
  const container = document.createElement('div')
  container.className = 'ecomment-container ecomment-editor-container'

  const shouldDisable = user.login && !error ? '' : 'disabled'
  const disabledTip = user.login ? '' : '登录后参与评论'
  container.innerHTML = `
      ${ user.login
        ? `<a class="ecomment-editor-avatar" href="${user.html_url}" target="_blank">
            <img class="ecomment-editor-avatar-img" src="${user.avatar_url}"/>
          </a>`
        : user.isLoggingIn
          ? `<div class="ecomment-editor-avatar">${spinnerIcon}</div>`
          : `<a class="ecomment-editor-avatar" href="${instance.loginLink}" title="login with GitHub">
              ${githubIcon}
            </a>`
      }
    </a>
    <div class="ecomment-editor-main">
      <div class="ecomment-editor-header">
        <nav class="ecomment-editor-tabs">
          <button class="ecomment-editor-tab ecomment-selected">写评论</button>
          <button class="ecomment-editor-tab">预览</button>
        </nav>
        <div class="ecomment-editor-login">
          ${ user.login
            ? '<a class="ecomment-editor-logout-link">登出</a>'
            : user.isLoggingIn
              ? '登录中...'
              : `用 GitHub <a class="ecomment-editor-login-link" href="${instance.loginLink}">登录</a>`
          }
        </div>
      </div>
      <div class="ecomment-editor-body">
        <div class="ecomment-editor-write-field">
          <textarea placeholder="发表您的见解" required title="${disabledTip}" ${shouldDisable}></textarea>
        </div>
        <div class="ecomment-editor-preview-field ecomment-hidden">
          <div class="ecomment-editor-preview ecomment-markdown"></div>
        </div>
      </div>
    </div>
    <div class="ecomment-editor-footer">
      <a class="ecomment-editor-footer-tip" href="https://guides.github.com/features/mastering-markdown/" target="_blank">
        支持使用Markdown
      </a>
      <button class="ecomment-editor-submit" title="${disabledTip}" ${shouldDisable}>提交评论</button>
    </div>
  `
  if (user.login) {
    container.querySelector('.ecomment-editor-logout-link').onclick = () => instance.logout()
  }

  const writeField = container.querySelector('.ecomment-editor-write-field')
  const previewField = container.querySelector('.ecomment-editor-preview-field')

  const textarea = writeField.querySelector('textarea')
  textarea.oninput = () => {
    textarea.style.height = 'auto'
    const style = window.getComputedStyle(textarea, null)
    const height = parseInt(style.height, 10)
    const clientHeight = textarea.clientHeight
    const scrollHeight = textarea.scrollHeight
    if (clientHeight < scrollHeight) {
      textarea.style.height = (height + scrollHeight - clientHeight) + 'px'
    }
  }

  const [writeTab, previewTab] = container.querySelectorAll('.ecomment-editor-tab')
  writeTab.onclick = () => {
    writeTab.classList.add('ecomment-selected')
    previewTab.classList.remove('ecomment-selected')
    writeField.classList.remove('ecomment-hidden')
    previewField.classList.add('ecomment-hidden')

    textarea.focus()
  }
  previewTab.onclick = () => {
    previewTab.classList.add('ecomment-selected')
    writeTab.classList.remove('ecomment-selected')
    previewField.classList.remove('ecomment-hidden')
    writeField.classList.add('ecomment-hidden')

    const preview = previewField.querySelector('.ecomment-editor-preview')
    const content = textarea.value.trim()
    if (!content) {
      preview.innerText = ''
      return
    }

    preview.innerText = '载入中...'
    instance.markdown(content)
      .then(html => preview.innerHTML = html)
  }

  const submitButton = container.querySelector('.ecomment-editor-submit')
  submitButton.onclick = () => {
    const text = textarea.value.trim()
    if (text === '') {
      return
    }

    submitButton.innerText = '提交中...'
    submitButton.setAttribute('disabled', true)
    instance.post(text)
      .then(data => {
        textarea.value = ''
        textarea.style.height = 'auto'
        submitButton.removeAttribute('disabled')
        submitButton.innerText = '提交评论'
      })
      .catch(e => {
        alert(e)
        submitButton.removeAttribute('disabled')
        submitButton.innerText = '提交评论'
      })
  }

  return container
}

function render(state, instance) {
  const container = document.createElement('div')
  container.className = 'ecomment-container ecomment-root-container'
  container.appendChild(instance.renderHeader(state, instance))
  container.appendChild(instance.renderComments(state, instance))
  container.appendChild(instance.renderEditor(state, instance))
  return container
}

export default { render, renderHeader, renderComments, renderEditor }
