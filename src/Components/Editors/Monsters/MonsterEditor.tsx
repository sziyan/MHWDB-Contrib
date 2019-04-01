import {H2, H3, InputGroup, Intent, Spinner, TextArea} from '@blueprintjs/core';
import {Cell, MultiSelect, Row, Select} from '@dbstudios/blueprintjs-components';
import * as React from 'react';
import {Redirect, RouteComponentProps, withRouter} from 'react-router';
import {IConstraintViolations} from '../../../Api/Error';
import {Ailment, AilmentModel} from '../../../Api/Models/Ailment';
import {Location, LocationModel} from '../../../Api/Models/Location';
import {
	MonsterModel,
	MonsterResistance,
	MonsterSpecies,
	MonsterType,
	MonsterWeakness,
} from '../../../Api/Models/Monster';
import {Element} from '../../../Api/Models/Weapon';
import {createEntityListFilter, filterStrings} from '../../../Utility/select';
import {ucfirst, ucwords} from '../../../Utility/string';
import {ValidationAwareFormGroup} from '../../ValidationAwareFormGroup';
import {ailmentsSorter} from '../Ailments/AilmentList';
import {locationSorter} from '../Locations/LocationList';
import {MonsterResistancesEditor} from './MonsterResistancesEditor';
import {MonsterWeaknessesEditor} from './MonsterWeaknessesEditor';

const ailmentsListFilter = createEntityListFilter<Ailment>('name');
const locationsListFilter = createEntityListFilter<Location>('name');

interface IRouteProps {
	monster: string;
}

interface IProps extends RouteComponentProps<IRouteProps> {
}

interface IState {
	ailments: Ailment[];
	ailmentsList: Ailment[];
	description: string;
	elements: Element[];
	loading: boolean;
	locations: Location[];
	locationsList: Location[];
	name: string;
	redirect: boolean;
	resistances: MonsterResistance[];
	saving: boolean;
	species: MonsterSpecies;
	type: MonsterType;
	violations: IConstraintViolations;
	weaknesses: MonsterWeakness[];
}

class MonsterEditorComponent extends React.PureComponent<IProps, IState> {
	public state: Readonly<IState> = {
		ailments: [],
		ailmentsList: null,
		description: '',
		elements: [],
		loading: true,
		locations: [],
		locationsList: null,
		name: '',
		redirect: false,
		resistances: [],
		saving: false,
		species: null,
		type: null,
		violations: {},
		weaknesses: [],
	};

	public componentDidMount(): void {
		const ailmentsPromise = AilmentModel.list().then(response => response.data.sort(ailmentsSorter));
		const locationsPromise = LocationModel.list().then(response => response.data.sort(locationSorter));

		const idParam = this.props.match.params.monster;

		if (idParam === 'new') {
			this.setState({
				loading: false,
			});

			ailmentsPromise.then(ailmentsList => this.setState({
				ailmentsList,
			}));

			locationsPromise.then(locationsList => this.setState({
				locationsList,
			}));

			return;
		}

		MonsterModel.read(idParam).then(response => {
			const monster = response.data;

			this.setState({
				description: monster.description,
				elements: monster.elements,
				loading: false,
				name: monster.name,
				resistances: monster.resistances,
				species: monster.species,
				type: monster.type,
				weaknesses: monster.weaknesses,
			});

			ailmentsPromise.then(ailmentsList => {
				const ailmentIds = monster.ailments.map(ailment => ailment.id);
				const ailments: Ailment[] = [];

				for (const ailment of ailmentsList) {
					if (ailmentIds.indexOf(ailment.id) !== -1)
						ailments.push(ailment);
				}

				this.setState({
					ailments,
					ailmentsList,
				});
			});

			locationsPromise.then(locationsList => {
				const locationIds = monster.locations.map(location => location.id);
				const locations: Location[] = [];

				for (const location of locationsList) {
					if (locationIds.indexOf(location.id) !== -1)
						locations.push(location);
				}

				this.setState({
					locations,
					locationsList,
				});
			});
		});
	}

