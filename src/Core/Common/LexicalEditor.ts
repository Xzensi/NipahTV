import { Logger } from './Logger'

const logger = new Logger()
const { log, error } = logger.destruct()

export default class LexicalEditor {
	private commandSignatureKeywords: Record<string, string[] | RegExp>
	private mappedCommands: Record<string, any>
	private editorRootElement: EventTarget | null = null

	constructor(private editor: any) {
		// Define keyword arrays or RegExp for different command types
		this.commandSignatureKeywords = {
			submit: ['preventDefault', 'dispatchCommand', 'shiftKey'], // Robust: Core event properties and methods for Enter/Shift+Enter
			clear: ['.clear()', '!0'], // Targets .clear() method call and common `return true`
			removeText: ['.removeText()', '!0'], // Targets .removeText() and `return true`
			deleteCharacter: ['.deleteCharacter(', '!0'], // Targets .deleteCharacter( method call and `return true`
			deleteWord: ['.deleteWord(', '!0'], // Targets .deleteWord( method call and `return true`
			deleteLine: ['.deleteLine(', '!0'], // Targets .deleteLine( method call and `return true`
			insertText: ['.insertText(', '"string"==typeof'], // Targets .insertText( and the string type check
			formatText: ['.formatText(', '!0'], // Targets .formatText( method call and `return true`
			insertLineBreak: ['.insertLineBreak(', '!0'], // Targets .insertLineBreak( method call and `return true`
			insertParagraph: ['.insertParagraph()', '!0'], // Targets .insertParagraph() method call and `return true`
			undo: ['undoStack', '.pop()', 'redoStack'], // Targets core undo logic: undoStack, pop, redoStack interaction
			redo: ['redoStack', '.pop()', 'undoStack'], // Targets core redo logic: redoStack, pop, undoStack interaction
			resendMessage: ['lastSentMessage', 'preventDefault'], // Specific state property and common event method
			cancelReply: ['currentReplyingMessage', 'setReplyingMessage'], // Specific state properties/methods for reply feature
			blur: ['.blur()', '!0'], // Targets .blur() method call and `return true`
			slashCommandEnter: /^(\w+)=>!!\1&&(\w+)\(\1\)$/ // Matches e => !!e && n(e)
		}

		this.mappedCommands = {}
		for (const commandName in this.commandSignatureKeywords) {
			const pattern = this.commandSignatureKeywords[commandName]
			// Skip placeholder patterns
			if (pattern instanceof Array && pattern.length === 0) {
				log('COMMON', 'LEXICAL', `Skipping placeholder command '${commandName}'.`)
				continue
			}
			const foundCommand = this.findCommandByPattern(pattern)
			if (foundCommand) {
				this.mappedCommands[commandName] = foundCommand
				log('COMMON', 'LEXICAL', `Mapped command '${commandName}':`, foundCommand)
			} else {
				if (commandName !== 'slashCommandEnter') {
					error('COMMON', 'LEXICAL', `Could not find and map command '${commandName}'.`)
				} else {
					error('COMMON', 'LEXICAL', `Optional command '${commandName}' not found or not mapped.`)
				}
			}
		}

		if (typeof editor.getRootElement === 'function') {
			this.editorRootElement = editor.getRootElement()

			if (this.editorRootElement) {
				log('COMMON', 'LEXICAL', 'Editor root element cached:', this.editorRootElement)
			} else {
				throw new Error('Editor root element is null. Cannot proceed with operations that require it.')
			}
		} else {
			throw new Error(
				'Editor does not have a getRootElement() method. Cannot proceed with operations that require it.'
			)
		}
	}

	appendText(text: string, addSpace: boolean = false): void {
		const editor = this.editor

		editor.focus(() => {
			editor.update(() => {
				const state = editor.getEditorState()
				const root = state._nodeMap.get('root')

				const TextNodeClass = editor._nodes.get('text')?.klass
				const ParagraphNodeClass = editor._nodes.get('paragraph')?.klass

				if (!TextNodeClass || !ParagraphNodeClass) {
					throw new Error('TextNode or ParagraphNode class not found.')
				}

				const lastRootChild = root.getLastChild()

				if (lastRootChild instanceof ParagraphNodeClass) {
					const currentParagraph = lastRootChild
					const lastNodeInParagraph = currentParagraph.getLastChild()

					if (lastNodeInParagraph instanceof TextNodeClass) {
						// Case 1: Last node in paragraph is a TextNode. Append text to its content.
						const existingTextNode = lastNodeInParagraph
						const currentText = existingTextNode.getTextContent()
						let textToSet = ''

						if (addSpace && currentText.length > 0 && !currentText.endsWith(' ')) {
							textToSet += ' '
						}
						textToSet += text

						existingTextNode.setTextContent(currentText + textToSet)
						currentParagraph.selectEnd()
					} else {
						// Case 2: Paragraph's last child is not a TextNode (or paragraph is empty).
						// Append a new TextNode to the paragraph.
						let textToSet = ''
						const paragraphContentBeforeAppend = currentParagraph.getTextContent()

						if (
							addSpace &&
							paragraphContentBeforeAppend.length > 0 &&
							!paragraphContentBeforeAppend.endsWith(' ')
						) {
							textToSet += ' '
						}
						textToSet += text

						const newNode = new TextNodeClass(textToSet)
						currentParagraph.append(newNode)
						currentParagraph.selectEnd()
					}
				} else {
					// Case 3: Root's last child is not a ParagraphNode (or root is empty).
					// Create a new paragraph, add a new TextNode to it.
					const newParagraph = new ParagraphNodeClass()
					// For a new paragraph, addSpace doesn't automatically prepend a space
					// as there's no "existing content" in this new paragraph to check against.
					// If a space is needed before `text` here, it should be part of `text` itself or handled by the caller.
					const newNode = new TextNodeClass(text)
					newParagraph.append(newNode)
					root.append(newParagraph)
					newParagraph.selectEnd()
				}
			})
		})

		editor.blur()
	}

