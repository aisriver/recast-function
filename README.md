# recast-function
不同函数间的转换，目前支持，将普通函数转换成继承React.Component的class构造函数。

# how to use
## step 1
- npm install -g cnpm --registry=https://registry.npm.taobao.org
- cnpm install recast-function --save
- 或者使用 yarn add recast-function

## step 2
import recastFunction from 'recast-function';

- use

<pre>
<h4>接收参数</h4>
recastFunction.normalToReactClass(code, isDownLoad);
code, 源函数
isDownLoad  是否下载

函数解释：
normalToReactClass(将普通函数转换成继承React.Component的class构造函数) 
...

<h4>示例</h4>
recastFunction.normalToReactClass(
    `
    function Page(props) {
        const { a, b } = props;
        function z(){ console.log('a', a); return 0; }

        return (
            &ltdiv onClick={z}>{z()}&ltdiv&gt&lt/div&gt&lt/div&gt
        );
    }
    `
)

<h4>将会返回string格式的结果</h4>
class Page extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const { a, b } = this.props;
        const z = () => { console.log('a', a); return 0; };

        return (
            &ltdiv onClick={z}>{z()}&ltdiv&gt&lt/div&gt&lt/div&gt
        );
    }
}

注意：源函数类型如果不匹配，则可能得不到想要的结果。另外加上isDownLoad为true的传参可以直接下载文件。
</pre>

### github
[Jared](https://github.com/aisriver/recast-function.git)