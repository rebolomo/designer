/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionType, Rule, TriggeringRule } from '../tv-enums';
import { AbstractByEntityCondition } from './abstract-by-entity-condition';

/**
 * Compares the entity's acceleration to a reference value.
 * The logical operator used for comparison is defined by
 * the rule attribute (less, greater, equal).
 */
export class AccelerationCondition extends AbstractByEntityCondition {

	private debug = false;

	conditionType = ConditionType.ByEntity_Acceleration;

	/**
	 * Acceleration value. Unit: m/s^2.
	 * @param value
	 * @param rule
	 */
	constructor ( public value: number, public rule: Rule ) {

		super();

	}

	hasPassed (): boolean {

		const passed = this.triggeringEntities.map( entityName => {

			const acceleration = this.getEntity( entityName ).getCurrentAcceleration();

			if ( this.debug ) console.log( 'AccelerationCondition', entityName, acceleration, this.value, this.rule );

			return this.hasRulePassed( this.rule, acceleration, this.value );

		} );

		if ( this.triggeringRule === TriggeringRule.Any ) {

			return passed.some( p => p );

		} else {

			return passed.every( p => p );

		}

	}

}
