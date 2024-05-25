import { Transform } from "jscodeshift";

// Define a transform function that adheres to the jscodeshift API.
// The function accepts three arguments:
//  - fileInfo: info about the current file
//  - api: jscodeshift library and helper functions
//  - options: all options passed to the runner via the CLI
const transform: Transform = (fileInfo, api) => {
  // Alias the jscodeshift API for ease of use.
  const j = api.jscodeshift;

  // Convert the file source into an AST.
  const root = j(fileInfo.source);

  // TODO: make desired transformations.

  // Convert the AST back to a string. In this case,
  // nothing changed so `null` could be returned and
  // jscodeshift wouldn't do anything.
  return root.toSource();
};

// The transform function then needs to be the default export.
// This will then be executed by jscodeshift for every file.
export default transform;