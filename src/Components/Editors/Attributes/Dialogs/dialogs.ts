import * as React from 'react';
import {AttributeName, IAttribute} from '../../../../Api/Models/attributes';
import {IAttributeDialogProps} from '../AttributesEditor';
import {AffinityDialog} from './AffinityDialog';
import {DefenseDialog} from './DefenseDialog';
import {DeviationDialog} from './DeviationDialog';
import {EldersealDialog} from './EldersealDialog';
import {RequiredGenderDialog} from './RequiredGenderDialog';

export interface IAttributeValueRenderer {
	renderAttributeValue: (attribute: IAttribute) => React.ReactNode;
}

export const isAttributeValueRenderer = (subject: any): subject is IAttributeValueRenderer => {
	return typeof subject === 'object' && 'renderAttributeValue' in subject;
};

type DialogMap = {
	[P in AttributeName]?: React.ComponentType<IAttributeDialogProps<any>>;
};

export const dialogs: DialogMap = {
	[AttributeName.AFFINITY]: AffinityDialog,
	[AttributeName.DEFENSE]: DefenseDialog,
	[AttributeName.DEVIATION]: DeviationDialog,
	[AttributeName.ELDERSEAL]: EldersealDialog,
	[AttributeName.GENDER]: RequiredGenderDialog,
};
