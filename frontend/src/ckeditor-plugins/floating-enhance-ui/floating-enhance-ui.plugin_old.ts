export default function FloatingEnhanceUI(editor: any) {
  console.log("Initializing FloatingEnhanceUI");

  editor.editing.view.document.on('click', (evt: any, data: any) => {
    const modelRange = editor.model.document.selection.getFirstRange();

    if (modelRange) {
      const viewRange = editor.editing.mapper.toViewRange(modelRange);
      const domRange = editor.editing.view.domConverter.viewRangeToDom(viewRange);

      if (domRange) {
        const rect = domRange.getBoundingClientRect();
        showFloatingUI(rect.left, rect.top);
      }
    }
  });
}

FloatingEnhanceUI.pluginName = 'FloatingEnhanceUI';

function showFloatingUI(x: any, y: any) {
  const floating = document.getElementById('floating-ui');
  if (floating) {
    floating.style.left = `${x}px`;
    floating.style.top = `${y}px`;
    floating.style.display = 'block';
  }
}
