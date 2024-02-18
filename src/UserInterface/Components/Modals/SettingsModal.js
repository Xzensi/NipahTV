import { AbstractModal } from './AbstractModal'
import { CheckboxComponent } from '../CheckboxComponent'
import { ColorComponent } from '../ColorComponent'
import { log, error } from '../../../utils'
import { DropdownComponent } from '../DropdownComponent'

export class SettingsModal extends AbstractModal {
	constructor(eventBus, settingsOpts) {
		super('settings')

		this.eventBus = eventBus
		this.settingsOpts = settingsOpts
	}

	init() {
		super.init()
	}

	render() {
		super.render()

		log('Rendering settings modal..')

		const sharedSettings = this.settingsOpts.sharedSettings
		const settingsMap = this.settingsOpts.settingsMap
		const $modalBody = this.$modalBody

		const $panels = $(`<div class="nipah__settings-modal__panels"></div>`)
		this.$panels = $panels

		const $sidebar = $(`
			<div class="nipah__settings-modal__sidebar">
				<ul></ul>
			</div>
		`)
		this.$sidebar = $sidebar
		const $sidebarList = $sidebar.find('ul')

		// Render navigation sidebar
		// Category > Subcategory > Group > Setting
		for (const category of sharedSettings) {
			const $category = $(`
				<li class="nipah__settings-modal__category">
					<span>${category.label}</span>
					<ul></ul>
				</li>
			`)

			const $categoryList = $category.find('ul')
			$sidebarList.append($category)

			for (const subCategory of category.children) {
				const categoryId = `${category.label.toLowerCase()}.${subCategory.label.toLowerCase()}`
				const $subCategory = $(`
					<li data-panel="${categoryId}" class="nipah__settings-modal__sub-category">
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
					`<div data-panel="${categoryId}" class="nipah__settings-modal__panel" style="display: none"></div>`
				)
				$panels.append($subCategoryPanel)

				for (const group of subCategory.children) {
					const $group = $(`<div class="nipah__settings__group"></div>`)
					$subCategoryPanel.append($group)

					for (const setting of group.children) {
						let settingComponent
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
							default:
								error(`No component found for setting type: ${setting.type}`)
								continue
						}

						settingComponent.init()

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
		$panels.find('.nipah__settings-modal__panel').first().show()

		$modalBody.append($sidebar)
		$modalBody.append($panels)
	}

	getSettingElement(setting) {}

	attachEventHandlers() {
		super.attachEventHandlers()

		// Sidebar navigation
		$('.nipah__settings-modal__sub-category', this.$sidebar).on('click', evt => {
			const panelId = $(evt.currentTarget).data('panel')

			$('.nipah__settings-modal__panel', this.$panels).hide()
			$(`[data-panel="${panelId}"]`, this.$panels).show()
		})
	}
}
