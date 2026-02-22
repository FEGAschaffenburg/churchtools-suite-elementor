<?php
/**
 * Elementor Integration Auto Updater
 *
 * Checks GitHub releases for new versions and provides update info to WordPress.
 *
 * @package ChurchTools_Suite_Elementor
 * @since   0.6.5
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CTS_Elementor_Auto_Updater {

	const GITHUB_API_RELEASES_LATEST = 'https://api.github.com/repos/FEGAschaffenburg/churchtools-suite-elementor/releases/latest';
	const PLUGIN_SLUG = 'churchtools-suite-elementor';
	const PLUGIN_FILE = 'churchtools-suite-elementor/churchtools-suite-elementor.php';

	public static function init(): void {
		// Offer update info to WordPress update API
		add_filter( 'pre_set_site_transient_update_plugins', [ __CLASS__, 'push_update_to_transient' ] );
		
		// Provide plugin information for update modal
		add_filter( 'plugins_api', [ __CLASS__, 'plugins_api_filter' ], 10, 3 );
	}

	/**
	 * Get latest release info from GitHub
	 *
	 * @return array|WP_Error Release info or error
	 */
	public static function get_latest_release_info() {
		// Check cache first (1 hour)
		$cache_key = 'cts_elementor_latest_release';
		$cached = get_transient( $cache_key );
		if ( $cached !== false ) {
			return $cached;
		}

		$response = wp_remote_get( self::GITHUB_API_RELEASES_LATEST, [
			'timeout' => 10,
			'headers' => [
				'User-Agent' => 'ChurchTools-Suite-Elementor-Updater',
				'Accept'     => 'application/vnd.github.v3+json',
			],
		] );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$status = wp_remote_retrieve_response_code( $response );
		if ( $status !== 200 ) {
			return new WP_Error( 'github_error', sprintf( 'GitHub API returned status %d', $status ) );
		}

		$body = wp_remote_retrieve_body( $response );
		$data = json_decode( $body, true );

		if ( empty( $data['tag_name'] ) ) {
			return new WP_Error( 'no_tag', 'No tag_name in GitHub response' );
		}

		// Find ZIP asset
		$zip_url = '';
		if ( ! empty( $data['assets'] ) && is_array( $data['assets'] ) ) {
			foreach ( $data['assets'] as $asset ) {
				if ( isset( $asset['browser_download_url'] ) && strpos( $asset['name'], '.zip' ) !== false ) {
					$zip_url = $asset['browser_download_url'];
					break;
				}
			}
		}

		if ( empty( $zip_url ) ) {
			return new WP_Error( 'no_zip', 'No ZIP asset found in release' );
		}

		$info = [
			'tag_name'       => $data['tag_name'],
			'version'        => ltrim( $data['tag_name'], 'v' ),
			'zip_url'        => $zip_url,
			'html_url'       => $data['html_url'] ?? '',
			'name'           => $data['name'] ?? $data['tag_name'],
			'body'           => $data['body'] ?? '',
			'published_at'   => $data['published_at'] ?? '',
		];

		// Cache for 1 hour
		set_transient( $cache_key, $info, HOUR_IN_SECONDS );

		return $info;
	}

	/**
	 * Push update info to WordPress transient
	 *
	 * @param object $transient
	 * @return object
	 */
	public static function push_update_to_transient( $transient ) {
		if ( empty( $transient->checked ) ) {
			return $transient;
		}

		$release = self::get_latest_release_info();
		if ( is_wp_error( $release ) ) {
			return $transient;
		}

		$current_version = CTS_ELEMENTOR_VERSION;
		$latest_version = $release['version'];

		if ( version_compare( $latest_version, $current_version, '>' ) ) {
			$plugin_data = [
				'slug'        => self::PLUGIN_SLUG,
				'plugin'      => self::PLUGIN_FILE,
				'new_version' => $latest_version,
				'url'         => $release['html_url'],
				'package'     => $release['zip_url'],
				'tested'      => '6.7',
				'requires_php' => '8.0',
			];

			$transient->response[ self::PLUGIN_FILE ] = (object) $plugin_data;
		}

		return $transient;
	}

	/**
	 * Provide plugin information for the update modal
	 *
	 * @param false|object|array $result
	 * @param string $action
	 * @param object $args
	 * @return false|object|array
	 */
	public static function plugins_api_filter( $result, $action, $args ) {
		if ( $action !== 'plugin_information' ) {
			return $result;
		}

		if ( ! isset( $args->slug ) || $args->slug !== self::PLUGIN_SLUG ) {
			return $result;
		}

		$release = self::get_latest_release_info();
		if ( is_wp_error( $release ) ) {
			return $result;
		}

		$plugin_info = (object) [
			'name'          => 'ChurchTools Suite - Elementor Integration',
			'slug'          => self::PLUGIN_SLUG,
			'version'       => $release['version'],
			'author'        => '<a href="https://feg-aschaffenburg.de">FEG Aschaffenburg</a>',
			'homepage'      => 'https://github.com/FEGAschaffenburg/churchtools-suite-elementor',
			'requires'      => '6.0',
			'tested'        => '6.7',
			'requires_php'  => '8.0',
			'download_link' => $release['zip_url'],
			'sections'      => [
				'description' => 'Elementor Page Builder Widget für ChurchTools Suite Events. Zeigt Events in Listen-, Raster- oder Kalender-Ansicht.',
				'changelog'   => $release['body'] ? wp_kses_post( $release['body'] ) : 'Siehe GitHub Release für Details.',
			],
			'banners'       => [],
			'external'      => true,
		];

		return $plugin_info;
	}

	/**
	 * Clear update cache
	 */
	public static function clear_cache(): void {
		delete_transient( 'cts_elementor_latest_release' );
	}
}
