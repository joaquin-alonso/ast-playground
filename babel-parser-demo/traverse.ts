import { parse } from '@babel/parser';
import traverse from "@babel/traverse";

// const code = '2 + (4 * 10)';
// const code = '1 + (((2 - 3) / 4) + ((5 * 6) - (7 + 8) * 9))';
const code = '2 + (4 * 10)';

const ast = parse(code);

traverse(ast, {
  NumericLiteral(path) {
    console.log(path.node.value);
  }
  // BinaryExpression(path) {
  //   console.log(path.node.operator);
  // }
  // NumericLiteral: {
  //   enter(path) {
  //     console.log(`Entered ${path.node.value}`);
  //   },
  //   exit(path) {
  //     console.log(`Entered ${path.node.value}`);
  //   }
  // }
})
