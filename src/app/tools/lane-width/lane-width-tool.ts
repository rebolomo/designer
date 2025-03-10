/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';
import { CommandHistory } from 'app/services/command-history';
import { MouseButton, PointerEventData } from '../../events/pointer-event-data';
import { LaneWidthNode } from '../../modules/three-js/objects/lane-width-node';
import { TvLane } from '../../modules/tv-map/models/tv-lane';
import { NodeFactoryService } from '../../factories/node-factory.service';
import { KeyboardInput } from '../../core/input';
import { ToolType } from '../tool-types.enum';
import { PickingHelper } from '../../services/picking-helper.service';
import { BaseTool } from '../base-tool';
import { CreateWidthNodeCommand } from './create-lane-width-command';
import { SelectLaneForLaneWidthCommand } from './select-lane-for-lane-width-command';
import { SelectLaneWidthNodeCommand } from './select-lane-width-node-command';
import { UnselectLaneForLaneWidthCommand } from './unselect-lane-for-lane-width-command';
import { UnselectLaneWidthNodeCommand } from './unselect-lane-width-node-command';
import { UpdateWidthNodePositionCommand } from './update-width-node-position-command';

export class LaneWidthTool extends BaseTool {

	public name: string = 'LaneWidth';
	public toolType = ToolType.LaneWidth;
	public laneHelper = new OdLaneReferenceLineBuilder();
	private laneWidthChanged: boolean = false;

	constructor () {

		super();

	}

	private _lane: TvLane;

	get lane (): TvLane {
		return this._lane;
	}

	set lane ( value: TvLane ) {
		this._lane = value;
	}

	private _node: LaneWidthNode;

	get node (): LaneWidthNode {
		return this._node;
	}

	set node ( value: LaneWidthNode ) {
		this._node = value;
	}

	init () {

		this.setHint( 'use LEFT CLICK to select a road/lane' );

	}

	enable () {

		super.enable();

	}

	disable () {

		super.disable();

		this.laneHelper.clear();

		this.map.getRoads().forEach( road => road.hideWidthNodes() );
	}

	public onPointerDown ( e: PointerEventData ) {

		if ( e.button !== MouseButton.LEFT ) return;

		const shiftKeyDown = KeyboardInput.isShiftKeyDown;

		if ( !shiftKeyDown && this.checkNodePointInteraction( e ) ) return;

		if ( !shiftKeyDown && this.checkLaneObjectInteraction( e ) ) return;

		if ( shiftKeyDown && e.point != null ) {

			const lane = PickingHelper.checkLaneObjectInteraction( e );

			if ( !lane ) return false;

			CommandHistory.execute( new CreateWidthNodeCommand( this, lane, e.point ) );

			this.setHint( 'Drag node to modify position. Change properties from inspector' );


		} else if ( this._lane ) {

			CommandHistory.execute( new UnselectLaneForLaneWidthCommand( this, this._lane ) );

			this.setHint( 'use LEFT CLICK to select a road/lane' );

		}
	}

	public onPointerUp ( e ) {

		if ( this.laneWidthChanged && this._node ) {

			const newPosition = this._node.point.position.clone();

			const oldPosition = this.pointerDownAt.clone();

			CommandHistory.execute( new UpdateWidthNodePositionCommand( this._node, newPosition, oldPosition, this.laneHelper ) );

		}

		this.laneWidthChanged = false;
	}

	public onPointerMoved ( e: PointerEventData ) {

		if ( this.isPointerDown && this._node ) {

			this.laneWidthChanged = true;

			NodeFactoryService.updateLaneWidthNode( this._node, e.point );

			this._node.updateLaneWidthValues();

		}

	}

	private checkNodePointInteraction ( e: PointerEventData ): boolean {

		// Check for control point interactions
		const interactedPoint = PickingHelper.checkControlPointInteraction( e, LaneWidthNode.pointTag );

		if ( !interactedPoint || !interactedPoint.parent ) return false;

		const newNode = interactedPoint.parent as LaneWidthNode;

		if ( !this._node || this._node.uuid !== newNode.uuid ) {

			CommandHistory.execute( new SelectLaneWidthNodeCommand( this, newNode ) );

			this.setHint( 'Drag node to modify position. Change properties from inspector' );

		}

		return true;
	}

	private checkLaneObjectInteraction ( e: PointerEventData ): boolean {

		const newLane = PickingHelper.checkLaneObjectInteraction( e );

		if ( !newLane ) return false;

		if ( !this._lane || this._lane.roadId !== newLane.roadId ) {

			CommandHistory.execute( new SelectLaneForLaneWidthCommand( this, newLane ) );

			this.setHint( 'use LEFT CLICK to select a node or use SHIFT + LEFT CLICK to add new node' );

		} else if ( this._node ) {

			CommandHistory.execute( new UnselectLaneWidthNodeCommand( this, this._node ) );

			this.setHint( 'use LEFT CLICK to select a node or use SHIFT + LEFT CLICK to add new node' );

		}

		return true;
	}
}
