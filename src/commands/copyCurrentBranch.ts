import { env, TextEditor, Uri, window } from 'vscode';
import type { Container } from '../container';
import { GitUri } from '../git/gitUri';
import { Logger } from '../logger';
import { RepositoryPicker } from '../quickpicks';
import { ActiveEditorCommand, command, Commands, getCommandUri } from './common';

@command()
export class CopyCurrentBranchCommand extends ActiveEditorCommand {
	constructor(private readonly container: Container) {
		super(Commands.CopyCurrentBranch);
	}

	async execute(editor?: TextEditor, uri?: Uri) {
		uri = getCommandUri(uri, editor);

		const gitUri = uri != null ? await GitUri.fromUri(uri) : undefined;

		const repository = await RepositoryPicker.getBestRepositoryOrShow(gitUri, editor, 'Copy Current Branch Name');
		if (repository == null) return;

		try {
			const branch = await repository.getBranch();
			if (branch?.name) {
				await env.clipboard.writeText(branch.name);
			}
		} catch (ex) {
			Logger.error(ex, 'CopyCurrentBranchCommand');
			void window.showErrorMessage('Unable to copy current branch name. See output channel for more details');
		}
	}
}
