import { SteppedInputSliderLabeledComponent } from '../../UI/Components/SteppedInputSliderLabeledComponent'
import { AbstractModal, ModalGeometry } from '../../UI/Modals/AbstractModal'
import type { SettingDocument } from '../../../Database/Models/SettingsModel'
import { CheckboxComponent } from '../../UI/Components/CheckboxComponent'
import { DropdownComponent } from '../../UI/Components/DropdownComponent'
import { log, error, parseHTML, cleanupHTML } from '../../Common/utils'
import { NumberComponent } from '../../UI/Components/NumberComponent'
import { ColorComponent } from '../../UI/Components/ColorComponent'
import type { UISettingsGroup } from '../SettingsManager'
import type Publisher from '../../Common/Publisher'
import { CHANGELOG } from '../../../changelog'

export default class SettingsModal extends AbstractModal {
	private panelsEl?: HTMLElement
	private sidebarEl?: HTMLElement
	private sidebarBtnEl?: HTMLElement

	constructor(
		private rootEventBus: Publisher,
		private settingsOpts: { uiSettings: UISettingsGroup[]; settingsMap: Map<string, any> }
	) {
		const geometry: ModalGeometry = {
			position: 'center'
		}

		super('settings', geometry)
	}

	init() {
		super.init()
		return this
	}

	render() {
		super.render()

		log('Rendered settings modal..')

		const uiSettings = this.settingsOpts.uiSettings
		const settingsMap = this.settingsOpts.settingsMap
		const modalBodyEl = this.modalBodyEl

		const windowWidth = window.innerWidth

		const hasUpdateAvailable = settingsMap.get('global.shared.app.update_available')

		// Add version number to modal header
		const modalHeaderEl = this.modalHeaderBodyEl

		if (hasUpdateAvailable) {
			modalHeaderEl.prepend(
				parseHTML(
					`<span class="ntv__modal__version">v${APP_VERSION}</span><span>|</span><span class="ntv__modal__update-available">Update available</span><button class="ntv__modal__update-btn ntv__button">Update now</button>`
				)
			)
		} else {
			modalHeaderEl.prepend(parseHTML(`<span class="ntv__modal__version">v${APP_VERSION}</span>`))
		}

		modalHeaderEl.prepend(
			parseHTML(
				`<svg class="ntv__modal__logo" alt="NipahTV" width="32" height="32" viewBox="0 0 16 16" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg"><path style="opacity:1;fill:#ff3e64;fill-opacity:1;fill-rule:nonzero;stroke-width:0.023423" d="M 0.0045448,15.994522 0.00653212,7.0100931 C 0.00268662,6.4657282 0.56985346,5.2666906 1.6344369,4.714763 2.2713742,4.3845464 2.837577,4.2734929 3.8954568,4.2515817 4.9164087,4.2304326 5.4269836,4.4338648 5.61042,4.5236104 6.1140039,4.7499277 6.6375815,5.2244865 6.7816227,5.4288944 l 4.5552313,6.6637346 c 0.270458,0.343536 0.601629,0.565661 0.949354,0.529787 0.293913,-0.02339 0.449771,-0.268141 0.45106,-0.491161 l 0.0031,-9.2329087 -12.73699293,6.478e-4 4.453e-5,-2.8976667 15.9946434,2.145e-4 -1.11e-4,13.0844041 c -0.0057,0.149032 -0.09913,1.190976 -1.067016,2.026055 -0.866438,0.807769 -2.342194,0.87905 -2.342194,0.87905 -0.620946,0.0088 -1.091187,0.02361 -1.441943,-0.04695 -0.581657,-0.148437 -0.833883,-0.27401 -1.315459,-0.607888 -0.4222398,-0.311805 -0.7037358,-0.678791 -0.9410734,-0.987827 0,0 -1.1204546,-1.801726 -1.931821,-2.982711 C 6.3363366,10.413177 5.2823578,8.9426183 4.7672147,8.2745095 4.375011,7.7288473 4.102008,7.6101039 3.9558506,7.5598495 3.7999133,7.5101456 3.6283732,7.55479 3.4962961,7.6097361 3.3794655,7.6629412 3.2800176,7.7609522 3.2623448,7.8936439 l 7.879e-4,8.1018591 z"/></svg>`
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
		for (const category of uiSettings) {
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
		for (const category of uiSettings) {
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
								<h3>${change.version} <span>(${change.date})</span></h3>
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
								<h3>${group.label}</h3>
								${group.description ? `<p>${group.description}</p>` : ''}
							</div>
						</div>`
						),
						true
					)
					subCategoryPanelEl.append(groupEl)

					for (const setting of group.children) {
						const settingId = `global.shared.${setting.key}`

						let settingComponent: any
						let settingValue = settingsMap.get(settingId)
						if (typeof settingValue === 'undefined') settingValue = setting.default || null

						switch (setting.type) {
							case 'checkbox':
								settingComponent = new CheckboxComponent(settingId, setting.label, settingValue)
								break
							case 'color':
								settingComponent = new ColorComponent(settingId, setting.label, settingValue)
								break
							case 'dropdown':
								settingComponent = new DropdownComponent(
									settingId,
									setting.label,
									setting.options,
									settingValue
								)
								break
							case 'stepped_slider':
								settingComponent = new SteppedInputSliderLabeledComponent(
									setting.labels,
									setting.steps,
									setting.label,
									settingValue
								)
								break
							case 'number':
								settingComponent = new NumberComponent(
									settingId,
									setting.label,
									settingValue,
									setting.min,
									setting.max,
									setting.step
								)
								break
							default:
								error(`No component found for setting,`, setting)
								continue
						}

						settingComponent?.init()

						groupEl.append(settingComponent.element)
						settingComponent.addEventListener('change', () => {
							const value = settingComponent.getValue()
							this.eventTarget.dispatchEvent(
								new CustomEvent('setting_change', {
									detail: <SettingDocument>{
										id: settingId,
										platformId: 'global',
										channelId: 'shared',
										key: setting.key,
										value
									}
								})
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

		// On update now button click
		this.modalHeaderBodyEl.querySelector('.ntv__modal__update-btn')?.addEventListener('click', () => {
			this.rootEventBus.publish('ntv.app.update')
		})
	}
}
