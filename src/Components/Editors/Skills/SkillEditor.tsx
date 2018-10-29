import {Button, FormGroup, H2, H3, InputGroup, Intent, Spinner, TextArea} from '@blueprintjs/core';
import * as React from 'react';
import {Redirect, RouteComponentProps, withRouter} from 'react-router';
import {ISkillRank} from '../../../Api/Objects/Skill';
import {IApiClientAware, withApiClient} from '../../Contexts/ApiClientContext';
import {IToasterAware, withToasterContext} from '../../Contexts/ToasterContext';
import {Cell, Row} from '../../Grid';
import {SkillRankEditor} from './SkillRankEditor';

interface IRouteProps {
	skill: string;
}

interface ISkillEditorProps extends IApiClientAware, IToasterAware, RouteComponentProps<IRouteProps> {
}

interface ISkillEditorState {
	description: string;
	loading: boolean;
	name: string;
	ranks: ISkillRank[];
	redirect: boolean;
	saving: boolean;
}

class SkillEditorComponent extends React.PureComponent<ISkillEditorProps, ISkillEditorState> {
	public state: Readonly<ISkillEditorState> = {
		description: '',
		loading: true,
		name: '',
		ranks: [],
		redirect: false,
		saving: false,
	};

	public componentDidMount(): void {
		this.loadSkill();
	}

	public render(): React.ReactNode {
		if (this.state.loading)
			return <Spinner intent={Intent.PRIMARY} />;
		else if (this.state.redirect)
			return <Redirect to="/edit/skills" />;

		return (
			<>
				<H2>{this.state.name.length ? this.state.name : 'Unnamed'}</H2>

				<form>
					<Row>
						<Cell size={6}>
							<FormGroup label="Name" labelFor="name">
								<InputGroup name="name" onChange={this.onNameChange} value={this.state.name} />
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
									value={this.state.description}
								/>
							</FormGroup>
						</Cell>
					</Row>

					<H3>Skill Ranks</H3>

					{this.state.ranks.map(this.renderRank)}

					<Row>
						<Cell size={2}>
							<Button icon="plus" onClick={this.onAddRankClick}>
								New Rank
							</Button>
						</Cell>
					</Row>
				</form>
			</>
		);
	}

	private renderRank = (rank: ISkillRank) => (
		<Row key={rank.id}>
			<Cell size={12}>
				<SkillRankEditor rank={rank} onDelete={this.onRankDelete} />
			</Cell>
		</Row>
	);

	private onAddRankClick = () => {
		this.setState({
			ranks: [...this.state.ranks, {level: this.state.ranks.length + 1}],
		});
	};

	private onDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => this.setState({
		description: event.currentTarget.value,
	});

	private onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => this.setState({
		name: event.currentTarget.value,
	});

	private onRankDelete = (target: ISkillRank) => {
		const ranks = this.state.ranks
			.filter(rank => rank !== target)
			.map(rank => {
				if (rank.level > target.level)
					rank.level -= 1;

				return {...rank};
			});

		this.setState({
			ranks,
		});
	};

	private loadSkill = () => {
		const idParam = this.props.match.params.skill;

		if (idParam === 'new') {
			this.setState({
				loading: false,
			});

			return;
		}

		this.props.client.skills.get(parseInt(idParam, 10)).then(skill => this.setState({
			description: skill.description,
			loading: false,
			name: skill.name,
			ranks: skill.ranks,
		}));
	};
}

export const SkillEditor = withApiClient(withToasterContext(withRouter(SkillEditorComponent)));