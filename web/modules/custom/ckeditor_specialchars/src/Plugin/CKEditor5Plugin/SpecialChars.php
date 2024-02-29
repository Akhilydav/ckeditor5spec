<?php

declare(strict_types=1);

namespace Drupal\ckeditor_specialchars\Plugin\CKEditor5Plugin;

use Drupal\ckeditor5\Plugin\CKEditor5PluginConfigurableInterface;
use Drupal\ckeditor5\Plugin\CKEditor5PluginConfigurableTrait;
use Drupal\ckeditor5\Plugin\CKEditor5PluginDefault;
use Drupal\Core\Form\FormStateInterface;
use Drupal\editor\EditorInterface;

/**
 * CKEditor 5 Special characters plugin.
 *
 * @internal
 *   Plugin classes are internal.
 */
class SpecialChars extends CKEditor5PluginDefault implements CKEditor5PluginConfigurableInterface {

  use CKEditor5PluginConfigurableTrait;

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return [
      'character_set' => "à, è, ù\nç\nâ, ê, î, ô, û\në, ï, ü",
      'replace' => 0,
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    /*$all_profiles = $this->linkitProfileStorage->loadMultiple();

    $options = [];
    foreach ($all_profiles as $profile) {
      $options[$profile->id()] = $profile->label();
    }*/

    $form['character_set'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Special characters'),
      '#description' => $this->t('One per line'),
      '#default_value' => $this->configuration['character_set'],
    ];

    $form['replace'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Replace default characters?'),
      '#description' => $this->t('Leaving un-checked will append to default character list.'),
      '#default_value' => $this->configuration['replace'],
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   *
   * Filters the alignment options to those chosen in editor config.
   */
  public function getDynamicPluginConfig(array $static_plugin_config, EditorInterface $editor): array {

    $settings = $editor->getSettings();
    if (isset($settings['plugins']['specialchars'])) {
      $config = $settings['plugins']['specialchars'];
      dump($settings['plugins']);
    }
//    dump($settings['plugins']);

    //dump($editor);
//    die();
    /*$enabled_alignments = $this->configuration['enabled_alignments'];
    $all_alignment_options = $static_plugin_config['alignment']['options'];

    $configured_alignment_options = array_filter($all_alignment_options, function ($option) use ($enabled_alignments) {
      return in_array($option['name'], $enabled_alignments, TRUE);
    });*/

    return [
      'alignment' => [
        'options' => ['Emoji', [
            'smiley face' => '😊',
            'heart' => '❤️',
            'heart' => 'ç',
          ],
          /*{ title: 'smiley face', character: '😊' },
          { title: 'rocket', character: '🚀' },
          { title: 'wind blowing face', character: '🌬️' },
          { title: 'floppy disk', character: '💾' },
          { title: 'heart', character: '❤️' }*/
        ],
      ],
    ];
  }

  /**
   * Computes all valid choices for the "linkit_profile" setting.
   *
   * @see linkit.schema.yml
   *
   * @return string[]
   *   All valid choices.
   */
  /*public static function validChoices(): array {
    $linkit_profile_storage = \Drupal::service('entity_type.manager')->getStorage('linkit_profile');
    assert($linkit_profile_storage instanceof EntityStorageInterface);
    return array_keys($linkit_profile_storage->loadMultiple());
  }*/

  /**
   * {@inheritdoc}
   */
  public function validateConfigurationForm(array &$form, FormStateInterface $form_state) {
    // Match the config schema structure at ckeditor5.plugin.linkit_extension.
    /*if (empty($form_state->getValue('linkit_profile'))) {
      $form_state->unsetValue('linkit_profile');
    }*/
  }

  /**
   * {@inheritdoc}
   */
  public function submitConfigurationForm(array &$form, FormStateInterface $form_state) {
    $this->configuration['character_set'] = $form_state->getValue('character_set');
    $this->configuration['replace'] = (bool) $form_state->getValue('replace');
    // `linkit_profile` only is relevant when Linkit is enabled.
    /*if ($this->configuration['linkit_enabled']) {
      $this->configuration['linkit_profile'] = $form_state->getValue('linkit_profile');
    }*/
  }

  /**
   * {@inheritdoc}
   */
  /*public function getDynamicPluginConfig(array $static_plugin_config, EditorInterface $editor): array {
    assert($this->configuration['linkit_enabled'] === TRUE);
    return [
      'linkit' => [
        'profile' => $this->configuration['linkit_profile'],
        'autocompleteUrl' => Url::fromRoute('linkit.autocomplete', ['linkit_profile_id' => $this->configuration['linkit_profile']])
          ->toString(TRUE)
          ->getGeneratedUrl()
      ],
    ];
  }*/
}