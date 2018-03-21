const qs = require('querystring')

const loaderUtils = require('loader-utils')
const compiler = require('nativescript-vue-template-compiler')

module.exports = function (source) {
  const incomingQuery = qs.parse(this.resourceQuery.slice(1))
  const options = loaderUtils.getOptions(this) || {}

  const descriptor = compiler.parseComponent(source)
  descriptor.scripts.forEach((script, index) => {
    script.attrs.scriptIndex = index
  })

  if (incomingQuery.mixin) {
    const mixin = descriptor.scripts[+incomingQuery.mixin]
    this.callback(null, wrap(mixin, 'script'))
    return
  }

  this.callback(null, assemble(descriptor, options))
}

function assemble (descriptor, options) {
  const { target } = options

  const defaultTemplate = descriptor.templates.find(({ attrs }) => Object.keys(attrs).length === 0)
  const template = defaultTemplate || descriptor.templates.find(({ attrs }) => Object.keys(attrs).includes(target))

  const script = descriptor.scripts.find(({ attrs }) => Object.keys(attrs).length === 0)
  const mixins = descriptor.scripts.filter(({ attrs }) => Object.keys(attrs).includes(target))

  const styles = descriptor.styles.filter(({ attrs }) => Object.keys(attrs).length === 0 || Object.keys(attrs).includes(target))

  return [
    ...(template ? [wrap(template, 'template')] : []),
    ...(script ? [wrap(script, 'script')] : []),
    ...(mixins ? mixins.map(mixin => wrap(mixin, 'mixin')) : []),
    ...(styles ? styles.map(style => wrap(style, 'style')) : [])
  ].join('\n')
}

function wrap (block, tag) {
  const attrs = Object.keys(block.attrs).length ? ' ' + Object.entries(block.attrs).reduce((acc, curr) => {
    acc.push(`${curr[0]}="${curr[1]}"`)
    return acc
  }, []).join(' ') : ''

  return `<${tag}${attrs}>${block.content}</${tag}>`
}
