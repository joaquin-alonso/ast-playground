import { Transform, JSXAttribute } from "jscodeshift";
import * as path from "path";
import * as synchronizedPrettier from "@prettier/sync";

const transform: Transform = (fileInfo, api) => {
  const j = api.jscodeshift;

  const root = j(fileInfo.source);

  // Keep track if there was a button element that was
  // replaced in the current file, or not.
  let fileContainsButton = false;

  root
    // Using helpers defined by jscodeshift, find the
    // JSX elements with the name "button". This is
    // shorthand for the following:
    //
    // root.find(j.JSXElement, {
    //   openingElement: {
    //     name: {
    //       name: "button",
    //     },
    //   },
    // });
    .findJSXElements("button")
    // Then, reusing much of the same logic from earlier,
    // filter out any button elements that don't contain
    // the "button" class name.
    .filter(({ node }) => {
      return !!node?.openingElement?.attributes?.find(
        (attribute) =>
          attribute.type === "JSXAttribute" &&
          attribute.name.type === "JSXIdentifier" &&
          attribute.name.name === "className" &&
          attribute.value?.type === "StringLiteral" &&
          attribute.value.value.split(" ").includes("button")
      );
    })
    // Using another jscodeshift helper method, replace each
    // remaining node with the return value of a function. That
    // function receives the path as the input.
    .replaceWith(({ node }) => {
      fileContainsButton = true;

      const newProps: JSXAttribute[] = [];

      // This entire loop is identical to the previous custom
      // transform, but the babel helpers swapped for
      // jscodeshift helpers.
      node?.openingElement?.attributes?.forEach((attribute) => {
        if (
          attribute.type === "JSXAttribute" &&
          attribute.name.type === "JSXIdentifier"
        ) {
          switch (attribute.name.name) {
            case "type":
              if (
                attribute?.value?.type !== 'StringLiteral' ||
                attribute.value.value !== 'button'
              ) {
                newProps.push(attribute);
              }
              break;
            case "className": {
              if (attribute.value?.type === "StringLiteral") {
                const classNames = attribute.value.value.split(" ");
                const variant = classNames
                  .find(
                    (className) =>
                      className.startsWith("button--") &&
                      className !== "button--block"
                  )
                  ?.replace("button--", "");

                if (variant && variant !== "primary") {
                  newProps.push(
                    j.jsxAttribute(
                      j.jsxIdentifier("variant"),
                      j.stringLiteral(variant)
                    )
                  );
                }

                if (classNames.includes("button--block")) {
                  newProps.push(j.jsxAttribute(j.jsxIdentifier("block")));
                }
              }
              break;
            }
            case "onClick":
              newProps.push(attribute);
              break;
          }
        }
      });

      // Mutate only the opening and closing elements.
      //
      // Note: an entirely new JSXElement node could be
      // constructed, but there is a formatting issue with
      // the children when doing so:
      // https://github.com/benjamn/recast/issues/886.
      node.openingElement = j.jsxOpeningElement(
        j.jsxIdentifier("Button"),
        newProps
      );
      node.closingElement = j.jsxClosingElement(j.jsxIdentifier("Button"));

      return node;
    });

  if (fileContainsButton) {
    // Construct a relative path to the Button component
    // and a new import statement in the same way as the
    // custom script.
    const relativePathToButtonComponent = path.relative(
      path.dirname(fileInfo.path),
      "../flash-cards/src/components/Button/Button.js"
    );

    const buttonComponentImport = j.importDeclaration(
      [j.importSpecifier(j.identifier("Button"), j.identifier("Button"))],
      j.stringLiteral(relativePathToButtonComponent)
    );

    // There's not a convenient API to insert something at the
    // top of any file, so resort to mutating directly.
    root.get().node.program.body.unshift(buttonComponentImport);

    // Finally, convert the AST back to source code and apply
    // formatting with Prettier for consistency.
    return synchronizedPrettier.format(root.toSource(), {
      filepath: fileInfo.path,
    });
  } else {
    // When there wasn't a Button component in the file,
    // no changes need to be made so the file can be skipped.
    return null;
  }
};

export default transform;