; (function () {
    "use strict"
    var _global;
    var recast = require("recast");
    var {
        variableDeclaration, variableDeclarator, functionExpression,
        identifier: id,
        expressionStatement,
        memberExpression,
        assignmentExpression,
        arrowFunctionExpression,
        blockStatement,
        classExpression,
        classStatement,
        classBody,
        methodDefinition,
        classDeclaration,
        callExpression,
        binaryExpression,
        literal,
        objectExpression,
        doExpression,
        exportNamedDeclaration,
        functionDeclaration,
    } = recast.types.builders;
    function fileDownload(content, filename) {
        var eleLink = document.createElement('a');
        eleLink.download = filename;
        eleLink.style.display = 'none';
        var blob = new Blob([content]);
        eleLink.href = URL.createObjectURL(blob);
        document.body.appendChild(eleLink);
        eleLink.click();
        URL.revokeObjectURL(eleLink.href);  // 解除链接
        document.body.removeChild(eleLink);
    };
    function normalToReactClass(code, isDownLoad) {
        var ast = '';
        try {
            ast = recast.parse(code);
        } catch (error) {
            var index = error.index;
            // 标签不能直接return
            if (error.description === 'Unexpected token <') {
                var afterCode = code.substring(index, code.length);
                var matchB = afterCode.match(/<\w+? /);
                var hStr = matchB[0].substring(1, matchB[0].length - 1);
                var matchE = afterCode.match(new RegExp("(</" + hStr + ">(?![\s\S]*?</" + hStr + ">))"));
                var endIndex = index + matchE.index + 3 + hStr.length;
                code = code.substring(0, index) + '"r_e_s_p_a_c_e'
                    + code.substring(index, endIndex) + 'r_e_s_p_a_c_e"'
                    + code.substring(endIndex, code.length);
                normalToReactClass(code, isDownLoad);
            } else {
                console.warn(error);
            }
        }
        if (!ast) { return false; }
        // 先把所有props转换成this.props
        recast.types.visit(ast, {
            visitIdentifier(path) {
                var node = path.value;
                if (node.name === 'props') { node.name = 'this.props'; }
                // this.visitor.names.push(node.name);
                this.traverse(path);
            }
        });
        // 用来保存遍历到的全部函数名
        var funcIds = []
        recast.types.visit(ast, {
            // 遍历所有的函数定义
            visitFunctionDeclaration(path) {
                // 获取遍历到的函数名、参数、块级域
                var node = path.node
                var funcName = node.id
                var params = node.params
                var body = node.body

                // 保存函数名
                funcIds.push(funcName.name)
                // 这是上一步推导出来的ast结构体
                var rep = classDeclaration( // Declaration
                    id(funcName.name),
                    classBody([
                        methodDefinition(
                            'varructor',
                            id('varructor'),
                            functionExpression(
                                null,
                                [id('props')],
                                blockStatement([
                                    expressionStatement(callExpression(id('super'), [id('props')])),
                                    expressionStatement(assignmentExpression('=',
                                        memberExpression(id('this'), id('state'), false),
                                        objectExpression([])))
                                ])
                            ),
                            false
                        ),
                        methodDefinition(
                            'varructor',
                            id('render'),
                            functionExpression(
                                null,
                                [],
                                body
                            ),
                            false
                        )
                    ]), memberExpression(id('React'), id('Component'), false)
                )
                // 将原来函数的ast结构体，替换成推导ast结构体
                path.replace(rep)
                // 停止遍历
                return false
            }
        })

        recast.types.visit(ast, {
            visitFunction(path) {
                var node = path.node;
                if (node.type === 'FunctionDeclaration') {
                    var funcName = node.id;
                    var params = node.params;
                    var body = node.body;
                    var rep = variableDeclaration("var", [
                        variableDeclarator(funcName, arrowFunctionExpression(params, body))
                    ]);
                    path.replace(rep)
                }
                this.traverse(path);
            }
        });

        recast.types.visit(ast, {
            // 遍历所有的函数调用
            visitCallExpression(path) {
                var node = path.node;
                // 如果函数调用出现在函数定义中，则修改ast结构
                if (funcIds.includes(node.callee.name)) {
                    node.callee = memberExpression(id('exports'), node.callee)
                }
                // 停止遍历
                return false
            }
        })
        // 打印修改后的ast源码
        var codeResult = recast.print(ast).code;
        if (/"r_e_s_p_a_c_e/.test(codeResult)) {
            codeResult = codeResult.replace(/"r_e_s_p_a_c_e/g, "");
            codeResult = codeResult.replace(/r_e_s_p_a_c_e"/g, "");
        }
        if (isDownLoad) {
            fileDownload(codeResult, '函数normalToReactClass_' + (new Date()).getTime() + '.js');
        }
        return codeResult;
    }
    var recastFunction = {
        normalToReactClass: normalToReactClass,
    };
    _global = (function () { return this || (0, eval)('this'); }());
    if (typeof module !== "undefined" && module.exports) {
        module.exports = recastFunction;
    } else if (typeof define === "function" && define.amd) {
        define(function () { return recastFunction; });
    } else {
        !('recastFunction' in _global) && (_global.recastFunction = recastFunction);
    }
}());