import {Button} from '@blueprintjs/core';
import {Cell, IColumn, Row, Table} from '@dbstudios/blueprintjs-components';
import * as React from 'react';
import {Link} from 'react-router-dom';
import {isRoleGrantedToUser} from '../../Api/client';
import {Entity} from '../../Api/Model';
import {compareFields} from '../../Utility/object';
import {Manager} from '../Manager/Manager';
import {ManagerHeader} from '../Manager/ManagerHeader';
import {RefreshButton} from '../Manager/RefreshButton';
import {RowControls} from '../Manager/RowControls';
import {Role} from '../RequireRole';
import {SearchInput} from '../Search';

export const createEntityFilter = <T extends Entity>(key: keyof T) => (record: T, search: string) => {
	let value: any = record[key];

	if (typeof value === 'number')
		value = value.toString(10);
	else if (typeof value !== 'string')
		throw new Error('This function can only operate on string or number values');

	return value.toLowerCase().indexOf(search) > -1;
};

export const createEntitySorter = <T extends Entity>(key: keyof T) => (a: T, b: T) => compareFields(key, a, b);

interface IProps<T extends Entity> {
	basePath: string;
	columns: Array<IColumn<T>>;
	entities: T[];
	noDataPlaceholder: React.ReactNode;
	title: string;

	loading?: boolean;
	onDeleteClick?: (entity: T) => Promise<void>;
	onRefreshClick?: () => void;
}

interface IState<T> {
	columns: Array<IColumn<T>>;
	search: string;
}

export class EntityList<T extends Entity> extends React.PureComponent<IProps<T>, IState<T>> {
	public static defaultProps: Partial<IProps<Entity>> = {
		loading: false,
	};

	public constructor(props: IProps<T>) {
		super(props);

		this.state = this.getBaseState();
	}

	public componentDidUpdate(prevProps: Readonly<IProps<T>>): void {
		if (this.props.entities === prevProps.entities && this.props.columns === prevProps.columns)
			return;

		this.setState(this.getBaseState());
	}

	public render(): React.ReactNode {
		return (
			<Manager>
				<ManagerHeader
					title={this.props.title}
					refresh={this.props.onRefreshClick && <RefreshButton onRefresh={this.props.onRefreshClick} />}
					search={<SearchInput onSearch={this.onSearchInputChange} />}
				/>

				{isRoleGrantedToUser(Role.EDITOR) && (
					<Row align="end">
						<Cell size={2}>
							<Link to={`${this.props.basePath}/new`} className="plain-link">
								<Button icon="plus">
									Add New
								</Button>
							</Link>
						</Cell>
					</Row>
				)}

				<Table
					dataSource={this.props.entities}
					columns={this.state.columns}
					fullWidth={true}
					htmlTableProps={{
						interactive: true,
						striped: true,
					}}
					loading={this.props.loading}
					noDataPlaceholder={this.props.noDataPlaceholder}
					pageSize={20}
					rowKey="id"
					searchText={this.state.search}
				/>
			</Manager>
		);
	}

	private onSearchInputChange = (search: string) => this.setState({
		search: search.toLowerCase(),
	});

	private getBaseState = (): IState<T> => {
		const Controls = RowControls.ofType<T>();

		return {
			columns: [
				...this.props.columns,
				{
					align: 'right',
					render: record => (
						<Controls
							entity={record}
							editPath={`${this.props.basePath}/${record.id}`}
							onDelete={this.props.onDeleteClick}
						/>
					),
					style: {
						width: 200,
					},
					title: <span>&nbsp;</span>,
				},
			],
			search: '',
		};
	};

	public static ofType<T extends Entity>() {
		return EntityList as new (props: IProps<T>) => EntityList<T>;
	}
}
