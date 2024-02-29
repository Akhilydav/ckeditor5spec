<?php

namespace Drupal\my_custom_module\Plugin\CKEditor5;

use Drupal\ckeditor5\Plugin\CKEditor5PluginBase;
use Drupal\editor\EditorInterface;

/**
 * Defines the Special Characters CKEditor 5 plugin.
 *
 * @CKEditor5Plugin(
 *   id = "SpecialCharacters",
 *   label = @Translation("Special Characters"),
 *   description = @Translation("Provides a toolbar button to insert special characters."),
 * )
 */
class SpecialCharactersPlugin extends CKEditor5PluginBase {

  /**
   * {@inheritdoc}
   */
  public function getConfig(EditorInterface $editor) {
    return [
      'characters' => [
        'plugin' => 'SpecialCharacters',
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getDependencies(EditorInterface $editor) {
    return ['SpecialCharacters'];
  }

}