	setTextContent(text: string): void {
		const editor = this.editor

		editor.focus(() => {
			editor.update(() => {
				const state = editor.getEditorState()
				const root = state._nodeMap.get('root')

				const TextNode = editor._nodes.get('text')?.klass
				const ParagraphNode = editor._nodes.get('paragraph')?.klass

				if (!TextNode || !ParagraphNode) {
					throw new Error('TextNode or ParagraphNode class not found.')
				}

				while (root.getFirstChild()) {
					root.getFirstChild().remove()
				}

				const paragraph = new ParagraphNode()
				const newNode = new TextNode(text)
				paragraph.append(newNode)
				paragraph.selectEnd()
				root.append(paragraph)
			})
		})

		editor.blur()
	}

	/**
	 * Find a command whose listener function source matches the specified pattern (keywords or RegExp).
	 */
	private findCommandByPattern(pattern: string[] | RegExp): any {
		const editor = this.editor
		for (const [command, listenersSets] of editor._commands.entries()) {
			for (const listeners of listenersSets) {
				for (const listener of listeners) {
					const fnStr = listener.toString()
					if (pattern instanceof RegExp) {
						if (pattern.test(fnStr)) {
							return command
						}
					} else {
						if (pattern.every(kw => fnStr.includes(kw))) {
							return command
						}
					}
				}
			}
		}
		return null
	}

	/**
	 * Programmatically submit the editor content as if Enter was pressed.
	 */
	submit(): void {
		const editor = this.editor
		const command = this.mappedCommands.submit

		if (command) {
			const mockEnterEvent = new KeyboardEvent('keydown', {
				key: 'Enter',
				code: 'Enter',
				keyCode: 13,
				which: 13,
				bubbles: true,
				cancelable: true
			})

			const eventTarget = this.editorRootElement

			if (eventTarget) {
				Object.defineProperty(mockEnterEvent, 'target', { value: eventTarget, enumerable: true })
				Object.defineProperty(mockEnterEvent, 'currentTarget', { value: eventTarget, enumerable: true })
			} else {
				error(
					'COMMON',
					'LEXICAL',
					'Could not determine event target for submit(). Event will be dispatched without a specific target.'
				)
			}

			editor.dispatchCommand(command, mockEnterEvent)
			log('COMMON', 'LEXICAL', 'Dispatched Enter/submit command with mock event:', command)
		} else {
			throw new Error('Submit command not mapped. Cannot dispatch.')
		}
	}

	/**
	 * Programmatically executes a slash command (e.g., "/clear") by setting the editor content
	 * and then dispatching the 'slashCommandEnter' Lexical command.
	 * @param slashCommandText The slash command string (e.g., "/clear").
	 */
	async executeSlashCommand(slashCommandText: string): Promise<void> {
		const editor = this.editor
		const command = this.mappedCommands.slashCommandEnter

		if (!command) {
			throw new Error("'slashCommandEnter' command not mapped. Cannot execute slash command.")
		}

		this.setTextContent('/')

		await new Promise(resolve => setTimeout(resolve, 0)) // Micro-task to ensure editor state is updated

		this.appendText(slashCommandText)

		await new Promise(resolve => setTimeout(resolve, 0))

		const mockEnterEvent = new KeyboardEvent('keydown', {
			key: 'Enter',
			code: 'Enter',
			keyCode: 13,
			which: 13,
			bubbles: true,
			cancelable: true
		})

		const eventTarget = this.editorRootElement

		if (eventTarget) {
			Object.defineProperty(mockEnterEvent, 'target', { value: eventTarget, enumerable: true })
			Object.defineProperty(mockEnterEvent, 'currentTarget', { value: eventTarget, enumerable: true })
		} else {
			error(
				'COMMON',
				'LEXICAL',
				'Could not determine event target for executeSlashCommand. Event will be dispatched without a specific target.'
			)
		}

		editor.dispatchCommand(command, mockEnterEvent)
		log('COMMON', 'LEXICAL', `Dispatched 'slashCommandEnter' for text "${slashCommandText}":`, command)
	}
}
