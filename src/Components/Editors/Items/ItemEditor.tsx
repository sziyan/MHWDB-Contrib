import {FormGroup, H2, InputGroup, Intent, Spinner, TextArea} from '@blueprintjs/core';
import {Cell, Row} from '@dbstudios/blueprintjs-components';
import * as React from 'react';
import {Redirect, RouteComponentProps, withRouter} from 'react-router';
import {isRoleGrantedToUser} from '../../../Api/client';
import {ItemModel, ItemPayload} from '../../../Api/Models/Item';
import {Projection} from '../../../Api/routes';
import {toaster} from '../../../toaster';
import {cleanNumberString} from '../../../Utility/number';
import {Role} from '../../RequireRole';
import {EditorButtons} from '../EditorButtons';

const toInteger = (input: string): number => {
	const value = parseInt(input, 10);

	return isNaN(value) ? 0 : value;
};

interface IRouteProps {
	item: string;
}

interface IItemEditorProps extends RouteComponentProps<IRouteProps> {
}

interface IItemEditorState {
	carryLimit: string;
	description: string;
	loading: boolean;
	name: string;
	rarity: string;
	redirect: boolean;
	saving: boolean;
	value: string;
}

class ItemEditorComponent extends React.PureComponent<IItemEditorProps, IItemEditorState> {
	public state: Readonly<IItemEditorState> = {
		carryLimit: '0',
		description: '',
		loading: true,
		name: '',
		rarity: '0',
		redirect: false,
		saving: false,
		value: '0',
	};

	public componentDidMount(): void {
		const idParam = this.props.match.params.item;

		if (idParam === 'new') {
			this.setState({
				loading: false,
			});

			return;
		}

		ItemModel.read(idParam).then(response => {
			const item = response.data;

			this.setState({
				carryLimit: item.carryLimit.toString(10),
				description: item.description,
				loading: false,
				name: item.name,
				rarity: item.rarity.toString(10),
				value: item.value.toString(10),
			});
		});
	}

	public render(): React.ReactNode {
		if (this.state.loading)
			return <Spinner intent={Intent.PRIMARY} />;
		else if (this.state.redirect)
			return <Redirect to="/objects/items" />;

		const readOnly = !isRoleGrantedToUser(Role.EDITOR);

		return (
			<>
				<H2>{this.state.name || 'No Name'}</H2>

				<form>
					<Row>
						<Cell size={6}>
							<FormGroup label="Name" labelFor="name">
								<InputGroup
									name="name"
									onChange={this.onNameChange}
									readOnly={readOnly}
									value={this.state.name}
								/>
							</FormGroup>
						</Cell>

						<Cell size={2}>
							<FormGroup label="Rarity" labelFor="rarity">
								<InputGroup
									name="rarity"
									onChange={this.onRarityChange}
									readOnly={readOnly}
									value={this.state.rarity}
								/>
							</FormGroup>
						</Cell>

						<Cell size={2}>
							<FormGroup label="Value" labelFor="value">
								<InputGroup
									name="value"
									onChange={this.onValueChange}
									readOnly={readOnly}
									value={this.state.value}
								/>
							</FormGroup>
						</Cell>

						<Cell size={2}>
							<FormGroup label="Carry Limit" labelFor="carryLimit">
								<InputGroup
									name="carryLimit"
									onChange={this.onCarryLimitChange}
									readOnly={readOnly}
									value={this.state.carryLimit}
								/>
							</FormGroup>
						</Cell>
					</Row>

					<Row>
						<Cell size={12}>
							<FormGroup label="Description" labelFor="description">
								<TextArea
									fill={true}
									name="description"
									onChange={this.onDescriptionChange}
									readOnly={readOnly}
									value={this.state.description}
								/>
							</FormGroup>
						</Cell>
					</Row>

					<EditorButtons
						onClose={this.onClose}
						onSave={this.save}
						readOnly={readOnly}
						saving={this.state.saving}
					/>
				</form>
			</>
		);
	}

	private onCarryLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => this.setState({
		carryLimit: cleanNumberString(event.currentTarget.value, false),
	});

	private onClose = () => this.setState({
		redirect: true,
	});

	private onDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => this.setState({
		description: event.currentTarget.value,
	});

	private onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => this.setState({
		name: event.currentTarget.value,
	});

	private onRarityChange = (event: React.ChangeEvent<HTMLInputElement>) => this.setState({
		rarity: cleanNumberString(event.currentTarget.value, false),
	});

	private onValueChange = (event: React.ChangeEvent<HTMLInputElement>) => this.setState({
		value: cleanNumberString(event.currentTarget.value, false),
	});

	private save = (event?: React.SyntheticEvent<any>) => {
		if (event)
			event.preventDefault();

		if (this.state.saving)
			return;

		this.setState({
			saving: true,
		});

		const payload: ItemPayload = {
			carryLimit: toInteger(this.state.carryLimit),
			description: this.state.description,
			name: this.state.name,
			rarity: toInteger(this.state.rarity),
			value: toInteger(this.state.value),
		};

		const projection: Projection = {
			name: true,
		};

		const idParam = this.props.match.params.item;
		let promise: Promise<unknown>;

		if (idParam === 'new')
			promise = ItemModel.create(payload, projection);
		else
			promise = ItemModel.update(parseInt(idParam, 10), payload, projection);

		promise.then(() => {
			toaster.show({
				intent: Intent.SUCCESS,
				message: `${this.state.name} ${idParam === 'new' ? 'created' : 'saved'} successfully.`,
			});

			this.setState({
				redirect: true,
			});
		}).catch((error: Error) => {
			toaster.show({
				intent: Intent.DANGER,
				message: error.message,
			});

			this.setState({
				saving: false,
			});
		});
	};
}

export const ItemEditor = withRouter(ItemEditorComponent);
