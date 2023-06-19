import { ConditionCategory } from '../tv-enums';
import { Condition } from './tv-condition';

export abstract class ValueCondition extends Condition {

	public category: ConditionCategory = ConditionCategory.ByValue;

}
