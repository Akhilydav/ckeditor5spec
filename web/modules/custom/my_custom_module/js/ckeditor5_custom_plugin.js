(function ($, Drupal) {
  'use strict';

  Drupal.behaviors.myCustomModule = {
    attach: function (context, settings) {
      // Define your CKEditor 5 plugin functionality here.
      ClassicEditor
        .create(document.querySelector('#editor'), {
          plugins: ['my_custom_module'],
          toolbar: ['my_custom_module']
        })
        .then(editor => {
          console.log('CKEditor5 Custom Plugin initialized', editor);
          // Define plugin behavior
          editor.ui.componentFactory.add('my_custom_module', (locale) => {
            const view = new ButtonView(locale);

            view.set({
              label: 'Custom Plugin',
              icon: myIcon, // Provide your custom icon
              tooltip: true
            });

            view.on('execute', () => {
              // Execute plugin functionality
              editor.model.change(writer => {
                // Add your plugin functionality here
                const element = writer.createElement('paragraph');
                writer.insertText('Hello CKEditor5!', element);
                writer.insert(element, editor.model.document.getRoot());
              });
            });

            return view;
          });
        })
        .catch(error => {
          console.error('CKEditor5 Custom Plugin initialization error:', error);
        });
    }
  };

})(jQuery, Drupal);
