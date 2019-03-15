import * as React from 'react';
import {AttributeName} from '../../../../Api/Models/attributes';
import {IAttributeDialogProps} from '../AttributesEditor';
import {AffinityDialog} from './AffinityDialog';
import {RequiredGenderDialog} from './RequiredGenderDialog';

type DialogMap = {
	[P in AttributeName]?: React.ComponentClass<IAttributeDialogProps<any>>;
};

export const dialogs: DialogMap = {
	[AttributeName.AFFINITY]: AffinityDialog,
	[AttributeName.GENDER]: RequiredGenderDialog,
};