	public render(): React.ReactNode {
		if (this.state.loading)
			return <Spinner intent={Intent.PRIMARY} />;
		else if (this.state.redirect)
			return <Redirect to="/edit/monsters" />;

		return (
			<>
				<H2>{this.state.name || 'No Name'}</H2>

				<form onSubmit={this.save}>
					<Row>
						<Cell size={6}>
							<ValidationAwareFormGroup label="Name" labelFor="name" violations={this.state.violations}>
								<InputGroup name="name" onChange={this.onNameChange} value={this.state.name} />
							</ValidationAwareFormGroup>
						</Cell>

						<Cell size={6}>
							<ValidationAwareFormGroup
								label="Description"
								labelFor="description"
								violations={this.state.violations}
							>
								<TextArea
									name="description"
									onChange={this.onDescriptionChange}
									style={{
										minHeight: 50,
										minWidth: '100%',
									}}
									value={this.state.description}
								/>
							</ValidationAwareFormGroup>
						</Cell>
					</Row>

					<Row>
						<Cell size={6}>
							<ValidationAwareFormGroup label="Type" labelFor="type" violations={this.state.violations}>
								<Select
									filterable={false}
									items={Object.values(MonsterType)}
									itemTextRenderer={this.renderTypeText}
									onItemSelect={this.onTypeSelect}
									popoverProps={{
										targetClassName: 'full-width',
									}}
									selected={this.state.type}
								/>
							</ValidationAwareFormGroup>
						</Cell>

						<Cell size={6}>
							<ValidationAwareFormGroup
								label="Species"
								labelFor="species"
								violations={this.state.violations}
							>
								<Select
									filterable={false}
									items={Object.values(MonsterSpecies)}
									itemTextRenderer={this.renderSpeciesText}
									onItemSelect={this.onSpeciesSelect}
									popoverProps={{
										targetClassName: 'full-width',
									}}
									selected={this.state.species}
								/>
							</ValidationAwareFormGroup>
						</Cell>
					</Row>

					<Row>
						<Cell size={4}>
							<ValidationAwareFormGroup
								label="Elements"
								labelFor="elements"
								violations={this.state.violations}
							>
								<MultiSelect
									itemListPredicate={filterStrings}
									items={Object.values(Element)}
									itemTextRenderer={this.renderElementText}
									onClear={this.onElementsClear}
									onItemDeselect={this.onElementDeselect}
									onItemSelect={this.onElementSelect}
									popoverProps={{
										targetClassName: 'full-width',
									}}
									selected={this.state.elements}
								/>
							</ValidationAwareFormGroup>
						</Cell>

						<Cell size={4}>
							<ValidationAwareFormGroup
								label="Ailments"
								labelFor="ailments"
								violations={this.state.violations}
							>
								<MultiSelect
									itemKey="id"
									itemListPredicate={ailmentsListFilter}
									items={this.state.ailmentsList}
									itemTextRenderer={this.renderAilmentText}
									loading={this.state.ailmentsList === null}
									onClear={this.onAilmentsClear}
									onItemDeselect={this.onAilmentDeselect}
									onItemSelect={this.onAilmentSelect}
									popoverProps={{
										targetClassName: 'full-width',
									}}
									selected={this.state.ailments}
								/>
							</ValidationAwareFormGroup>
						</Cell>

						<Cell size={4}>
							<ValidationAwareFormGroup
								label="Locations"
								labelFor="Locations"
								violations={this.state.violations}
							>
								<MultiSelect
									itemListPredicate={locationsListFilter}
									items={this.state.locationsList}
									itemTextRenderer={this.renderLocationText}
									loading={this.state.locationsList === null}
									onClear={this.onLocationsClear}
									onItemDeselect={this.onLocationDeselect}
									onItemSelect={this.onLocationSelect}
									popoverProps={{
										targetClassName: 'full-width',
									}}
									selected={this.state.locations}
								/>
							</ValidationAwareFormGroup>
						</Cell>
					</Row>

					<Row>
						<Cell size={6}>
							<H3>Resistances</H3>

							<MonsterResistancesEditor
								onChange={this.onResistancesChange}
								resistances={this.state.resistances}
							/>
						</Cell>

						<Cell size={6}>
							<H3>Weaknesses</H3>

							<MonsterWeaknessesEditor
								onChange={this.onWeaknessesChange}
								weaknesses={this.state.weaknesses}
							/>
						</Cell>
					</Row>
				</form>
			</>
		);
	}

	private renderAilmentText = (ailment: Ailment) => ailment.name;

	private renderElementText = (element: Element) => ucfirst(element);

	private renderLocationText = (location: Location) => location.name;

	private renderSpeciesText = (species: MonsterSpecies) => ucwords(species);

	private renderTypeText = (type: MonsterType) => ucfirst(type);

	private onAilmentsClear = () => this.setState({
		ailments: [],
	});

	private onAilmentDeselect = (target: Ailment) => this.setState({
		ailments: this.state.ailments.filter(ailment => ailment !== target),
	});

	private onAilmentSelect = (ailment: Ailment) => this.setState({
		ailments: [...this.state.ailments, ailment],
	});

	private onDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => this.setState({
		description: event.currentTarget.value,
	});

	private onElementsClear = () => this.setState({
		elements: [],
	});

	private onElementDeselect = (target: Element) => this.setState({
		elements: this.state.elements.filter(element => element !== target),
	});

	private onElementSelect = (element: Element) => this.setState({
		elements: [...this.state.elements, element],
	});

	private onLocationsClear = () => this.setState({
		locations: [],
	});

	private onLocationDeselect = (target: Location) => this.setState({
		locations: this.state.locations.filter(location => location !== target),
	});

	private onLocationSelect = (location: Location) => this.setState({
		locations: [...this.state.locations, location],
	});

	private onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => this.setState({
		name: event.currentTarget.value,
	});

	private onResistancesChange = (resistances: MonsterResistance[]) => this.setState({
		resistances,
	});

	private onSpeciesSelect = (species: MonsterSpecies) => this.setState({
		species,
	});

	private onTypeSelect = (type: MonsterType) => this.setState({
		type,
	});

	private onWeaknessesChange = (weaknesses: MonsterWeakness[]) => this.setState({
		weaknesses,
	});

	private save = (event?: React.SyntheticEvent<any>) => {
		if (event)
			event.preventDefault();

		if (this.state.saving)
			return;

		this.setState({
			saving: true,
		});
	};
}

export const MonsterEditor = withRouter(MonsterEditorComponent);