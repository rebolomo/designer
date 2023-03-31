/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { environment } from '../../../environments/environment';

export class Environment {

	static get dsn (): string {

		return environment.sentry_dsn;

	}

	static get environment (): string {

		return this.production ? 'production' : 'development';

	}

	static get production (): boolean {

		return environment.production;

	}

	static get oscEnabled (): boolean {

		return environment.osc_enabled;

	}

	static get websiteUrl (): string {

		return environment.web_url;

	}

	static get version (): string {

		try {

			return require( '../../../../package.json' ).version;

		} catch ( error ) {

			return 'unknown';

		}

	}

}
