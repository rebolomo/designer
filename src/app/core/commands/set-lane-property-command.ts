/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from '../../modules/tv-map/models/tv-lane';
import { BaseCommand } from './base-command';

export class SetLanePropertyCommand extends BaseCommand {

	private readonly oldValue: any;

	constructor ( private lane: TvLane, private attribute: any, private newValue: any ) {

		super();

		this.oldValue = lane[ attribute ];
	}

	execute (): void {

		this.lane[ this.attribute ] = this.newValue;

		this.buildRoad( this.lane.laneSection.road );

	}

	undo (): void {

		this.lane[ this.attribute ] = this.oldValue;

		this.buildRoad( this.lane.laneSection.road );

	}

	redo (): void {

		this.execute();

	}


}
