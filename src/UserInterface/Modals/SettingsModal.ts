import type { Publisher } from '../../Classes/Publisher'
import { CheckboxComponent } from '../Components/CheckboxComponent'
import { DropdownComponent } from '../Components/DropdownComponent'
import { NumberComponent } from '../Components/NumberComponent'
import { ColorComponent } from '../Components/ColorComponent'
import { AbstractModal } from './AbstractModal'
import { log, error, parseHTML, cleanupHTML } from '../../utils'

export class SettingsModal extends AbstractModal {
	eventBus: Publisher
	settingsOpts: any

	panelsEl?: HTMLElement
	sidebarEl?: HTMLElement

	constructor(eventBus: Publisher, settingsOpts: any) {
		super('settings')

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

		this.panelsEl = parseHTML(`<div class="ntv__settings-modal__panels"></div>`, true) as HTMLElement

		this.sidebarEl = parseHTML(
			cleanupHTML(`<div class="ntv__settings-modal__sidebar">
							<ul></ul>
						</div>`),
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
				this.panelsEl.appendChild(subCategoryPanelEl)

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

						groupEl.append(settingComponent.$element[0])
						settingComponent.event.addEventListener('change', () => {
							const value = settingComponent.getValue()
							this.event.dispatchEvent(
								new CustomEvent('setting_change', { detail: { id: setting.id, value } })
							)
						})
					}
				}
			}
		}

		// Show first panel
		const defaultPanel = 'chat.appearance'
		this.panelsEl.querySelector(`[data-panel="${defaultPanel}"]`)?.setAttribute('style', 'display: block')
		this.sidebarEl
			.querySelector(`[data-panel="${defaultPanel}"]`)
			?.classList.add('ntv__settings-modal__sub-category--active')

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
	}
}
