/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { XmlElement } from '../../../tv-map/services/open-drive-parser.service';
import { Position } from '../position';
import { EnumOrientationType, PositionType } from '../tv-enums';
import { Orientation } from '../tv-orientation';

export class RelativeObjectPosition extends Position {

	public readonly label: string = 'Relative Object Position';
	public readonly type = PositionType.RelativeObject;

	constructor (
		public objectRef: string,
		public dx = 0,
		public dy = 0,
		public dz = 0,
		public orientation: Orientation = new Orientation()
	) {
		super();
	}

	toVector3 (): Vector3 {

		// Retrieve the position of the referenced object
		const objectPosition = this.objectRef ? this.getEntity( this.objectRef ).getCurrentPosition() : new Vector3();

		// Rotate the relative offset based on the object's orientation
		const rotatedOffset = this.rotateOffset( this.dx, this.dy, this.dz, this.orientation );

		// Calculate the relative position vector
		const relativeVector = new Vector3(
			objectPosition.x + rotatedOffset.x,
			objectPosition.y + rotatedOffset.y,
			objectPosition.z + rotatedOffset.z
		);

		return relativeVector;
	}

	toOrientation (): Orientation {

		// Check if the orientation is relative
		if ( this.objectRef && this.orientation.type == EnumOrientationType.relative ) {

			// Retrieve the orientation of the referenced object
			const objectOrientation = this.getEntity( this.objectRef ).getOrientation();

			// Calculate the relative orientation
			const relativeOrientation = new Orientation(
				objectOrientation.h + this.orientation.h,
				objectOrientation.p + this.orientation.p,
				objectOrientation.r + this.orientation.r
			);

			return relativeOrientation;

		} else {
			// The orientation is absolute, so return it as is
			return this.orientation;
		}
	}

	// Helper function to rotate the offset based on the object's orientation
	private rotateOffset ( dx: number, dy: number, dz: number, orientation: Orientation ): Vector3 {

		// Convert the orientation to radians
		const yawRad = orientation.h * Math.PI / 180;
		const pitchRad = orientation.p * Math.PI / 180;
		const rollRad = orientation.r * Math.PI / 180;

		// Apply rotation matrix to the offset
		const rotatedX = dx * Math.cos( yawRad ) - dy * Math.sin( yawRad );
		const rotatedY = dx * Math.sin( yawRad ) + dy * Math.cos( yawRad );
		const rotatedZ = dz;

		return new Vector3( rotatedX, rotatedY, rotatedZ );
	}

	toXML (): XmlElement {
		return {
			RelativeObject: {
				attr_object: this.objectRef,
				attr_dx: this.dx,
				attr_dy: this.dy,
				attr_dz: this.dz ? this.dz : 0,
				Orientation: this.orientation.toXML()
			}
		};
	}


}
