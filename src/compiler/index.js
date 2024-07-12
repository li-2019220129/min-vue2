const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`);
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const startTagClose = /^\s*(\/?)>/;
const defaultTagRE = /{\{((?:.|\r?\n)+?)\}\}/g;

function genProps(attrs) {
  let str = "";
  for (let i = 0; i < attrs.length; i++) {
    if (attrs[i].name === "style") {
      let styleObj = {};
      attrs[i].value.split(";").forEach((item) => {
        let [key, value] = item.split(":");
        key = key.trim();
        styleObj[key] = value;
      });
      attrs[i].value = styleObj;
    }
    str += `${attrs[i].name}:${JSON.stringify(attrs[i].value)},`;
  }
  return `{${str.slice(0, -1)}}`;
}

function gen(node) {
  if (node.type === 1) {
    return codeGen(node);
  } else {
    const text = node.text;
    let boolean = text.match(defaultTagRE);
    if (!boolean) {
      return `_v(${JSON.stringify(text)})`;
    } else {
      let tokens = [];
      let match;
      defaultTagRE.lastIndex = 0;
      let lastIndex = 0;
      while ((match = defaultTagRE.exec(text))) {
        let index = match.index;
        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        }
        tokens.push(`_s(${match[1].trim()})`);
        lastIndex = index + match[0].length;
      }
      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)));
      }
      return `_v(${tokens.join("+")})`;
    }
  }
}
function genChildren(children) {
  return children.map((child) => gen(child)).join(",");
}
function codeGen(ast) {
  let children = genChildren(ast.children);
  let code = `_c('${ast.tag}',${
    ast.attrs.length ? genProps(ast.attrs) : "null"
  }${ast.children.length ? `,${children}` : ""})`;
  return code;
}
function parseHTML(html) {
  const stack = [];
  const ELEMENT_TYPE = 1;
  const TEXT_TYPE = 3;
  let currentParent;
  let root;

  function createASTElement(tag, attrs, parent) {
    return {
      tag,
      attrs,
      parent,
      type: ELEMENT_TYPE,
      children: [],
    };
  }
  function start(tag, attrs) {
    let node = createASTElement(tag, attrs, currentParent);
    if (!root) {
      root = node;
    }
    if (currentParent) {
      node.parent = currentParent;
      currentParent.children.push(node);
    }
    stack.push(node);
    currentParent = node;
  }
  function chars(text) {
    text = text.replace(/\s*/g, "");
    text &&
      currentParent.children.push({
        type: TEXT_TYPE,
        text,
        parent: currentParent,
      });
  }
  function end(tag) {
    stack.pop();
    currentParent = stack[stack.length - 1];
  }
  function advance(n) {
    html = html.substring(n);
  }
  function parseStartTag() {
    let start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
      };
      advance(start[0].length);
      let end;
      while (!(end = html.match(startTagClose)) && html.match(attribute)) {
        const attrs = html.match(attribute);
        match.attrs.push({
          name: attrs[1],
          value: attrs[3] || attrs[4] || attrs[5] | true,
        });
        advance(attrs[0].length);
      }
      if (end) {
        advance(end[0].length);
      }
      return match;
      // console.log(match);
      // console.log(html);
    }
    return false;
  }
  while (html) {
    let textEnd = html.indexOf("<");
    if (textEnd === 0) {
      const startTagMatch = parseStartTag();
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }
      const endTagMatch = html.match(endTag);
      if (endTagMatch) {
        end(endTagMatch[1]);
        advance(endTagMatch[0].length);
        continue;
      }
    }
    if (textEnd > 0) {
      const text = html.substring(0, textEnd);
      if (text) {
        chars(text);
        advance(text.length);
      }
    }
  }
  return root;
}
export function compileToFunction(template) {
  //1.将template转换成ast语法树
  //2生成render方法（render方法执行后，会生成虚拟dom）
  let ast = parseHTML(template);
  // console.log(ast, "ast");
  let code = codeGen(ast);
  code = `with(this){return ${code}}`;
  // console.log(code);
  let render = new Function(code);
  return render;
}
