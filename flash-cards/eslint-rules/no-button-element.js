module.exports = {
  meta: {
    type: 'suggestion'
  },
  create: function(context) {
    return {
      JSXOpeningElement(node) {
        if (node.name.type === 'JSXIdentifier' && node.name.name === 'button') {
          const hasButtonClassName = node.attributes.find(attribute =>
            attribute.type === 'JSXAttribute' &&
            attribute.name.type === 'JSXIdentifier' &&
            attribute.name.name === 'className' &&
            attribute.value?.type === 'Literal' &&
            attribute.value.value.split(' ').includes('button')
          );

          if (hasButtonClassName) {
            context.report({ message: 'Found a "button" element that should be a "Button" component.', node })
          };
        }
      }
    }
  }
}
