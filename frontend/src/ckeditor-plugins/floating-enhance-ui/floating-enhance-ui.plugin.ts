// import { EditorActiveEvent } from "./floating-enhance-ui-plugin-helper";

// function EditorActivityNotifier(editor: any) {
//   let isActive = false;

//   const notifyExternalComponent = () => {
//     if (!isActive) {
//       isActive = true;
//       const event = new CustomEvent('op:editor-active', {
//         detail: {  // Now properly typed
//           editor,
//           element: editor.ui.getEditableElement()
//         }
//       }) as EditorActiveEvent;
      
//       window.dispatchEvent(event);
//     }
//   };

//   // Rest of the plugin remains the same...
//   editor.ui.focusTracker.on('change:isFocused', (_evt: any, _name: any, isFocused: boolean) => {
//     if (isFocused) notifyExternalComponent();
//     else isActive = false;
//   });

//   editor.model.document.on('change:data', notifyExternalComponent);
// }