import type { Publisher } from '../../Classes/Publisher'
import { CheckboxComponent } from '../Components/CheckboxComponent'
import { DropdownComponent } from '../Components/DropdownComponent'
import { NumberComponent } from '../Components/NumberComponent'
import { ColorComponent } from '../Components/ColorComponent'
import { AbstractModal, ModalGeometry } from './AbstractModal'
import { log, error, parseHTML, cleanupHTML } from '../../utils'
import { CHANGELOG } from '../../changelog'

export class SettingsModal extends AbstractModal {
	eventBus: Publisher
	settingsOpts: any

	panelsEl?: HTMLElement
	sidebarEl?: HTMLElement
	sidebarBtnEl?: HTMLElement

	constructor(eventBus: Publisher, settingsOpts: any) {
		const geometry: ModalGeometry = {
			position: 'center'
		}

		super('settings', geometry)

		this.eventBus = eventBus
		this.settingsOpts = settingsOpts
	}

	init() {
		super.init()
		return this
	}

	render() {
		super.render()

		log('Rendering settings modal..')

		const sharedSettings = this.settingsOpts.sharedSettings
		const settingsMap = this.settingsOpts.settingsMap
		const modalBodyEl = this.modalBodyEl

		const windowWidth = window.innerWidth

		// Add version number to modal header
		const modalHeaderEl = this.modalHeaderBodyEl
		modalHeaderEl.prepend(
			parseHTML(
				cleanupHTML(`
					<svg class="ntv__modal__logo" alt="NipahTV" width="32" height="32" viewBox="0 0 16 16" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path style="opacity:1;fill:#ff3e64;fill-opacity:1;fill-rule:nonzero;stroke-width:0.0230583" d="M 0.2512317,15.995848 0.2531577,6.8477328 C 0.24943124,6.3032776 0.7989812,5.104041 1.8304975,4.5520217 2.4476507,4.2217505 2.9962666,4.1106784 4.0212875,4.0887637 5.0105274,4.067611 5.5052433,4.2710769 5.6829817,4.3608374 c 0.4879421,0.2263549 0.995257,0.7009925 1.134824,0.9054343 l 4.4137403,6.8270373 c 0.262057,0.343592 0.582941,0.565754 0.919866,0.529874 0.284783,-0.0234 0.4358,-0.268186 0.437049,-0.491242 l 0.003,-9.2749904 L 0.25,2.8575985 0.25004315,0 15.747898,2.1455645e-4 15.747791,13.08679 c -0.0055,0.149056 -0.09606,1.191174 -1.033875,2.026391 -0.839525,0.807902 -2.269442,0.879196 -2.269442,0.879196 -0.601658,0.0088 -1.057295,0.02361 -1.397155,-0.04695 -0.563514,-0.148465 -0.807905,-0.274059 -1.274522,-0.607992 -0.4091245,-0.311857 -0.6818768,-0.678904 -0.9118424,-0.98799 0,0 -1.0856521,-1.86285 -1.8718165,-3.044031 C 6.3863506,10.352753 5.3651096,8.7805786 4.8659674,8.1123589 4.4859461,7.5666062 4.2214229,7.4478431 4.0798053,7.3975803 3.9287117,7.3478681 3.7624996,7.39252 3.6345251,7.4474753 3.5213234,7.5006891 3.4249644,7.5987165 3.4078407,7.7314301 l 7.632e-4,8.2653999 z"/></svg>
					<span class="ntv__modal__version">v${NTV_APP_VERSION}</span>`)
			)
		)

		this.panelsEl = parseHTML(`<div class="ntv__settings-modal__panels"></div>`, true) as HTMLElement
		this.sidebarEl = parseHTML(
			`<div class="ntv__settings-modal__sidebar ${
				windowWidth < 768 ? '' : 'ntv__settings-modal__sidebar--open'
			}"><ul></ul></div>`,
			true
		) as HTMLElement
		this.sidebarBtnEl = parseHTML(
			`<div class="ntv__settings-modal__mobile-btn-wrapper"><button><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
			<path fill="currentColor" d="M2.753 18h18.5a.75.75 0 0 1 .101 1.493l-.101.007h-18.5a.75.75 0 0 1-.102-1.494zh18.5zm0-6.497h18.5a.75.75 0 0 1 .101 1.493l-.101.007h-18.5a.75.75 0 0 1-.102-1.494zh18.5zm-.001-6.5h18.5a.75.75 0 0 1 .102 1.493l-.102.007h-18.5A.75.75 0 0 1 2.65 5.01zh18.5z" />
		</svg> Menu</button></div>`,
			true
		) as HTMLElement

		const sidebarList = this.sidebarEl.querySelector('ul') as HTMLElement

		// Render navigation sidebar
		// Category > Subcategory > Group > Setting
		for (const category of sharedSettings) {
			const categoryEl = parseHTML(
				cleanupHTML(`
				<li class="ntv__settings-modal__category">
					<span>${category.label}</span>
					<ul></ul>
				</li>
			`),
				true
			)

			const categoryListEl = categoryEl.querySelector('ul') as HTMLElement
			sidebarList.appendChild(categoryEl)

			for (const subCategory of category.children) {
				const categoryId = `${category.label.toLowerCase()}.${subCategory.label.toLowerCase()}`
				const subCategoryEl = parseHTML(
					cleanupHTML(
						`<li data-panel="${categoryId}" class="ntv__settings-modal__sub-category">
						<span>${subCategory.label}</span>
					</li>`
					),
					true
				)

				categoryListEl.appendChild(subCategoryEl)
			}
		}

		// Render settings panels
		// Category > Subcategory > Group > Setting
		for (const category of sharedSettings) {
			for (const subCategory of category.children) {
				const categoryId = `${category.label.toLowerCase()}.${subCategory.label.toLowerCase()}`
				const subCategoryPanelEl = parseHTML(
					`<div data-panel="${categoryId}" class="ntv__settings-modal__panel" style="display: none"></div>`,
					true
				)

				if (subCategory.label === 'Changelog') {
					const changelogListEl = parseHTML('<ul></ul>', true)
					subCategoryPanelEl.appendChild(changelogListEl)

					for (const change of CHANGELOG) {
						const changeEl = parseHTML(
							cleanupHTML(
								`<li>
								<h4>${change.version} <span>(${change.date})</span></h4>
							</li>`
							),
							true
						)
						const descriptionEl = document.createElement('p')
						descriptionEl.textContent = change.description.trim().replace(/^[^\S\r\n]+/gm, '')
						changeEl.appendChild(descriptionEl)
						changelogListEl.appendChild(changeEl)
					}
				}

				for (const group of subCategory.children) {
					const groupEl = parseHTML(
						cleanupHTML(
							`<div class="ntv__settings-modal__group">
							<div class="ntv__settings-modal__group-header">
								<h4>${group.label}</h4>
								${group.description ? `<p>${group.description}</p>` : ''}
							</div>
						</div>`
						),
						true
					)
					subCategoryPanelEl.append(groupEl)

					for (const setting of group.children) {
						let settingComponent: any
						let settingValue = settingsMap.get(setting.id)
						if (typeof settingValue === 'undefined') {
							settingValue = setting.default
						}

						switch (setting.type) {
							case 'checkbox':
								settingComponent = new CheckboxComponent(setting.id, setting.label, settingValue)
								break
							case 'color':
								settingComponent = new ColorComponent(setting.id, setting.label, settingValue)
								break
							case 'dropdown':
								settingComponent = new DropdownComponent(
									setting.id,
									setting.label,
									setting.options,
									settingValue
								)
								break
							case 'number':
								settingComponent = new NumberComponent(
									setting.id,
									setting.label,
									settingValue,
									setting.min,
									setting.max,
									setting.step
								)
								break
							default:
								error(`No component found for setting type: ${setting.type}`)
								continue
						}

						settingComponent?.init()

						groupEl.append(settingComponent.element)
						settingComponent.event.addEventListener('change', () => {
							const value = settingComponent.getValue()
							this.eventTarget.dispatchEvent(
								new CustomEvent('setting_change', { detail: { id: setting.id, value } })
							)
						})
					}
				}

				this.panelsEl.appendChild(subCategoryPanelEl)
			}
		}

		// Show first panel
		const defaultPanel = 'nipahtv.changelog'
		this.panelsEl.querySelector(`[data-panel="${defaultPanel}"]`)?.setAttribute('style', 'display: block')
		this.sidebarEl
			.querySelector(`[data-panel="${defaultPanel}"]`)
			?.classList.add('ntv__settings-modal__sub-category--active')

		modalBodyEl.appendChild(this.sidebarBtnEl)
		modalBodyEl.appendChild(this.sidebarEl)
		modalBodyEl.appendChild(this.panelsEl)
	}

