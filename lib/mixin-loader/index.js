const qs = require('querystring')
const loaderUtils = require('loader-utils')

module.exports = function (source, map) {
  const incomingQuery = qs.parse(this.resourceQuery.slice(1))

  const src = this.resourcePath
  const id = incomingQuery.scriptIndex
  const query = `?vue&type=script&mixin=${id}`
  const request = loaderUtils.stringifyRequest(this, src + query)
  this.callback(null,
    `import mixin${id} from ${request}\n` +
    `export default Component => Component.options.mixins.push(mixin${id})`,
    map)
}
