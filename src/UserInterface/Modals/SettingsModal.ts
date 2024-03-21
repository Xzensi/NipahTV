import { CheckboxComponent } from '../Components/CheckboxComponent'
import { DropdownComponent } from '../Components/DropdownComponent'
import { NumberComponent } from '../Components/NumberComponent'
import { ColorComponent } from '../Components/ColorComponent'
import { Publisher } from '../../Classes/Publisher'
import { AbstractModal } from './AbstractModal'
import { log, error } from '../../utils'

export class SettingsModal extends AbstractModal {
	eventBus: Publisher
	settingsOpts: any
	$panels?: JQuery<HTMLElement>
	$sidebar?: JQuery<HTMLElement>

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
		const $modalBody = this.$modalBody

		const $panels = $(`<div class="ntv__settings-modal__panels"></div>`)
		this.$panels = $panels

		const $sidebar = $(`
			<div class="ntv__settings-modal__sidebar">
				<ul></ul>
			</div>
		`)
		this.$sidebar = $sidebar
		const $sidebarList = $sidebar.find('ul')

		// Render navigation sidebar
		// Category > Subcategory > Group > Setting
		for (const category of sharedSettings) {
			const $category = $(`
				<li class="ntv__settings-modal__category">
					<span>${category.label}</span>
					<ul></ul>
				</li>
			`)

			const $categoryList = $category.find('ul')
			$sidebarList.append($category)

			for (const subCategory of category.children) {
				const categoryId = `${category.label.toLowerCase()}.${subCategory.label.toLowerCase()}`
				const $subCategory = $(`
					<li data-panel="${categoryId}" class="ntv__settings-modal__sub-category">
						<span>${subCategory.label}</span>
					</li>
				`)

				$categoryList.append($subCategory)
			}
		}

		// Render settings panels
		// Category > Subcategory > Group > Setting
		for (const category of sharedSettings) {
			for (const subCategory of category.children) {
				const categoryId = `${category.label.toLowerCase()}.${subCategory.label.toLowerCase()}`
				const $subCategoryPanel = $(
					`<div data-panel="${categoryId}" class="ntv__settings-modal__panel" style="display: none"></div>`
				)
				$panels.append($subCategoryPanel)

				for (const group of subCategory.children) {
					const $group = $(
						`<div class="ntv__settings-modal__group">
							<div class="ntv__settings-modal__group-header">
								<h4>${group.label}</h4>
								${group.description ? `<p>${group.description}</p>` : ''}
							</div>
						</div>`
					)
					$subCategoryPanel.append($group)

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

						$group.append(settingComponent.$element)
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
		$panels.find(`[data-panel="${defaultPanel}]"`).show()
		$sidebar.find(`[data-panel="${defaultPanel}"]`).addClass('ntv__settings-modal__sub-category--active')

		$modalBody?.append($sidebar)
		$modalBody?.append($panels)
	}

	getSettingElement(setting: string) {}

	attachEventHandlers() {
		super.attachEventHandlers()

		// Sidebar navigation
		$('.ntv__settings-modal__sub-category', this.$sidebar).on('click', evt => {
			const panelId = $(evt.currentTarget).data('panel')

			$('.ntv__settings-modal__sub-category', this.$sidebar).removeClass(
				'ntv__settings-modal__sub-category--active'
			)
			$(evt.currentTarget).addClass('ntv__settings-modal__sub-category--active')

			$('.ntv__settings-modal__panel', this.$panels).hide()
			$(`[data-panel="${panelId}"]`, this.$panels).show()
		})
	}
}
