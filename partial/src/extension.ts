import * as vscode from 'vscode';

const COMMAND_NAME = 'partial.navigateCursor';
type NavigateArguments = { ratio: number, select: boolean; };
type Maybe<T> = T | null | undefined;
type Directions = 'up' | 'down';

const Direction = {

	of: ( ratio: number ): Directions => {

		if ( ratio > 0 ) {
			return 'up';
		}
		return 'down';
	}
};
const JumpSize = {
	of: ( range: vscode.Range, ratio: number ): number => {

		let hi = range?.start.line;
		let lo = range?.end.line;

		if ( hi === undefined || lo === undefined ) {
			return 0;
		}

		let jumpSize = ( hi - lo ) * ratio;

		return Math.round( jumpSize );
	}
};
const Editor = {

	get: (): Maybe<vscode.TextEditor> => {

		return vscode.window.activeTextEditor;
	}
};

function validateArguments( arg: any ): Maybe<NavigateArguments> {

	var ratio: Maybe<any> = arg.ratio;
	let select: Maybe<any> = arg.ratio ?? false;

	if ( ratio === undefined || ratio === null ) {
		vscode.window.showInformationMessage( "Navigate Cursor should receive a 'ratio' argument." );
		return;
	}

	ratio = parseFloat( ratio );

	if ( isNaN( ratio ) ) {
		vscode.window.showInformationMessage( "Make sure the ratio key contains a number." );
		return;
	}

	return { ratio: ratio, select: select === 'true' };
}


function movement( direction: Directions, size: number, select: boolean ) {
	return { to: direction, by: 'wrappedLine', value: size, select: select };
}


async function navigateCursor( a: any ) {

	let args = validateArguments( a );
	let editor = Editor.get();

	if ( args === undefined || args === null ) {
		return;
	}
	if ( editor === undefined || editor === null ) {
		return;
	}

	let ranges = editor.visibleRanges[ 0 ];
	let jumpSize = JumpSize.of( ranges, args.ratio );
	let direction = Direction.of( jumpSize );
	let selection = args.select;
	await vscode.commands.executeCommand( "cursorMove", movement( direction, Math.abs( jumpSize ), selection ) );

}

export function activate( context: vscode.ExtensionContext ) {

	let disposable = vscode.commands.registerCommand( COMMAND_NAME, navigateCursor );

	context.subscriptions.push( disposable );

}

// this method is called when your extension is deactivated
export function deactivate() { }
