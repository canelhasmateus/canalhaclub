// The module 'vscode' contains the VS Code extensibility API
import * as vscode from "vscode"


type Direction = 'up' | 'down'
type Maybe<T> = T | undefined
const SCROLL_COMMAND = "editorScroll"
const EXTENSION_NAME = "partial-navigation"
const RATIO_COMMAND = `${ EXTENSION_NAME }.scroll`

function scrollRatio(): Number {
	return vscode.workspace.getConfiguration( EXTENSION_NAME ).ratio
}

function scrollLength(): Number {
	return scrollRatio()
}

function createScrollCommand( direction: Direction ) {
	return async () => {
		vscode.commands.executeCommand( SCROLL_COMMAND, {
			to: direction,
			value: scrollLength()
		}
		)
	}
}

function registerScroll( direction: Direction ): vscode.Disposable {
	const commandName = createCommandName( direction )
	const command = createScrollCommand( direction )
	return vscode.commands.registerCommand( commandName, command )
}

function getConfiguration(): vscode.WorkspaceConfiguration {
	return vscode.workspace.getConfiguration( EXTENSION_NAME )
}

function createCommandName( direction: Direction ): string {
	return `${ EXTENSION_NAME }.${ direction }`
}

function isValidNumber( input: any ): Maybe<string> {
	const ratio = Number( input )
	if ( isNaN( ratio ) ) {
		return "Invalid input. Make sure it is a number, representing the ratio of the viewport to scroll by."
	}
	return undefined
}

function updateConfiguration( ratio: Number ): void {
	getConfiguration().update( "ratio", ratio, vscode.ConfigurationTarget.Global )
}
function display( message: string, duration: number = 5000 ): void {
	vscode.window.setStatusBarMessage( message, duration )
}

async function updateInput(): Promise<any> {
	const input: Maybe<string> = await vscode.window.showInputBox( {
		value: scrollRatio().toString(),
		prompt: "Ratio of viewport to scroll",
		validateInput: isValidNumber
	} )

	// End if input box closed after losing focus or if user pressed esc or if user pressed enter with no input
	if ( input === undefined || input === "" )
		return


	const ratio = parseFloat( input )


	if ( isValidNumber( ratio ) ) {
		display( `Partial Navigation: Invalid Scroll By Lines value '${ input }'` )
		return
	}


	updateConfiguration( ratio )
	display( `Partial Navigation: ratio updated to '${ ratio }'` )
}

function registerSetRatioCommand( name: string ): vscode.Disposable {
	return vscode.commands.registerCommand( RATIO_COMMAND, updateInput )
}

export async function activate( context: vscode.ExtensionContext ) {

	const registeredSetRatio = registerSetRatioCommand( RATIO_COMMAND )
	const registeredScrollUp = registerScroll( "up" )
	const registeredScrollDown = registerScroll( "down" )

	context.subscriptions.push( registeredScrollUp )
	context.subscriptions.push( registeredScrollDown )
	context.subscriptions.push( registeredSetRatio )

}



export function deactivate() {
	// No clean up code required for this extension
}
