export interface IEntity {
	id?: number;
}

export type Normalized<T extends IEntity> = {
	[K in keyof T]: T[K] extends IEntity ? (Normalized<T[K]> | number) : T[K];
};

export type Identifiable<T extends IEntity> = Pick<T, 'id'> | number;

export const toIdentifier = <T extends IEntity>(identifiable: Identifiable<T>): number => {
	return typeof identifiable === 'number' ? identifiable : identifiable.id;
};

export const toIdArray = <T extends IEntity>(items: IEntity[]) => items.map(item => item.id);

export const compareFields = <T>(key: keyof T, a: T, b: T): -1 | 0 | 1 => {
	const aVal = a[key];
	const bVal = b[key];

	if (aVal > bVal)
		return 1;
	else if (aVal < bVal)
		return -1;

	return 0;
};
