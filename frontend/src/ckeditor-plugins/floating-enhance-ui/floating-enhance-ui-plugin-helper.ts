export interface EditorActiveEvent extends CustomEvent {
    detail: {
      editor: any; // Or import CKEditor types if available
      element: HTMLElement;
    };
  }

declare global {
    interface WindowEventMap {
      'op:editor-active': CustomEvent<{
        editor: any;
        element: HTMLElement;
      }>;
    }
}
  
// Listener with proper typing
window.addEventListener('op:editor-active', (event) => {
    const { editor, element } = event.detail;

    // Component logic here
    const rect = element.getBoundingClientRect();
    console.log('Editor active at:', rect);
});