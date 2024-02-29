<?php

use Drupal\ckeditor5\CKEditor5PluginBase;
use Drupal\editor\Entity\Editor;

/**
 * Provides a CKEditor plugin settings.
 */
class MyCustomModuleCKEditorPlugin extends CKEditor5PluginBase {

  /**
   * {@inheritdoc}
   */
  public function getFile() {
    return drupal_get_path('module', 'my_custom_module') . '/js/plugins/CKEditorPlugin/plugin.js';
  }

  /**
   * {@inheritdoc}
   */
  public function getConfig(Editor $editor) {
    return array(
      'my_plugin_setting' => 'value', // Your custom plugin settings
    );
  }

}
