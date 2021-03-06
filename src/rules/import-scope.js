/**
 * @fileoverview Rule to disallow the use of a chain for a single method
 */
'use strict'

/**
 * @fileoverview Rule to disallow the use of a chain for a single method
 */
// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

const {isFullLodashImport, getNameFromCjsRequire, getMethodImportFromName} = require('../util/importUtil')
const every = require('lodash/every')
const includes = require('lodash/includes')

const messages = {
    method: 'Do not import from the full Lodash module.',
    member: 'Import members from the full Lodash module.',
    full: 'Use the full Lodash module.'
}

const importNodeTypes = {
    method: ['ImportDefaultSpecifier'],
    member: ['ImportSpecifier'],
    full: ['ImportDefaultSpecifier', 'ImportNamespaceSpecifier']
}

const isMethodImport = name => Boolean(getMethodImportFromName(name))
const allImportsAreOfType = (node, types) => every(node.specifiers, specifier => includes(types, specifier.type))

module.exports = {
    meta: {
        schema: [{
            enum: ['method', 'member', 'full']
        }]
    },
    create(context) {
        const importType = context.options[0] || 'method'

        return {
            ImportDeclaration(node) {
                if (isFullLodashImport(node.source.value)) {
                    if (importType === 'method') {
                        context.report({node, message: messages.method})
                    } else {
                        if (!allImportsAreOfType(node, importNodeTypes[importType])) {
                            context.report({node, message: messages[importType]})
                        }
                    }
                } else if (isMethodImport(node.source.value) && importType !== 'method') {
                    context.report({node, message: messages[importType]})
                }
            },
            VariableDeclarator(node) {
                const name = getNameFromCjsRequire(node.init)
                if (isFullLodashImport(name)) {
                    if (importType === 'method') {
                        context.report({node, message: messages.method})
                    } else {
                        const isObjectPattern = node.id.type === 'ObjectPattern'
                        const isMemberImport = importType === 'member'
                        if (isObjectPattern !== isMemberImport) {
                            context.report({node, message: messages[importType]})
                        }
                    }
                } else if (isMethodImport(name) && importType !== 'method') {
                    context.report({node, message: messages[importType]})
                }
            }
        }
    }
}
