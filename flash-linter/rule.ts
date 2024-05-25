import * as fs from "fs";
import * as glob from "glob";
import * as path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { codeFrameColumns } from '@babel/code-frame';

const files = glob.sync("../flash-cards/src/components/**/*.js");

files.forEach((file) => {
  const contents = fs.readFileSync(file).toString();

  const ast = parse(contents, {
    sourceType: 'module',
    plugins: ['jsx'],
  });

  traverse(ast, {
    JSXOpeningElement({ node }) {
      if (node.name.type === 'JSXIdentifier' && node.name.name === 'button') {
        const hasButtonClassName = node.attributes.find(attribute =>
          attribute.type === 'JSXAttribute' &&
          attribute.name.type === 'JSXIdentifier' &&
          attribute.name.name === 'className' &&
          attribute.value?.type === 'StringLiteral' &&
          attribute.value.value.split(' ').includes('button')
        );

        if (!hasButtonClassName) return;

        // At this point, it means a violation (eg:
        // `<button className="button" />`) was found.
        // Configure the exact location of the code to highlight.
        // In this case, the entire opening element's location is
        // used. This could be anything: the entire JSXElement, or
        // only the JSXIdentifier name: `button`.
        const { start, end } = node.loc!;
        const location = {
          start: { line: start.line, column: start.column + 1 },
          end: { line: end.line, column: end.column + 1 },
        };

        // Additional configuration for the code frame.
        const options = {
          // Enable syntax highlighting for the output code.
          highlightCode: true,
          // Custom message that will be displayed inline
          // with the highlighted code.
          message: `Found "button" element that should be "Button" component.`,
        };

        const result = codeFrameColumns(
          // Pass the entire original source code string.
          contents,
          // Pass the exact location of the code that is relevant.
          location,
          // Pass additional configuration.
          options
        );

        // Continue to log the entire file path with the line and
        // column along with the generated code frame.
        console.log(`${path.resolve(file)}:${start.line}:${start.column + 1}`);
        console.log(result);

        process.exitCode = 1;
      }
    }
  });
});

process.exit();