	getSettingElement(setting: string) {}

	attachEventHandlers() {
		super.attachEventHandlers()

		if (!this.panelsEl || !this.sidebarEl) {
			error('SettingsModal: panelsEl or sidebarEl not found')
			return
		}

		// Sidebar navigation
		// $('.ntv__settings-modal__sub-category', this.$sidebar).on('click', evt => {
		// 	const panelId = $(evt.currentTarget).data('panel')

		// 	$('.ntv__settings-modal__sub-category', this.$sidebar).removeClass(
		// 		'ntv__settings-modal__sub-category--active'
		// 	)
		// 	$(evt.currentTarget).addClass('ntv__settings-modal__sub-category--active')

		// 	$('.ntv__settings-modal__panel', this.$panels).hide()
		// 	$(`[data-panel="${panelId}"]`, this.$panels).show()
		// })

		// Vanilla javascript
		this.sidebarEl.querySelectorAll('.ntv__settings-modal__sub-category').forEach((el1: Element) => {
			el1.addEventListener('click', evt => {
				const panelId = (<HTMLElement>el1).dataset.panel

				this.sidebarEl!.querySelectorAll('.ntv__settings-modal__sub-category').forEach((el2: Element) => {
					el2.classList.remove('ntv__settings-modal__sub-category--active')
				})

				el1.classList.add('ntv__settings-modal__sub-category--active')

				this.panelsEl!.querySelectorAll('.ntv__settings-modal__panel').forEach((el2: Element) => {
					;(<HTMLElement>el2).style.display = 'none'
				})
				this.panelsEl!.querySelector(`[data-panel="${panelId}"]`)?.setAttribute('style', 'display: block')
			})
		})

		this.sidebarBtnEl!.addEventListener('click', () => {
			this.sidebarEl!.classList.toggle('ntv__settings-modal__sidebar--open')
		})
	}
}
