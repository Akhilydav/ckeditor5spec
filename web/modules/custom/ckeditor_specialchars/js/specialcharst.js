
/**
 * @file
 * Default JavaScript file for CKEditor Special Characters.
 */

(function (Drupal, ckeditor, editorSettings, CKEDITOR) {
    'use strict';
  
    Drupal.behaviors.ckSpecialChars = {
      attach: function (context, settings) {
  
        //debugger;
        console.log(CKEDITOR.plugins);
  
      }
    };
  })(Drupal, Drupal.editors.ckeditor, drupalSettings.editor, CKEDITOR);