const _ = require('underscore')
const s = require('underscore.string')

const $ = module.exports = {}

const dirs = ['lib', 'helpers', 'plugins', 'controllers', 'services', 'managers', 'orchestrators', 'components']

const lazy = function (func) {
    func.lazy = function () {
        const topArgs = arguments

        const iam = function () {
            if (iam.lazy) {
                return iam
            }
            const me = func.apply(null, topArgs)
            _.extend(iam, me)
            iam.lazy = true
            iam.created = true
            const callback = topArgs[topArgs.length - 1]
            if (_.isFunction(callback)) {
                callback(me)
            }
            return iam
        }
        return iam
    }
    return func
}

const process = function (moduleName, list) {
    const module = $[moduleName]

    _.each(list, function (item) {
        // console.log('module item.name=', item.name);

        if (_.isFunction(item.module)) {
            lazy(item.module)
        }

        item.name = item.name.split(`../../${moduleName}/`)[1]

        if (item.name.indexOf('express') !== -1) {
            return
        }

        const isIndex = item.name.indexOf('index.js') !== -1

        item.name = item.name.split('.js')[0]

        const splits = item.name.split('/')
        if (splits.length > 1) {
            let ref = module
            let prevSplit = null
            let prevRef = null
            _.each(splits, function (split, index) {
                split = s.camelize(split)
                if (index === splits.length - 1) {
                    ref[split] = item.module
                    if (isIndex) {
                        // console.log('extend prevSplit = ', prevSplit);
                        _.extend(prevRef[prevSplit], item.module)
                    }
                } else {
                    const localRef = ref
                    ref = ref[split] || (ref[split] = lazy(function () {
                        if (_.isFunction(localRef[split].index)) {
                            return localRef[split].index.apply(this, arguments)
                        }
                    }))
                }
                prevSplit = split
                prevRef = ref
            })
        } else {
            module[s.camelize(item.name)] = item.module
            if (isIndex) {
                // console.log('extend module = ', module);
                _.extend(module, item.module)
            }
        }
    })
}

$.load = function (_$) {
    console.log('')
    console.log('LOADING')

    if (_$) {
        _.extend($, _$)
    } else {
        _.each(dirs, function (dir) {
            $[dir] = function () {
                return _.isFunction($[dir].index) && $[dir].index.apply(this, arguments)
            }
        })
    }

    console.log('loading lib')
    process('lib', require('../../lib/**/*.js', { mode: 'list', resolve: ['path'], options: { ignore: '../../lib/**/index.js' } }))
    process('lib', require('../../lib/**/index.js', { mode: 'list', resolve: ['path'] }))

    console.log('loading helpers')
    process('helpers', require('../../helpers/**/*.js', { mode: 'list', resolve: ['path'], options: { ignore: '../../helpers/**/index.js' } }))
    process('helpers', require('../../helpers/**/index.js', { mode: 'list', resolve: ['path'] }))

    console.log('loading plugins')
    process('plugins', require('../../plugins/**/*.js', { mode: 'list', resolve: ['path'], options: { ignore: '../../plugins/**/index.js' } }))
    process('plugins', require('../../plugins/**/index.js', { mode: 'list', resolve: ['path'] }))

    console.log('loading controllers')
    process('controllers', require('../../controllers/**/*.js', { mode: 'list', resolve: ['path'], options: { ignore: '../../controllers/**/index.js' } }))
    process('controllers', require('../../controllers/**/index.js', { mode: 'list', resolve: ['path'] }))

    console.log('loading services')
    process('services', require('../../services/**/*.js', { mode: 'list', resolve: ['path'], options: { ignore: '../../services/**/index.js' } }))
    process('services', require('../../services/**/index.js', { mode: 'list', resolve: ['path'] }))

    console.log('loading managers')
    process('managers', require('../../managers/**/*.js', { mode: 'list', resolve: ['path'], options: { ignore: '../../managers/**/index.js' } }))
    process('managers', require('../../managers/**/index.js', { mode: 'list', resolve: ['path'] }))

    console.log('loading orchestrators')
    process('orchestrators', require('../../orchestrators/**/*.js', { mode: 'list', resolve: ['path'], options: { ignore: '../../orchestrators/**/index.js' } }))
    process('orchestrators', require('../../orchestrators/**/index.js', { mode: 'list', resolve: ['path'] }))

    console.log('loading components')
    process('components', require('../../components/**/*.js', { mode: 'list', resolve: ['path'], options: { ignore: '../../components/**/index.js' } }))
    process('components', require('../../components/**/index.js', { mode: 'list', resolve: ['path'] }))

    console.log('LOADED')

    return $
}
